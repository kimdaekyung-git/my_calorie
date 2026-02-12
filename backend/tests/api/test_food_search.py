"""음식 검색 API 테스트 (RED 상태 - 아직 구현 없음)"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_search_food_returns_results():
    """음식 검색 시 결과 반환"""
    response = client.get("/api/v1/foods", params={"q": "김치찌개"})
    assert response.status_code == 200
    body = response.json()
    assert "data" in body
    assert "meta" in body
    assert isinstance(body["data"], list)
    assert len(body["data"]) > 0

    item = body["data"][0]
    assert "name" in item
    assert "calories" in item
    assert "serving_size" in item
    assert "nutrients" in item
    assert "carbs" in item["nutrients"]
    assert "protein" in item["nutrients"]
    assert "fat" in item["nutrients"]


def test_search_food_empty_query():
    """빈 검색어 시 400 에러"""
    response = client.get("/api/v1/foods", params={"q": ""})
    assert response.status_code == 400


def test_search_food_no_results():
    """검색 결과 없을 때 빈 배열"""
    response = client.get("/api/v1/foods", params={"q": "존재하지않는음식xyz"})
    assert response.status_code == 200
    body = response.json()
    assert body["data"] == []
    assert body["meta"]["total"] == 0


def test_search_food_with_limit():
    """limit 파라미터 적용"""
    response = client.get("/api/v1/foods", params={"q": "김치", "limit": 3})
    assert response.status_code == 200
    body = response.json()
    assert len(body["data"]) <= 3


def test_search_food_response_format():
    """응답 형식이 계약과 일치"""
    response = client.get("/api/v1/foods", params={"q": "밥"})
    assert response.status_code == 200
    body = response.json()
    assert "data" in body
    assert "meta" in body
    assert "total" in body["meta"]
    assert "source" in body["meta"]
