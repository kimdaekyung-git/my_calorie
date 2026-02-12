import { useState } from 'react';
import { UtensilsCrossed, Calculator, BarChart3 } from 'lucide-react';
import SlideCard from '../components/ui/SlideCard';
import { db } from '../db';

const slides = [
  {
    title: '간편한 식단 기록',
    description: '음식 이름만 검색하면 칼로리가 자동으로 입력됩니다.\n매일 먹는 것을 3초 만에 기록하세요.',
    icon: <UtensilsCrossed size={64} />,
  },
  {
    title: '칼로리 자동 계산',
    description: '기록만 하면 하루 총 칼로리가 자동으로 계산됩니다.\n목표 대비 진행 상황을 한눈에 확인하세요.',
    icon: <Calculator size={64} />,
  },
  {
    title: '주간 리포트',
    description: '일주일간의 식단 패턴을 한눈에 파악하세요.\n자주 먹는 음식, 칼로리 추이를 확인할 수 있습니다.',
    icon: <BarChart3 size={64} />,
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await db.settings.update('default', {
        onboarding_completed: true,
        updated_at: new Date(),
      });
      onComplete();
    }
  };

  const slide = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <div className="flex-1 flex items-center justify-center">
        <SlideCard
          title={slide.title}
          description={slide.description}
          icon={slide.icon}
        />
      </div>

      <div className="px-8 pb-12">
        {/* 인디케이터 */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentSlide ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* 버튼 */}
        <button
          onClick={handleNext}
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-base hover:bg-primary-dark transition-colors"
        >
          {isLast ? '시작하기' : '다음'}
        </button>

        {!isLast && (
          <button
            onClick={async () => {
              await db.settings.update('default', {
                onboarding_completed: true,
                updated_at: new Date(),
              });
              onComplete();
            }}
            className="w-full py-3 mt-2 text-text-secondary text-sm"
          >
            건너뛰기
          </button>
        )}
      </div>
    </div>
  );
}
