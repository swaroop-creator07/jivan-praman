import { useState, useEffect, useCallback } from 'react';

export function usePageLoad(delay = 700, failRate = 0) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const t = setTimeout(() => {
      if (failRate > 0 && Math.random() < failRate) {
        setError('Unable to reach government servers. Please check your internet connection.');
        setLoading(false);
      } else {
        setLoading(false);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [delay, failRate]);

  useEffect(() => {
    const cleanup = load();
    return cleanup;
  }, [load]);

  return { loading, error, retry: load };
}
