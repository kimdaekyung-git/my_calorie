"""음식 검색 서비스 - 공공데이터포털 식품영양성분DB API 연동 + 로컬 폴백"""

import os
import logging

import httpx

logger = logging.getLogger(__name__)

FOOD_API_KEY = os.getenv("FOOD_API_KEY", "")
FOOD_API_URL = "https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02/getFoodNtrCpntDbInq02"

# --- 외부 API ---


def _parse_nutrient(value: str | None) -> float:
    """API 응답의 영양소 값을 float로 변환. 빈 값이면 0.0 반환."""
    if not value or value.strip() in ("", "-"):
        return 0.0
    try:
        return round(float(value), 1)
    except (ValueError, TypeError):
        return 0.0


def _map_api_row(row: dict) -> dict:
    """공공데이터포털 식품영양성분DB 행을 내부 포맷으로 변환."""
    serving = row.get("SERVING_SIZE", "100g")
    return {
        "name": row.get("FOOD_NM_KR", ""),
        "calories": _parse_nutrient(row.get("AMT_NUM1")),
        "serving_size": serving,
        "nutrients": {
            "carbs": _parse_nutrient(row.get("AMT_NUM7")),
            "protein": _parse_nutrient(row.get("AMT_NUM3")),
            "fat": _parse_nutrient(row.get("AMT_NUM4")),
        },
        "api_id": row.get("FOOD_CD", ""),
    }


async def search_foods_api(query: str, limit: int = 10) -> tuple[list[dict], int]:
    """공공데이터포털 식품영양성분DB API로 음식을 검색합니다."""
    params = {
        "serviceKey": FOOD_API_KEY,
        "FOOD_NM_KR": query,
        "pageNo": "1",
        "numOfRows": str(limit),
        "type": "json",
    }

    async with httpx.AsyncClient(timeout=5.0) as client:
        response = await client.get(FOOD_API_URL, params=params)
        response.raise_for_status()
        data = response.json()

    header = data.get("header", {})
    result_code = header.get("resultCode", "")

    if result_code != "00":
        raise ValueError(f"API error: {result_code} - {header.get('resultMsg', '')}")

    body = data.get("body", {})
    total = int(body.get("totalCount", 0))
    rows = body.get("items", [])

    if not rows:
        return [], 0

    items = [_map_api_row(row) for row in rows]
    # 빈 이름 또는 칼로리 0인 항목 필터
    items = [item for item in items if item["name"] and item["calories"] > 0]

    return items, total


# --- 로컬 폴백 데이터 ---

LOCAL_FOODS: list[dict] = [
    {"name": "김치찌개", "calories": 150, "serving_size": "1인분 (300g)", "nutrients": {"carbs": 10.0, "protein": 12.0, "fat": 7.0}, "api_id": "local_001"},
    {"name": "된장찌개", "calories": 120, "serving_size": "1인분 (300g)", "nutrients": {"carbs": 8.0, "protein": 10.0, "fat": 5.0}, "api_id": "local_002"},
    {"name": "비빔밥", "calories": 550, "serving_size": "1인분 (400g)", "nutrients": {"carbs": 75.0, "protein": 18.0, "fat": 15.0}, "api_id": "local_003"},
    {"name": "삼겹살 (구이)", "calories": 330, "serving_size": "1인분 (200g)", "nutrients": {"carbs": 0.0, "protein": 25.0, "fat": 28.0}, "api_id": "local_004"},
    {"name": "샐러드", "calories": 80, "serving_size": "1인분 (150g)", "nutrients": {"carbs": 8.0, "protein": 3.0, "fat": 4.0}, "api_id": "local_005"},
    {"name": "흰쌀밥", "calories": 300, "serving_size": "1공기 (210g)", "nutrients": {"carbs": 65.0, "protein": 5.0, "fat": 0.5}, "api_id": "local_006"},
    {"name": "현미밥", "calories": 280, "serving_size": "1공기 (210g)", "nutrients": {"carbs": 60.0, "protein": 6.0, "fat": 1.5}, "api_id": "local_007"},
    {"name": "김치", "calories": 15, "serving_size": "1접시 (50g)", "nutrients": {"carbs": 2.0, "protein": 1.0, "fat": 0.3}, "api_id": "local_008"},
    {"name": "김치볶음밥", "calories": 450, "serving_size": "1인분 (350g)", "nutrients": {"carbs": 65.0, "protein": 12.0, "fat": 15.0}, "api_id": "local_009"},
    {"name": "계란후라이", "calories": 90, "serving_size": "1개 (50g)", "nutrients": {"carbs": 0.5, "protein": 6.0, "fat": 7.0}, "api_id": "local_010"},
    {"name": "라면", "calories": 500, "serving_size": "1인분 (550g)", "nutrients": {"carbs": 70.0, "protein": 10.0, "fat": 18.0}, "api_id": "local_011"},
    {"name": "불고기", "calories": 280, "serving_size": "1인분 (200g)", "nutrients": {"carbs": 12.0, "protein": 28.0, "fat": 14.0}, "api_id": "local_012"},
    {"name": "떡볶이", "calories": 330, "serving_size": "1인분 (250g)", "nutrients": {"carbs": 60.0, "protein": 8.0, "fat": 8.0}, "api_id": "local_013"},
    {"name": "닭가슴살", "calories": 165, "serving_size": "1인분 (150g)", "nutrients": {"carbs": 0.0, "protein": 31.0, "fat": 3.5}, "api_id": "local_014"},
    {"name": "바나나", "calories": 93, "serving_size": "1개 (100g)", "nutrients": {"carbs": 23.0, "protein": 1.0, "fat": 0.3}, "api_id": "local_015"},
]


def search_foods_local(query: str, limit: int = 10) -> tuple[list[dict], int]:
    """로컬 내장 데이터에서 검색합니다."""
    results = [food for food in LOCAL_FOODS if query in food["name"]]
    total = len(results)
    return results[:limit], total


# --- 통합 검색 함수 ---


async def search_foods(query: str, limit: int = 10) -> tuple[list[dict], int, str]:
    """음식 검색. 외부 API 우선, 실패 시 로컬 폴백. (결과, 총수, 소스) 반환."""
    if FOOD_API_KEY:
        try:
            results, total = await search_foods_api(query, limit)
            return results, total, "data_go_kr"
        except Exception as e:
            logger.warning("외부 API 호출 실패, 로컬 폴백 사용: %s", e)

    results, total = search_foods_local(query, limit)
    return results, total, "local"
