import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '../../mocks/server';
import PhotoCapture from '../../components/meal/PhotoCapture';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('PhotoCapture 컴포넌트', () => {
  it('카메라 촬영과 갤러리 선택 버튼이 렌더링된다', () => {
    render(<PhotoCapture onAnalyzed={() => {}} />);
    expect(screen.getByText('카메라 촬영')).toBeInTheDocument();
    expect(screen.getByText('갤러리 선택')).toBeInTheDocument();
  });

  it('이미지 선택 시 미리보기와 로딩 표시 후 onAnalyzed가 호출된다', async () => {
    const user = userEvent.setup();
    const handleAnalyzed = vi.fn();
    render(<PhotoCapture onAnalyzed={handleAnalyzed} />);

    const file = new File(['dummy'], 'food.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('gallery-input') as HTMLInputElement;
    await user.upload(input, file);

    // 미리보기가 표시됨
    await waitFor(() => {
      expect(screen.getByAltText('촬영된 음식 사진')).toBeInTheDocument();
    });

    // 분석 완료 후 onAnalyzed 호출
    await waitFor(() => {
      expect(handleAnalyzed).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ detected_name: '김치찌개' }),
          ]),
          meta: expect.objectContaining({ total_detected: 2 }),
        })
      );
    });
  });

  it('10MB 초과 이미지 선택 시 에러를 표시한다', async () => {
    const user = userEvent.setup();
    render(<PhotoCapture onAnalyzed={() => {}} />);

    // 11MB 더미 파일 생성
    const bigContent = new Uint8Array(11 * 1024 * 1024);
    const file = new File([bigContent], 'big.jpg', { type: 'image/jpeg' });
    const input = screen.getByTestId('gallery-input') as HTMLInputElement;
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('10MB');
    });
  });
});
