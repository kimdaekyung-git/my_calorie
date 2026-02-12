"""음식 검색 API 라우터"""

import asyncio
import logging

from fastapi import APIRouter, Query, HTTPException, UploadFile, File

from app.schemas.food import FoodItem, FoodSearchMeta, FoodSearchResponse, Nutrients
from app.schemas.food_analysis import (
    DetectedFood,
    FoodAnalysisMeta,
    FoodAnalysisResponse,
)
from app.services.food_service import search_foods
from app.services.gemini_service import analyze_food_image, OPENAI_MODEL

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1")

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB


@router.get("/foods", response_model=FoodSearchResponse)
async def search_food(
    q: str = Query(..., description="검색어"),
    limit: int = Query(10, ge=1, le=50, description="최대 결과 수"),
):
    if not q.strip():
        raise HTTPException(status_code=400, detail="검색어를 입력해주세요")

    results, total, source = await search_foods(q, limit)
    items = [
        FoodItem(
            name=r["name"],
            calories=r["calories"],
            serving_size=r["serving_size"],
            nutrients=Nutrients(**r["nutrients"]),
            api_id=r.get("api_id"),
        )
        for r in results
    ]
    return FoodSearchResponse(
        data=items,
        meta=FoodSearchMeta(total=total, source=source),
    )


def _to_food_items(results: list[dict]) -> list[FoodItem]:
    return [
        FoodItem(
            name=r["name"],
            calories=r["calories"],
            serving_size=r["serving_size"],
            nutrients=Nutrients(**r["nutrients"]),
            api_id=r.get("api_id"),
        )
        for r in results
    ]


@router.post("/foods/analyze-image", response_model=FoodAnalysisResponse)
async def analyze_food_photo(image: UploadFile = File(...)):
    # 이미지 타입 검증
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"지원하지 않는 이미지 형식입니다. 지원 형식: {', '.join(ALLOWED_IMAGE_TYPES)}",
        )

    # 이미지 크기 검증
    image_bytes = await image.read()
    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="이미지 크기가 10MB를 초과합니다",
        )

    # OpenAI Vision으로 음식 인식
    try:
        detected = await analyze_food_image(image_bytes, image.content_type)
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error("OpenAI API 호출 실패: %s", e)
        raise HTTPException(status_code=502, detail="AI 분석 서비스에 연결할 수 없습니다")

    # 인식된 음식명마다 기존 search_foods()로 병렬 검색
    async def search_for_food(food: dict) -> DetectedFood:
        try:
            results, _total, _source = await search_foods(food["name"], limit=5)
            matched = _to_food_items(results)
        except Exception as e:
            logger.warning("음식 검색 실패 (%s): %s", food["name"], e)
            matched = []
        return DetectedFood(
            detected_name=food["name"],
            confidence=food["confidence"],
            matched_foods=matched,
        )

    detected_foods = await asyncio.gather(
        *[search_for_food(f) for f in detected]
    )

    return FoodAnalysisResponse(
        data=list(detected_foods),
        meta=FoodAnalysisMeta(
            total_detected=len(detected_foods),
            model=OPENAI_MODEL,
        ),
    )
