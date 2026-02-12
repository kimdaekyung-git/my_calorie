import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { db } from '../db';
import type { MealRecord, MealType } from '../types/meal';
import { MEAL_TYPE_LABELS } from '../types/meal';
import Calendar from '../components/Calendar';

function formatDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isToday(date: Date): boolean {
  const today = new Date();
  return toDateStr(date) === toDateStr(today);
}

interface DashboardProps {
  onAddMeal?: (date: Date) => void;
}

export default function Dashboard({ onAddMeal }: DashboardProps = {}) {
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [goal, setGoal] = useState(2000);
  const [loaded, setLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectedDateStr = toDateStr(selectedDate);

  useEffect(() => {
    async function load() {
      const [dateMeals, settings] = await Promise.all([
        db.meals.where('date').equals(selectedDateStr).toArray(),
        db.settings.get('default'),
      ]);
      setMeals(dateMeals);
      if (settings) setGoal(settings.daily_calorie_goal);
      setLoaded(true);
    }
    load();
  }, [selectedDateStr]);

  const totalCalories = meals.reduce(
    (sum, m) => sum + m.calories * m.serving_size,
    0
  );
  const progress = Math.min((totalCalories / goal) * 100, 100);

  const mealsByType = (type: MealType) =>
    meals.filter((m) => m.meal_type === type);

  const intakeLabel = isToday(selectedDate)
    ? '오늘 섭취'
    : `${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 섭취`;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 헤더 */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-lg font-semibold text-text-primary">
          {formatDate(selectedDate)}
        </h1>
      </div>

      {/* 달력 */}
      <Calendar selected={selectedDate} onSelect={setSelectedDate} />

      {/* 칼로리 진행률 */}
      <div className="mx-5 p-5 bg-surface rounded-2xl mb-5">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-xs text-text-secondary">{intakeLabel}</p>
            <p className="text-2xl font-bold text-text-primary">
              {totalCalories.toLocaleString()}
              <span className="text-sm font-normal text-text-secondary ml-1">
                kcal
              </span>
            </p>
          </div>
          <p className="text-sm text-text-secondary">
            / {goal.toLocaleString()} kcal
          </p>
        </div>
        <div className="w-full h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 식단 목록 */}
      {loaded && meals.length === 0 && (
        <p className="text-center text-sm text-text-secondary mt-8">
          기록된 식단이 없습니다
        </p>
      )}

      {loaded &&
        meals.length > 0 &&
        (['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map(
          (type) => {
            const typeMeals = mealsByType(type);
            if (typeMeals.length === 0) return null;
            return (
              <div key={type} className="mx-5 mb-4">
                <h2 className="text-sm font-semibold text-text-primary mb-2">
                  {MEAL_TYPE_LABELS[type]}
                </h2>
                <div className="space-y-2">
                  {typeMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex justify-between items-center px-4 py-3 bg-surface rounded-xl"
                    >
                      <span className="text-sm text-text-primary">
                        {meal.food_name}
                      </span>
                      <span className="text-sm text-text-secondary">
                        {(meal.calories * meal.serving_size).toLocaleString()}{' '}
                        kcal
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
        )}

      {/* FAB */}
      <button
        aria-label="식단 추가"
        onClick={() => onAddMeal?.(selectedDate)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-dark transition-colors"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
