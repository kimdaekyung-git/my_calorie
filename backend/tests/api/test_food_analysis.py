"""음식 사진 분석 API 테스트"""

import io
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _make_image(content_type: str = "image/jpeg", size: int = 1024) -> tuple[io.BytesIO, str]:
    """테스트용 더미 이미지 파일 생성"""
    return io.BytesIO(b"\xff\xd8\xff" + b"\x00" * size), content_type


class TestAnalyzeImageValidation:
    """이미지 유효성 검사 테스트"""

    def test_rejects_unsupported_image_type(self):
        buf = io.BytesIO(b"not an image")
        response = client.post(
            "/api/v1/foods/analyze-image",
            files={"image": ("test.txt", buf, "text/plain")},
        )
        assert response.status_code == 400
        assert "지원하지 않는 이미지 형식" in response.json()["detail"]

    def test_rejects_oversized_image(self):
        big_buf = io.BytesIO(b"\xff\xd8\xff" + b"\x00" * (11 * 1024 * 1024))
        response = client.post(
            "/api/v1/foods/analyze-image",
            files={"image": ("big.jpg", big_buf, "image/jpeg")},
        )
        assert response.status_code == 400
        assert "10MB" in response.json()["detail"]


class TestAnalyzeImageSuccess:
    """정상 분석 테스트"""

    @patch("app.routes.food.analyze_food_image", new_callable=AsyncMock)
    @patch("app.routes.food.search_foods", new_callable=AsyncMock)
    def test_returns_detected_foods_with_matches(self, mock_search, mock_vision):
        mock_vision.return_value = [
            {"name": "김치찌개", "confidence": "high"},
            {"name": "흰쌀밥", "confidence": "high"},
        ]
        mock_search.side_effect = [
            (
                [{"name": "김치찌개", "calories": 150, "serving_size": "1인분 (300g)",
                  "nutrients": {"carbs": 10, "protein": 12, "fat": 7}, "api_id": "001"}],
                1,
                "local",
            ),
            (
                [{"name": "흰쌀밥", "calories": 300, "serving_size": "1공기 (210g)",
                  "nutrients": {"carbs": 65, "protein": 5, "fat": 0.5}, "api_id": "002"}],
                1,
                "local",
            ),
        ]

        buf, ct = _make_image()
        response = client.post(
            "/api/v1/foods/analyze-image",
            files={"image": ("food.jpg", buf, ct)},
        )

        assert response.status_code == 200
        body = response.json()
        assert len(body["data"]) == 2
        assert body["data"][0]["detected_name"] == "김치찌개"
        assert body["data"][0]["confidence"] == "high"
        assert len(body["data"][0]["matched_foods"]) == 1
        assert body["data"][0]["matched_foods"][0]["name"] == "김치찌개"
        assert body["meta"]["total_detected"] == 2
        assert body["meta"]["model"] == "gpt-4o"

    @patch("app.routes.food.analyze_food_image", new_callable=AsyncMock)
    @patch("app.routes.food.search_foods", new_callable=AsyncMock)
    def test_returns_empty_matches_when_search_fails(self, mock_search, mock_vision):
        mock_vision.return_value = [{"name": "알수없는음식", "confidence": "low"}]
        mock_search.side_effect = Exception("API error")

        buf, ct = _make_image()
        response = client.post(
            "/api/v1/foods/analyze-image",
            files={"image": ("food.jpg", buf, ct)},
        )

        assert response.status_code == 200
        body = response.json()
        assert len(body["data"]) == 1
        assert body["data"][0]["matched_foods"] == []

    @patch("app.routes.food.analyze_food_image", new_callable=AsyncMock)
    def test_returns_502_when_gemini_fails(self, mock_vision):
        mock_vision.side_effect = RuntimeError("OpenAI unavailable")

        buf, ct = _make_image()
        response = client.post(
            "/api/v1/foods/analyze-image",
            files={"image": ("food.jpg", buf, ct)},
        )

        assert response.status_code == 502
        assert "AI 분석 서비스" in response.json()["detail"]

    @patch("app.routes.food.analyze_food_image", new_callable=AsyncMock)
    def test_returns_500_when_api_key_missing(self, mock_vision):
        mock_vision.side_effect = ValueError("OPENAI_API_KEY가 설정되지 않았습니다")

        buf, ct = _make_image()
        response = client.post(
            "/api/v1/foods/analyze-image",
            files={"image": ("food.jpg", buf, ct)},
        )

        assert response.status_code == 500


class TestGeminiResponseParsing:
    """Gemini 응답 파싱 테스트"""

    def test_parses_plain_json(self):
        from app.services.gemini_service import _parse_response

        text = '{"foods": [{"name": "김치찌개", "confidence": "high"}]}'
        result = _parse_response(text)
        assert len(result) == 1
        assert result[0]["name"] == "김치찌개"

    def test_parses_markdown_wrapped_json(self):
        from app.services.gemini_service import _parse_response

        text = '```json\n{"foods": [{"name": "비빔밥", "confidence": "medium"}]}\n```'
        result = _parse_response(text)
        assert len(result) == 1
        assert result[0]["name"] == "비빔밥"

    def test_filters_invalid_confidence(self):
        from app.services.gemini_service import _parse_response

        text = '{"foods": [{"name": "라면", "confidence": "very_high"}]}'
        result = _parse_response(text)
        assert len(result) == 0

    def test_filters_empty_name(self):
        from app.services.gemini_service import _parse_response

        text = '{"foods": [{"name": "", "confidence": "high"}]}'
        result = _parse_response(text)
        assert len(result) == 0
