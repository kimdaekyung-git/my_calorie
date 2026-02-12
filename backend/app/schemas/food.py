"""음식 검색 API 스키마 - contracts/food.contract.ts와 동기화"""

from pydantic import BaseModel, Field


class Nutrients(BaseModel):
    carbs: float = Field(description="탄수화물 (g)")
    protein: float = Field(description="단백질 (g)")
    fat: float = Field(description="지방 (g)")


class FoodItem(BaseModel):
    name: str
    calories: float = Field(description="칼로리 (kcal)")
    serving_size: str = Field(description="예: 1인분 (200g)")
    nutrients: Nutrients
    api_id: str | None = None


class FoodSearchMeta(BaseModel):
    total: int
    source: str = "food_safety_korea"


class FoodSearchResponse(BaseModel):
    data: list[FoodItem]
    meta: FoodSearchMeta
