import { db } from '../db';
import type { MealRecord } from '../types/meal';

type MealInput = Omit<MealRecord, 'id' | 'created_at' | 'updated_at'>;

export async function addMeal(input: MealInput): Promise<number> {
  const now = new Date();
  const id = await db.meals.add({
    ...input,
    created_at: now,
    updated_at: now,
  });
  return id as number;
}

export async function getMealsByDate(date: string): Promise<MealRecord[]> {
  return db.meals.where('date').equals(date).toArray();
}

export async function updateMeal(
  id: number,
  data: Partial<MealRecord>
): Promise<void> {
  await db.meals.update(id, { ...data, updated_at: new Date() });
}

export async function deleteMeal(id: number): Promise<void> {
  await db.meals.delete(id);
}

export async function getTodayCalories(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const meals = await db.meals.where('date').equals(today).toArray();
  return meals.reduce((sum, m) => sum + m.calories * m.serving_size, 0);
}
