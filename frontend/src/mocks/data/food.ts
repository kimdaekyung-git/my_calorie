import type { FoodItem } from '../../../contracts/food.contract';

export const mockFoods: FoodItem[] = [
  {
    name: '김치찌개',
    calories: 150,
    serving_size: '1인분 (200g)',
    nutrients: { carbs: 10, protein: 8, fat: 5 },
    api_id: 'food_001',
  },
  {
    name: '된장찌개',
    calories: 120,
    serving_size: '1인분 (200g)',
    nutrients: { carbs: 8, protein: 7, fat: 4 },
    api_id: 'food_002',
  },
  {
    name: '비빔밥',
    calories: 500,
    serving_size: '1인분 (400g)',
    nutrients: { carbs: 70, protein: 15, fat: 12 },
    api_id: 'food_003',
  },
  {
    name: '삼겹살',
    calories: 330,
    serving_size: '1인분 (150g)',
    nutrients: { carbs: 0, protein: 17, fat: 29 },
    api_id: 'food_004',
  },
  {
    name: '샐러드',
    calories: 80,
    serving_size: '1인분 (150g)',
    nutrients: { carbs: 10, protein: 3, fat: 2 },
    api_id: 'food_005',
  },
];
