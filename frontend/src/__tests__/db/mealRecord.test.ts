/**
 * 식단 기록 CRUD 테스트 (RED 상태 - 아직 서비스 미구현)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../db';
import {
  addMeal,
  getMealsByDate,
  updateMeal,
  deleteMeal,
  getTodayCalories,
} from '../../services/mealService';
import type { MealRecord } from '../../types/meal';

describe('MealService CRUD', () => {
  beforeEach(async () => {
    await db.meals.clear();
    await db.foodCache.clear();
  });

  const sampleMeal: Omit<MealRecord, 'id' | 'created_at' | 'updated_at'> = {
    date: '2026-02-12',
    meal_type: 'lunch',
    food_name: '김치찌개',
    calories: 150,
    serving_size: 1,
    carbs: 10,
    protein: 8,
    fat: 5,
    source: 'api',
  };

  it('식단 기록을 추가할 수 있다', async () => {
    const id = await addMeal(sampleMeal);
    expect(id).toBeDefined();

    const record = await db.meals.get(id);
    expect(record).toBeDefined();
    expect(record!.food_name).toBe('김치찌개');
    expect(record!.calories).toBe(150);
  });

  it('날짜별로 식단을 조회할 수 있다', async () => {
    await addMeal(sampleMeal);
    await addMeal({ ...sampleMeal, meal_type: 'dinner', food_name: '비빔밥', calories: 500 });

    const meals = await getMealsByDate('2026-02-12');
    expect(meals).toHaveLength(2);
  });

  it('다른 날짜의 식단은 조회되지 않는다', async () => {
    await addMeal(sampleMeal);

    const meals = await getMealsByDate('2026-02-13');
    expect(meals).toHaveLength(0);
  });

  it('식단 기록을 수정할 수 있다', async () => {
    const id = await addMeal(sampleMeal);
    await updateMeal(id, { calories: 200, food_name: '김치찌개 (곱빼기)' });

    const record = await db.meals.get(id);
    expect(record!.calories).toBe(200);
    expect(record!.food_name).toBe('김치찌개 (곱빼기)');
  });

  it('식단 기록을 삭제할 수 있다', async () => {
    const id = await addMeal(sampleMeal);
    await deleteMeal(id);

    const record = await db.meals.get(id);
    expect(record).toBeUndefined();
  });

  it('오늘 총 칼로리를 계산할 수 있다', async () => {
    const today = new Date().toISOString().split('T')[0];
    await addMeal({ ...sampleMeal, date: today, calories: 150 });
    await addMeal({ ...sampleMeal, date: today, meal_type: 'dinner', calories: 500 });

    const total = await getTodayCalories();
    expect(total).toBe(650);
  });
});
