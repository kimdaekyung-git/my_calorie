import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import type { FoodItem } from '../../../contracts/food.contract';
import { API_BASE } from '../../config';

interface FoodSearchProps {
  onSelect: (food: FoodItem) => void;
}

export default function FoodSearch({ onSelect }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/foods?q=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const body = await res.json();
          setResults(body.data);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
        setSearched(true);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="w-full">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
        />
        <input
          type="text"
          placeholder="음식 이름을 검색하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary"
        />
      </div>

      {loading && (
        <p className="text-sm text-text-secondary mt-3 text-center">
          검색 중...
        </p>
      )}

      {!loading && searched && results.length === 0 && (
        <p className="text-sm text-text-secondary mt-3 text-center">
          검색 결과가 없습니다. 직접 입력해주세요.
        </p>
      )}

      {results.length > 0 && (
        <ul className="mt-2 space-y-1">
          {results.map((food) => (
            <li key={food.api_id ?? food.name}>
              <button
                type="button"
                onClick={() => onSelect(food)}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-surface transition-colors"
              >
                <span className="text-sm font-medium text-text-primary">
                  {food.name}
                </span>
                <span className="text-xs text-text-secondary ml-2">
                  {food.calories}kcal · {food.serving_size}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
