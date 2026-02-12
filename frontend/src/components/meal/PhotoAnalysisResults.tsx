import { Camera, Check } from 'lucide-react';
import type { FoodAnalysisResponse, FoodItem } from '../../../contracts/food.contract';

interface PhotoAnalysisResultsProps {
  result: FoodAnalysisResponse;
  selectedFoods: FoodItem[];
  onToggleFood: (food: FoodItem) => void;
  onRetry: () => void;
}

const CONFIDENCE_LABELS: Record<string, string> = {
  high: '높음',
  medium: '보통',
  low: '낮음',
};

const CONFIDENCE_COLORS: Record<string, string> = {
  high: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-red-100 text-red-700',
};

export default function PhotoAnalysisResults({
  result,
  selectedFoods,
  onToggleFood,
  onRetry,
}: PhotoAnalysisResultsProps) {
  const isSelected = (food: FoodItem) =>
    selectedFoods.some((f) => f.name === food.name && f.api_id === food.api_id);

  if (result.data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary mb-4">음식을 인식하지 못했습니다</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium"
        >
          <Camera size={16} />
          다시 촬영
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          인식된 음식 ({result.meta.total_detected}개)
        </h3>
        <button
          onClick={onRetry}
          className="text-sm text-primary font-medium"
        >
          다시 촬영
        </button>
      </div>

      {result.data.map((detected) => (
        <div
          key={detected.detected_name}
          className="p-4 bg-surface rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base font-semibold text-text-primary">
              {detected.detected_name}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${CONFIDENCE_COLORS[detected.confidence]}`}
            >
              {CONFIDENCE_LABELS[detected.confidence]}
            </span>
          </div>

          {detected.matched_foods.length > 0 ? (
            <ul className="space-y-1">
              {detected.matched_foods.map((food) => (
                <li key={food.api_id ?? food.name}>
                  <button
                    type="button"
                    onClick={() => onToggleFood(food)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors flex items-center justify-between ${
                      isSelected(food)
                        ? 'bg-primary/10 ring-1 ring-primary'
                        : 'hover:bg-background'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-medium text-text-primary">
                        {food.name}
                      </span>
                      <span className="text-xs text-text-secondary ml-2">
                        {food.calories}kcal · {food.serving_size}
                      </span>
                    </div>
                    {isSelected(food) && (
                      <Check size={16} className="text-primary" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-secondary">
              매칭되는 음식 정보가 없습니다
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
