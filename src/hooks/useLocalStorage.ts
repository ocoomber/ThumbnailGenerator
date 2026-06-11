import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initial: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Only object-merge plain objects; strings/arrays/numbers pass through.
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && typeof initial === 'object' && !Array.isArray(initial)) {
          return { ...initial, ...parsed };
        }
        return parsed as T;
      }
    } catch {
      /* corrupt or unavailable storage — fall back to defaults */
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full (e.g. large hero dataURL) — keep working in memory */
    }
  }, [key, value]);

  return [value, setValue];
}
