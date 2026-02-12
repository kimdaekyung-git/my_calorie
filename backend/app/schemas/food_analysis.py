"""음식 사진 분석 API 스키마 - contracts/food.contract.ts와 동기화"""

from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.food import FoodItem


class DetectedFood(BaseModel):
    detected_name: str = Field(description="AI가 인식한 음식 이름")
    confidence: Literal["high", "medium", "low"]
    matched_foods: list[FoodItem] = Field(default_factory=list)


class FoodAnalysisMeta(BaseModel):
    total_detected: int
    model: str = "gpt-4o"


class FoodAnalysisResponse(BaseModel):
    data: list[DetectedFood]
    meta: FoodAnalysisMeta
