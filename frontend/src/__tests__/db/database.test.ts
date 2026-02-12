import { describe, it, expect, beforeEach } from 'vitest';
import { db, seedDefaults } from '../../db';

describe('HealthMateDB', () => {
  beforeEach(async () => {
    await db.meals.clear();
    await db.foodCache.clear();
    await db.settings.clear();
  });

  it('meals 테이블이 존재한다', () => {
    expect(db.meals).toBeDefined();
  });

  it('foodCache 테이블이 존재한다', () => {
    expect(db.foodCache).toBeDefined();
  });

  it('settings 테이블이 존재한다', () => {
    expect(db.settings).toBeDefined();
  });

  it('seedDefaults가 기본 설정값을 생성한다', async () => {
    await seedDefaults();
    const settings = await db.settings.get('default');
    expect(settings).toBeDefined();
    expect(settings!.daily_calorie_goal).toBe(2000);
    expect(settings!.onboarding_completed).toBe(false);
  });

  it('seedDefaults는 기존 설정이 있으면 덮어쓰지 않는다', async () => {
    await db.settings.put({
      id: 'default',
      daily_calorie_goal: 1500,
      onboarding_completed: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    await seedDefaults();
    const settings = await db.settings.get('default');
    expect(settings!.daily_calorie_goal).toBe(1500);
  });
});
