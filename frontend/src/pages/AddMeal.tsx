import { useState } from 'react';
import { ArrowLeft, Search, Camera } from 'lucide-react';
import FoodSearch from '../components/meal/FoodSearch';
import PhotoCapture from '../components/meal/PhotoCapture';
import PhotoAnalysisResults from '../components/meal/PhotoAnalysisResults';
import Calendar from '../components/Calendar';
import { addMeal } from '../services/mealService';
import type { FoodItem, FoodAnalysisResponse } from '../../contracts/food.contract';
import type { MealType } from '../types/meal';
import { MEAL_TYPE_LABELS } from '../types/meal';

type InputMode = 'text' | 'photo';

interface AddMealProps {
  initialDate?: Date;
  onBack: () => void;
  onAdded: () => void;
}

export default function AddMeal({ initialDate, onBack, onAdded }: AddMealProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate ?? new Date());
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);
  const [servingSize, setServingSize] = useState(1);
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResponse | null>(null);

  const handleSelect = (food: FoodItem) => {
    setSelected(food);
  };

  const handleToggleFood = (food: FoodItem) => {
    setSelectedFoods((prev) => {
      const exists = prev.some((f) => f.name === food.name && f.api_id === food.api_id);
      if (exists) return prev.filter((f) => !(f.name === food.name && f.api_id === food.api_id));
      return [...prev, food];
    });
  };

  const totalCalories = selectedFoods.reduce((sum, f) => sum + f.calories, 0);

  const y = selectedDate.getFullYear();
  const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const d = String(selectedDate.getDate()).padStart(2, '0');
  const dateStr = `${y}-${m}-${d}`;

  const handleSave = async () => {
    // 사진 모드: 다중 선택 저장
    if (inputMode === 'photo' && selectedFoods.length > 0) {
      await Promise.all(
        selectedFoods.map((food) =>
          addMeal({
            date: dateStr,
            meal_type: mealType,
            food_name: food.name,
            calories: food.calories,
            serving_size: 1,
            carbs: food.nutrients.carbs,
            protein: food.nutrients.protein,
            fat: food.nutrients.fat,
            source: 'api',
          })
        )
      );
      onAdded();
      return;
    }

    // 텍스트 모드: 단일 선택 저장
    if (!selected) return;

    await addMeal({
      date: dateStr,
      meal_type: mealType,
      food_name: selected.name,
      calories: selected.calories,
      serving_size: servingSize,
      carbs: selected.nutrients.carbs,
      protein: selected.nutrients.protein,
      fat: selected.nutrients.fat,
      source: 'api',
    });

    onAdded();
  };

  const handleRetry = () => {
    setAnalysisResult(null);
    setSelectedFoods([]);
  };

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="flex items-center px-5 pt-6 pb-4">
        <button onClick={onBack} className="mr-3 text-text-primary">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-text-primary">식단 추가</h1>
      </div>

      {/* 달력 */}
      <Calendar selected={selectedDate} onSelect={setSelectedDate} />

      <div className="px-5">
        {/* 식사 유형 선택 */}
        <div className="flex gap-2 mb-6">
          {mealTypes.map((type) => (
            <button
              key={type}
              onClick={() => setMealType(type)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                mealType === type
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-secondary'
              }`}
            >
              {MEAL_TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {/* 텍스트 / 사진 모드 토글 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setInputMode('text'); setAnalysisResult(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              inputMode === 'text'
                ? 'bg-primary text-white'
                : 'bg-surface text-text-secondary'
            }`}
          >
            <Search size={16} />
            텍스트 검색
          </button>
          <button
            onClick={() => setInputMode('photo')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              inputMode === 'photo'
                ? 'bg-primary text-white'
                : 'bg-surface text-text-secondary'
            }`}
          >
            <Camera size={16} />
            사진 분석
          </button>
        </div>

        {/* 텍스트 모드: 음식 검색 */}
        {inputMode === 'text' && <FoodSearch onSelect={handleSelect} />}

        {/* 사진 모드 */}
        {inputMode === 'photo' && !analysisResult && (
          <PhotoCapture onAnalyzed={setAnalysisResult} />
        )}
        {inputMode === 'photo' && analysisResult && (
          <PhotoAnalysisResults
            result={analysisResult}
            selectedFoods={selectedFoods}
            onToggleFood={handleToggleFood}
            onRetry={handleRetry}
          />
        )}

        {/* 사진 모드: 선택된 음식 요약 */}
        {inputMode === 'photo' && selectedFoods.length > 0 && (
          <div className="mt-6 p-5 bg-surface rounded-2xl">
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              선택한 음식 {selectedFoods.length}개 · 총 {totalCalories}kcal
            </h3>
            <ul className="space-y-2">
              {selectedFoods.map((food) => (
                <li key={food.api_id ?? food.name} className="flex justify-between items-center text-sm">
                  <span className="text-text-primary">{food.name}</span>
                  <span className="text-text-secondary">{food.calories}kcal</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 사진 모드: 저장 버튼 */}
        {inputMode === 'photo' && selectedFoods.length > 0 && (
          <button
            onClick={handleSave}
            className="w-full py-3 mt-6 bg-primary text-white rounded-xl font-semibold text-base hover:bg-primary-dark transition-colors"
          >
            기록하기
          </button>
        )}

        {/* 텍스트 모드: 선택된 음식 */}
        {inputMode === 'text' && selected && (
          <div className="mt-6 p-5 bg-surface rounded-2xl">
            <h3 className="text-base font-semibold text-text-primary mb-1">
              {selected.name}
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              {selected.calories}kcal · {selected.serving_size}
            </p>

            {/* 인분 수 */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-text-primary">인분</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setServingSize(Math.max(0.5, servingSize - 0.5))}
                  className="w-8 h-8 rounded-full bg-border text-text-primary flex items-center justify-center"
                >
                  -
                </button>
                <span className="text-base font-semibold w-8 text-center">
                  {servingSize}
                </span>
                <button
                  onClick={() => setServingSize(servingSize + 0.5)}
                  className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* 총 칼로리 */}
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="text-sm text-text-secondary">총 칼로리</span>
              <span className="text-lg font-bold text-primary">
                {Math.round(selected.calories * servingSize)} kcal
              </span>
            </div>
          </div>
        )}

        {/* 텍스트 모드: 저장 버튼 */}
        {inputMode === 'text' && selected && (
          <button
            onClick={handleSave}
            className="w-full py-3 mt-6 bg-primary text-white rounded-xl font-semibold text-base hover:bg-primary-dark transition-colors"
          >
            기록하기
          </button>
        )}
      </div>
    </div>
  );
}
