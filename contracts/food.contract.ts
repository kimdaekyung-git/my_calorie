// 음식 검색 API 계약
// BE (Pydantic) / FE (TypeScript) 양측에서 이 계약을 준수해야 합니다.

import type { ApiResponse } from './types';

// --- Request ---

export interface FoodSearchRequest {
  query: string;
  limit?: number; // default: 10
}

// --- Response ---

export interface Nutrients {
  carbs: number;   // 탄수화물 (g)
  protein: number; // 단백질 (g)
  fat: number;     // 지방 (g)
}

export interface FoodItem {
  name: string;
  calories: number;       // kcal
  serving_size: string;   // e.g. "1인분 (200g)"
  nutrients: Nutrients;
  api_id?: string;        // 외부 API 식별자
}

export type FoodSearchResponse = ApiResponse<FoodItem[]>;

// --- 사진 분석 ---

export type Confidence = 'high' | 'medium' | 'low';

export interface DetectedFood {
  detected_name: string;
  confidence: Confidence;
  matched_foods: FoodItem[];
}

export interface FoodAnalysisMeta {
  total_detected: number;
  model: string;
}

export interface FoodAnalysisResponse {
  data: DetectedFood[];
  meta: FoodAnalysisMeta;
}

// --- API Endpoints ---
// GET  /api/v1/foods?q={query}&limit={limit}
// POST /api/v1/foods/analyze-image  (multipart/form-data, field: image)
// 성공: 200 + FoodSearchResponse | FoodAnalysisResponse
// 빈 검색어: 400
// 결과 없음: 200 + { data: [], meta: { total: 0 } }
