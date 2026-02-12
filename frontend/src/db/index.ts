import Dexie, { type Table } from 'dexie';
import type { MealRecord, FoodCache, UserSettings } from '../types/meal';

export class HealthMateDB extends Dexie {
  meals!: Table<MealRecord>;
  foodCache!: Table<FoodCache>;
  settings!: Table<UserSettings>;

  constructor() {
    super('healthmate');
    this.version(1).stores({
      meals: '++id, date, meal_type, [date+meal_type]',
      foodCache: '++id, name, use_count, last_used_at',
      settings: 'id',
    });
  }
}

export const db = new HealthMateDB();

/** 초기 설정값 시딩 (앱 최초 실행 시) */
export async function seedDefaults(): Promise<void> {
  const existing = await db.settings.get('default');
  if (!existing) {
    await db.settings.put({
      id: 'default',
      daily_calorie_goal: 2000,
      onboarding_completed: false,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }
}
