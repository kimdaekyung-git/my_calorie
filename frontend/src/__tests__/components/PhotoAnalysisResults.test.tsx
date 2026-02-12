import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhotoAnalysisResults from '../../components/meal/PhotoAnalysisResults';
import type { FoodAnalysisResponse, FoodItem } from '../../../contracts/food.contract';

const kimchiFoodItem: FoodItem = {
  name: '김치찌개',
  calories: 150,
  serving_size: '1인분 (200g)',
  nutrients: { carbs: 10, protein: 8, fat: 5 },
  api_id: 'food_001',
};

const mockResult: FoodAnalysisResponse = {
  data: [
    {
      detected_name: '김치찌개',
      confidence: 'high',
      matched_foods: [kimchiFoodItem],
    },
    {
      detected_name: '비빔밥',
      confidence: 'medium',
      matched_foods: [],
    },
  ],
  meta: { total_detected: 2, model: 'gemini-2.0-flash' },
};

const emptyResult: FoodAnalysisResponse = {
  data: [],
  meta: { total_detected: 0, model: 'gemini-2.0-flash' },
};

describe('PhotoAnalysisResults 컴포넌트', () => {
  it('인식된 음식 개수를 표시한다', () => {
    render(
      <PhotoAnalysisResults
        result={mockResult}
        selectedFoods={[]}
        onToggleFood={() => {}}
        onRetry={() => {}}
      />
    );
    expect(screen.getByText(/인식된 음식 \(2개\)/)).toBeInTheDocument();
  });

  it('인식된 음식 이름과 확신도를 표시한다', () => {
    render(
      <PhotoAnalysisResults
        result={mockResult}
        selectedFoods={[]}
        onToggleFood={() => {}}
        onRetry={() => {}}
      />
    );
    expect(screen.getAllByText('김치찌개').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('높음')).toBeInTheDocument();
    expect(screen.getByText('비빔밥')).toBeInTheDocument();
    expect(screen.getByText('보통')).toBeInTheDocument();
  });

  it('매칭 음식 클릭 시 onToggleFood가 호출된다', async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();
    render(
      <PhotoAnalysisResults
        result={mockResult}
        selectedFoods={[]}
        onToggleFood={handleToggle}
        onRetry={() => {}}
      />
    );

    const matchButton = screen.getByText('150kcal · 1인분 (200g)').closest('button')!;
    await user.click(matchButton);

    expect(handleToggle).toHaveBeenCalledWith(
      expect.objectContaining({ name: '김치찌개', calories: 150 })
    );
  });

  it('선택된 음식에 체크마크가 표시된다', () => {
    const { container } = render(
      <PhotoAnalysisResults
        result={mockResult}
        selectedFoods={[kimchiFoodItem]}
        onToggleFood={() => {}}
        onRetry={() => {}}
      />
    );

    const matchButton = screen.getByText('150kcal · 1인분 (200g)').closest('button')!;
    expect(matchButton.className).toContain('bg-primary/10');
    // Check icon should be rendered
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('선택되지 않은 음식에는 체크마크가 없다', () => {
    render(
      <PhotoAnalysisResults
        result={mockResult}
        selectedFoods={[]}
        onToggleFood={() => {}}
        onRetry={() => {}}
      />
    );

    const matchButton = screen.getByText('150kcal · 1인분 (200g)').closest('button')!;
    expect(matchButton.className).not.toContain('bg-primary/10');
  });

  it('매칭 결과 없는 음식에 안내 메시지를 표시한다', () => {
    render(
      <PhotoAnalysisResults
        result={mockResult}
        selectedFoods={[]}
        onToggleFood={() => {}}
        onRetry={() => {}}
      />
    );
    expect(screen.getByText('매칭되는 음식 정보가 없습니다')).toBeInTheDocument();
  });

  it('인식 결과가 없으면 재촬영 안내를 표시한다', () => {
    render(
      <PhotoAnalysisResults
        result={emptyResult}
        selectedFoods={[]}
        onToggleFood={() => {}}
        onRetry={() => {}}
      />
    );
    expect(screen.getByText('음식을 인식하지 못했습니다')).toBeInTheDocument();
    expect(screen.getByText('다시 촬영')).toBeInTheDocument();
  });

  it('다시 촬영 클릭 시 onRetry가 호출된다', async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();
    render(
      <PhotoAnalysisResults
        result={mockResult}
        selectedFoods={[]}
        onToggleFood={() => {}}
        onRetry={handleRetry}
      />
    );

    await user.click(screen.getByText('다시 촬영'));
    expect(handleRetry).toHaveBeenCalled();
  });
});
