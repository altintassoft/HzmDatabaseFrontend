// useCachedData Hook - Client-side caching with TTL
// Simple memory-based cache for API responses

import { useState, useEffect, useCallback, useRef } from 'react';

export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh (default: true)
  dedupe?: boolean; // Deduplicate concurrent requests (default: true)
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CachedDataState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isStale: boolean;
  isFetching: boolean;
}

// Global in-memory cache
const cache = new Map<string, CacheEntry<any>>();

// Inflight requests (for deduplication)
const inflightRequests = new Map<string, Promise<any>>();

/**
 * useCachedData Hook
 * 
 * Provides client-side caching with TTL and stale-while-revalidate
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useCachedData(
 *   'users-list',
 *   () => usersService.list({ limit: 100 }),
 *   { ttl: 5 * 60 * 1000 } // 5 minutes
 * );
 * 
 * // Manual refetch
 * const handleRefresh = () => refetch();
 * 
 * // Invalidate cache
 * const handleCreate = async () => {
 *   await usersService.create(data);
 *   invalidate(); // Refetch from API
 * };
 * ```
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: CacheConfig = {}
): CachedDataState<T> & {
  refetch: () => Promise<void>;
  invalidate: () => void;
  clearCache: () => void;
} {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate = true,
    dedupe = true,
  } = config;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const mountedRef = useRef(true);
  const keyRef = useRef(key);

  // Update key ref
  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  // Check if cached data is valid
  const isCacheValid = useCallback((entry: CacheEntry<T> | undefined): boolean => {
    if (!entry) return false;
    return Date.now() < entry.expiresAt;
  }, []);

  // Get cached data
  const getCachedData = useCallback((): CacheEntry<T> | undefined => {
    return cache.get(keyRef.current);
  }, []);

  // Set cached data
  const setCachedData = useCallback((data: T) => {
    const now = Date.now();
    cache.set(keyRef.current, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }, [ttl]);

  // Fetch data from API
  const fetchData = useCallback(async (isInitialLoad = false) => {
    try {
      // Check if there's an inflight request (deduplication)
      if (dedupe && inflightRequests.has(keyRef.current)) {
        const existingRequest = inflightRequests.get(keyRef.current);
        const result = await existingRequest;
        
        if (mountedRef.current) {
          setData(result);
          setIsStale(false);
          if (isInitialLoad) {
            setIsLoading(false);
          }
          setIsFetching(false);
        }
        return;
      }

      // Create new request
      const request = fetcher();
      
      if (dedupe) {
        inflightRequests.set(keyRef.current, request);
      }

      const result = await request;

      if (mountedRef.current) {
        setData(result);
        setCachedData(result);
        setIsStale(false);
        setError(null);
        
        if (isInitialLoad) {
          setIsLoading(false);
        }
        setIsFetching(false);
      }

      // Clear inflight request
      if (dedupe) {
        inflightRequests.delete(keyRef.current);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      if (mountedRef.current) {
        setError(error);
        
        if (isInitialLoad) {
          setIsLoading(false);
        }
        setIsFetching(false);
      }

      // Clear inflight request
      if (dedupe) {
        inflightRequests.delete(keyRef.current);
      }
    }
  }, [fetcher, dedupe, setCachedData]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;

    const cachedEntry = getCachedData();

    if (cachedEntry && isCacheValid(cachedEntry)) {
      // Use cached data
      setData(cachedEntry.data);
      setIsLoading(false);
      setIsStale(false);
    } else if (cachedEntry && staleWhileRevalidate) {
      // Use stale data while revalidating
      setData(cachedEntry.data);
      setIsLoading(false);
      setIsStale(true);
      setIsFetching(true);
      fetchData();
    } else {
      // Fresh fetch
      setIsLoading(true);
      fetchData(true);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [key]); // Re-fetch when key changes

  // Manual refetch
  const refetch = useCallback(async () => {
    setIsFetching(true);
    await fetchData();
  }, [fetchData]);

  // Invalidate cache (force refetch)
  const invalidate = useCallback(() => {
    cache.delete(keyRef.current);
    setIsFetching(true);
    fetchData();
  }, [fetchData]);

  // Clear cache (remove from cache but don't refetch)
  const clearCache = useCallback(() => {
    cache.delete(keyRef.current);
  }, []);

  return {
    data,
    isLoading,
    error,
    isStale,
    isFetching,
    refetch,
    invalidate,
    clearCache,
  };
}

/**
 * Global cache utilities
 */
export const cacheUtils = {
  /**
   * Clear all cache entries
   */
  clearAll: () => {
    cache.clear();
    inflightRequests.clear();
  },

  /**
   * Clear cache entries by pattern
   */
  clearByPattern: (pattern: string | RegExp) => {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    for (const key of cache.keys()) {
      if (regex.test(key)) {
        cache.delete(key);
      }
    }
    
    for (const key of inflightRequests.keys()) {
      if (regex.test(key)) {
        inflightRequests.delete(key);
      }
    }
  },

  /**
   * Get cache size
   */
  getSize: () => cache.size,

  /**
   * Get all cache keys
   */
  getKeys: () => Array.from(cache.keys()),
};

/**
 * Simple cached data - Minimal config
 */
export function useSimpleCachedData<T>(
  key: string,
  fetcher: () => Promise<T>
) {
  return useCachedData(key, fetcher, {
    ttl: 5 * 60 * 1000, // 5 minutes
    staleWhileRevalidate: true,
  });
}

/**
 * Long-lived cached data - For rarely changing data
 */
export function useLongCachedData<T>(
  key: string,
  fetcher: () => Promise<T>
) {
  return useCachedData(key, fetcher, {
    ttl: 30 * 60 * 1000, // 30 minutes
    staleWhileRevalidate: true,
  });
}

/**
 * Short-lived cached data - For frequently changing data
 */
export function useShortCachedData<T>(
  key: string,
  fetcher: () => Promise<T>
) {
  return useCachedData(key, fetcher, {
    ttl: 1 * 60 * 1000, // 1 minute
    staleWhileRevalidate: false,
  });
}

