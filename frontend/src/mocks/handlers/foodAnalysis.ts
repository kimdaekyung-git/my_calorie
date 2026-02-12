import { http, HttpResponse } from 'msw';
import { mockFoods } from '../data/food';
import type { FoodAnalysisResponse } from '../../../contracts/food.contract';
import { API_BASE } from '../../config';

export const foodAnalysisHandlers = [
  http.post(`${API_BASE}/api/v1/foods/analyze-image`, async () => {
    // 목 응답: 김치찌개, 비빔밥을 인식한 것처럼 반환
    const response: FoodAnalysisResponse = {
      data: [
        {
          detected_name: '김치찌개',
          confidence: 'high',
          matched_foods: mockFoods.filter((f) => f.name.includes('김치찌개')),
        },
        {
          detected_name: '비빔밥',
          confidence: 'medium',
          matched_foods: mockFoods.filter((f) => f.name.includes('비빔밥')),
        },
      ],
      meta: { total_detected: 2, model: 'gemini-2.0-flash' },
    };

    return HttpResponse.json(response);
  }),
];
