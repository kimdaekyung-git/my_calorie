export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type FoodSource = 'api' | 'manual';

export interface MealRecord {
  id?: string;
  date: string;          // "YYYY-MM-DD"
  meal_type: MealType;
  food_name: string;
  calories: number;
  serving_size: number;  // 인분 수 (기본 1)
  carbs?: number;
  protein?: number;
  fat?: number;
  source: FoodSource;
  created_at: Date;
  updated_at: Date;
}

export interface FoodCache {
  id?: string;
  name: string;
  calories: number;
  carbs?: number;
  protein?: number;
  fat?: number;
  api_id?: string;
  use_count: number;
  last_used_at: Date;
}

export interface UserSettings {
  id: string;            // always "default"
  daily_calorie_goal: number;
  onboarding_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  snack: '간식',
};
