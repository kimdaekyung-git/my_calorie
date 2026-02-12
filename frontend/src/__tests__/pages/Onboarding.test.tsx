import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Onboarding from '../../pages/Onboarding';
import { db, seedDefaults } from '../../db';

describe('Onboarding 페이지', () => {
  beforeEach(async () => {
    await db.settings.clear();
    await seedDefaults();
  });

  it('첫 번째 슬라이드가 렌더링된다', () => {
    render(<Onboarding onComplete={() => {}} />);
    expect(screen.getByText('간편한 식단 기록')).toBeInTheDocument();
  });

  it('3개의 인디케이터 점이 표시된다', () => {
    const { container } = render(<Onboarding onComplete={() => {}} />);
    const dots = container.querySelectorAll('.rounded-full');
    expect(dots).toHaveLength(3);
  });

  it('다음 버튼 클릭 시 두 번째 슬라이드로 이동한다', async () => {
    const user = userEvent.setup();
    render(<Onboarding onComplete={() => {}} />);

    await user.click(screen.getByText('다음'));
    expect(screen.getByText('칼로리 자동 계산')).toBeInTheDocument();
  });

  it('마지막 슬라이드에서 시작하기 버튼이 표시된다', async () => {
    const user = userEvent.setup();
    render(<Onboarding onComplete={() => {}} />);

    await user.click(screen.getByText('다음'));
    await user.click(screen.getByText('다음'));
    expect(screen.getByText('시작하기')).toBeInTheDocument();
  });

  it('시작하기 클릭 시 onComplete가 호출되고 onboarding_completed가 true가 된다', async () => {
    const user = userEvent.setup();
    const handleComplete = vi.fn();
    render(<Onboarding onComplete={handleComplete} />);

    await user.click(screen.getByText('다음'));
    await user.click(screen.getByText('다음'));
    await user.click(screen.getByText('시작하기'));

    await waitFor(() => {
      expect(handleComplete).toHaveBeenCalled();
    });
    const settings = await db.settings.get('default');
    expect(settings!.onboarding_completed).toBe(true);
  });

  it('건너뛰기 버튼이 첫 번째/두 번째 슬라이드에 존재한다', () => {
    render(<Onboarding onComplete={() => {}} />);
    expect(screen.getByText('건너뛰기')).toBeInTheDocument();
  });
});
