// 공통 API 응답 타입

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    source?: string;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: { field: string; message: string }[];
  };
}
