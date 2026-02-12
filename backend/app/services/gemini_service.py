"""Gemini Vision API를 사용한 음식 사진 분석 서비스"""

import asyncio
import json
import logging
import os

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.0-flash"

FOOD_ANALYSIS_PROMPT = """이 사진에 있는 음식을 모두 식별해주세요.

규칙:
1. 각 음식의 한국어 이름을 반환하세요.
2. 식품영양성분 데이터베이스에서 검색 가능한 공식 음식 이름을 사용하세요.
3. 반찬, 밥, 국/찌개, 메인 요리를 모두 개별적으로 식별하세요.
4. 음식이 아닌 것은 제외하세요.
5. 확신도를 high/medium/low로 표시하세요.

반드시 아래 JSON 형식으로만 응답하세요:
{"foods": [{"name": "음식이름", "confidence": "high"}]}"""


def _parse_gemini_response(text: str) -> list[dict]:
    """Gemini 응답 텍스트에서 JSON을 파싱합니다.

    마크다운 코드블록(```json ... ```)으로 감싸진 경우도 처리합니다.
    """
    cleaned = text.strip()

    # 마크다운 코드블록 제거
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        # 첫 줄(```json)과 마지막 줄(```) 제거
        lines = [l for l in lines if not l.strip().startswith("```")]
        cleaned = "\n".join(lines).strip()

    parsed = json.loads(cleaned)
    foods = parsed.get("foods", [])

    # 유효성 검증
    valid_confidences = {"high", "medium", "low"}
    result = []
    for food in foods:
        name = food.get("name", "").strip()
        confidence = food.get("confidence", "medium")
        if name and confidence in valid_confidences:
            result.append({"name": name, "confidence": confidence})

    return result


def _call_gemini_sync(image_bytes: bytes, mime_type: str) -> list[dict]:
    """동기적으로 Gemini Vision API를 호출합니다."""
    import google.generativeai as genai

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(GEMINI_MODEL)

    response = model.generate_content(
        [
            FOOD_ANALYSIS_PROMPT,
            {"mime_type": mime_type, "data": image_bytes},
        ]
    )

    return _parse_gemini_response(response.text)


async def analyze_food_image(image_bytes: bytes, mime_type: str) -> list[dict]:
    """음식 사진을 분석하여 인식된 음식 목록을 반환합니다.

    Returns:
        [{"name": "김치찌개", "confidence": "high"}, ...]
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY가 설정되지 않았습니다")

    return await asyncio.to_thread(_call_gemini_sync, image_bytes, mime_type)
