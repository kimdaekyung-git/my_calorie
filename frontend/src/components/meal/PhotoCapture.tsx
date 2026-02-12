import { useState, useRef } from 'react';
import { Camera, Image, X, Loader2 } from 'lucide-react';
import { API_BASE } from '../../config';

interface PhotoCaptureProps {
  onAnalyzed: (data: import('../../../contracts/food.contract').FoodAnalysisResponse) => void;
}

export default function PhotoCapture({ onAnalyzed }: PhotoCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('이미지 크기가 10MB를 초과합니다');
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${API_BASE}/api/v1/foods/analyze-image`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || '분석에 실패했습니다');
      }

      const data = await res.json();
      onAnalyzed(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : '분석에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearPreview = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      {/* 숨겨진 input들 */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
        data-testid="camera-input"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        data-testid="gallery-input"
      />

      {/* 미리보기 */}
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden mb-4">
          <img
            src={preview}
            alt="촬영된 음식 사진"
            className="w-full h-48 object-cover"
          />
          {!loading && (
            <button
              onClick={clearPreview}
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"
              aria-label="사진 제거"
            >
              <X size={16} />
            </button>
          )}
          {loading && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
              <Loader2 size={32} className="text-white animate-spin" />
              <p className="text-white text-sm mt-2">AI가 음식을 분석하고 있어요...</p>
            </div>
          )}
        </div>
      ) : (
        /* 촬영/선택 버튼 */
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="flex-1 flex flex-col items-center gap-2 py-6 bg-surface border border-border rounded-2xl text-text-secondary hover:border-primary transition-colors"
          >
            <Camera size={28} />
            <span className="text-sm font-medium">카메라 촬영</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex flex-col items-center gap-2 py-6 bg-surface border border-border rounded-2xl text-text-secondary hover:border-primary transition-colors"
          >
            <Image size={28} />
            <span className="text-sm font-medium">갤러리 선택</span>
          </button>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <p className="text-sm text-red-500 text-center mb-4" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
