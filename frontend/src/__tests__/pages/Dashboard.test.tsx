import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../../pages/Dashboard';
import { db, seedDefaults } from '../../db';

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

describe('Dashboard 페이지', () => {
  beforeEach(async () => {
    await db.meals.clear();
    await db.settings.clear();
    await seedDefaults();
  });

  it('오늘의 날짜가 표시된다', () => {
    render(<Dashboard />);
    const today = new Date();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    expect(screen.getByText(new RegExp(`${month}월 ${date}일`))).toBeInTheDocument();
  });

  it('식단이 없으면 빈 상태 메시지가 표시된다', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/기록된 식단이 없습니다/)).toBeInTheDocument();
    });
  });

  it('식단이 있으면 음식 이름과 칼로리가 표시된다', async () => {
    const todayStr = toLocalDateStr(new Date());
    await db.meals.add({
      date: todayStr,
      meal_type: 'lunch',
      food_name: '비빔밥',
      calories: 550,
      serving_size: 1,
      source: 'api',
      created_at: new Date(),
      updated_at: new Date(),
    });

    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText('비빔밥')).toBeInTheDocument();
    });
    expect(screen.getAllByText(/550/).length).toBeGreaterThanOrEqual(1);
  });

  it('칼로리 목표 대비 진행률이 표시된다', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/2,?000/)).toBeInTheDocument();
    });
  });

  it('식단 추가 FAB 버튼이 존재한다', () => {
    render(<Dashboard />);
    expect(screen.getByLabelText('식단 추가')).toBeInTheDocument();
  });

  it('과거 날짜 선택 시 해당 날짜의 식단이 표시된다', async () => {
    const user = userEvent.setup();
    // Add a meal for yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toLocalDateStr(yesterday);

    await db.meals.add({
      date: yesterdayStr,
      meal_type: 'dinner',
      food_name: '된장찌개',
      calories: 300,
      serving_size: 1,
      source: 'api',
      created_at: yesterday,
      updated_at: yesterday,
    });

    render(<Dashboard />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText(/기록된 식단이 없습니다/)).toBeInTheDocument();
    });

    // Click yesterday's date button in the calendar
    const yesterdayDay = yesterday.getDate();
    const dayButtons = screen.getAllByRole('button').filter(
      (btn) => btn.classList.contains('rdp-day_button')
    );
    const yesterdayBtn = dayButtons.find(
      (btn) => btn.textContent === String(yesterdayDay)
    );
    expect(yesterdayBtn).toBeTruthy();
    await user.click(yesterdayBtn!);

    await waitFor(() => {
      expect(screen.getByText('된장찌개')).toBeInTheDocument();
    });
  });
});
