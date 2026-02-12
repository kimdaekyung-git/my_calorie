/**
 * 음식 검색 컴포넌트 테스트 (RED 상태 - 아직 컴포넌트 미구현)
 */
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '../../mocks/server';
import FoodSearch from '../../components/meal/FoodSearch';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('FoodSearch 컴포넌트', () => {
  it('검색 입력창이 렌더링된다', () => {
    render(<FoodSearch onSelect={() => {}} />);
    expect(screen.getByPlaceholderText(/음식 이름/i)).toBeInTheDocument();
  });

  it('2글자 이상 입력 시 검색 결과가 표시된다', async () => {
    const user = userEvent.setup();
    render(<FoodSearch onSelect={() => {}} />);

    const input = screen.getByPlaceholderText(/음식 이름/i);
    await user.type(input, '김치');

    await waitFor(() => {
      expect(screen.getByText('김치찌개')).toBeInTheDocument();
    });
  });

  it('검색 결과 클릭 시 onSelect가 호출된다', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    render(<FoodSearch onSelect={handleSelect} />);

    const input = screen.getByPlaceholderText(/음식 이름/i);
    await user.type(input, '김치');

    await waitFor(() => {
      expect(screen.getByText('김치찌개')).toBeInTheDocument();
    });

    await user.click(screen.getByText('김치찌개'));
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: '김치찌개', calories: 150 })
    );
  });

  it('검색 결과가 없으면 안내 메시지를 표시한다', async () => {
    const user = userEvent.setup();
    render(<FoodSearch onSelect={() => {}} />);

    const input = screen.getByPlaceholderText(/음식 이름/i);
    await user.type(input, '존재하지않는음식xyz');

    await waitFor(() => {
      expect(screen.getByText(/직접 입력/i)).toBeInTheDocument();
    });
  });
});
