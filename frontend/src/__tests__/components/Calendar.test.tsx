import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Calendar from '../../components/Calendar';

describe('Calendar 컴포넌트', () => {
  it('달력이 렌더링된다', () => {
    const onSelect = vi.fn();
    render(<Calendar selected={new Date()} onSelect={onSelect} />);
    expect(screen.getByText('일')).toBeInTheDocument();
    expect(screen.getByText('월')).toBeInTheDocument();
  });

  it('날짜 클릭 시 onSelect가 호출된다', () => {
    const onSelect = vi.fn();
    const today = new Date();
    // Select day 1 of the current month so we can click a different past day
    const selected = new Date(today.getFullYear(), today.getMonth(), 1);
    render(<Calendar selected={selected} onSelect={onSelect} />);

    // Click on day 2 (which should be enabled since it's in the past or present)
    const targetDay = Math.min(2, today.getDate());
    const dayButton = screen.getByLabelText(new RegExp(`${today.getMonth() + 1}월 ${targetDay}일`));
    fireEvent.click(dayButton);
    expect(onSelect).toHaveBeenCalled();
  });

  it('미래 날짜는 비활성화된다', () => {
    const onSelect = vi.fn();
    const today = new Date();
    render(<Calendar selected={today} onSelect={onSelect} />);

    const allCells = screen.getAllByRole('gridcell');
    const disabledCells = allCells.filter(
      (cell) => cell.classList.contains('rdp-disabled')
    );

    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    if (today.getDate() < lastDay) {
      expect(disabledCells.length).toBeGreaterThan(0);
    }
  });
});
