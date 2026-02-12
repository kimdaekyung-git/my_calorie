import { http, HttpResponse } from 'msw';
import { mockFoods } from '../data/food';
import { API_BASE } from '../../config';

export const foodHandlers = [
  http.get(`${API_BASE}/api/v1/foods`, ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const limit = Number(url.searchParams.get('limit') || '10');

    if (!query) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: '검색어를 입력해주세요.' } },
        { status: 400 }
      );
    }

    const filtered = mockFoods
      .filter((f) => f.name.includes(query))
      .slice(0, limit);

    return HttpResponse.json({
      data: filtered,
      meta: { total: filtered.length, source: 'mock' },
    });
  }),
];
