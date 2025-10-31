// useLoading Hook - Global loading state management
// For API calls and async operations

import { useState, useCallback } from 'react';

/**
 * Loading state hook for async operations
 * Provides loading, error, and data state management
 */
export function useLoading<T = any>(initialLoading = false) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  /**
   * Execute async operation with loading state
   */
  const execute = useCallback(async (asyncFn: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    isLoading,
    error,
    data,
    execute,
    reset,
    setIsLoading,
    setError,
    setData,
  };
}

/**
 * Simple loading state hook (boolean only)
 */
export function useSimpleLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);

  const withLoading = useCallback(async <T,>(asyncFn: () => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    try {
      return await asyncFn();
    } catch (error) {
      console.error('Loading error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    setIsLoading,
    withLoading,
  };
}

/**
 * Multiple loading states hook (for parallel operations)
 */
export function useMultipleLoading(keys: string[]) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    keys.reduce((acc, key) => ({ ...acc, [key]: false }), {})
  );

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [key]: loading }));
  }, []);

  const isAnyLoading = Object.values(loadingStates).some((v) => v);

  return {
    loadingStates,
    setLoading,
    isAnyLoading,
  };
}

