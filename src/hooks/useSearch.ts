// useSearch Hook - Search and filter logic
// Supports text search, filters, and sorting

import { useState, useCallback, useMemo, useEffect } from 'react';
import { QueryParams } from '../types/api';

export interface FilterOption {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'is_null' | 'not_null';
  value: any;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SearchConfig {
  initialQuery?: string;
  initialFilters?: FilterOption[];
  initialSort?: SortOption;
  debounceMs?: number;
}

export interface SearchState {
  query: string;
  filters: FilterOption[];
  sort: SortOption | null;
  isActive: boolean; // True if any search/filter is applied
}

export interface SearchControls {
  // Current state
  query: string;
  filters: FilterOption[];
  sort: SortOption | null;
  isActive: boolean;
  
  // Search controls
  setQuery: (query: string) => void;
  clearQuery: () => void;
  
  // Filter controls
  addFilter: (filter: FilterOption) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;
  updateFilter: (field: string, updates: Partial<FilterOption>) => void;
  
  // Sort controls
  setSort: (field: string, direction?: 'asc' | 'desc') => void;
  toggleSort: (field: string) => void;
  clearSort: () => void;
  
  // Query params for API
  getQueryParams: () => QueryParams;
  
  // Reset all
  reset: () => void;
}

/**
 * useSearch Hook
 * 
 * @example
 * ```tsx
 * const search = useSearch({ debounceMs: 300 });
 * 
 * // Use in API call
 * const { data } = await apiClient.get('/users', search.getQueryParams());
 * 
 * // In UI
 * <SearchBar
 *   value={search.query}
 *   onChange={search.setQuery}
 *   onClear={search.clearQuery}
 * />
 * 
 * <FilterPanel
 *   filters={search.filters}
 *   onAdd={search.addFilter}
 *   onRemove={search.removeFilter}
 * />
 * ```
 */
export function useSearch(config: SearchConfig = {}): SearchControls {
  const {
    initialQuery = '',
    initialFilters = [],
    initialSort = null,
    debounceMs = 0,
  } = config;

  const [query, setQueryState] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<FilterOption[]>(initialFilters);
  const [sort, setSort] = useState<SortOption | null>(initialSort);

  // Debounce search query
  useEffect(() => {
    if (debounceMs === 0) {
      setDebouncedQuery(query);
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Check if any search/filter is active
  const isActive = useMemo(() => {
    return debouncedQuery.length > 0 || filters.length > 0 || sort !== null;
  }, [debouncedQuery, filters, sort]);

  // Search controls
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
  }, []);

  const clearQuery = useCallback(() => {
    setQueryState('');
    setDebouncedQuery('');
  }, []);

  // Filter controls
  const addFilter = useCallback((filter: FilterOption) => {
    setFilters(prev => {
      // Remove existing filter for same field
      const filtered = prev.filter(f => f.field !== filter.field);
      return [...filtered, filter];
    });
  }, []);

  const removeFilter = useCallback((field: string) => {
    setFilters(prev => prev.filter(f => f.field !== field));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const updateFilter = useCallback((field: string, updates: Partial<FilterOption>) => {
    setFilters(prev => prev.map(f => 
      f.field === field ? { ...f, ...updates } : f
    ));
  }, []);

  // Sort controls
  const handleSetSort = useCallback((field: string, direction: 'asc' | 'desc' = 'asc') => {
    setSort({ field, direction });
  }, []);

  const toggleSort = useCallback((field: string) => {
    setSort(prev => {
      if (!prev || prev.field !== field) {
        return { field, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { field, direction: 'desc' };
      }
      return null; // Remove sort
    });
  }, []);

  const clearSort = useCallback(() => {
    setSort(null);
  }, []);

  // Get query params for API
  const getQueryParams = useCallback((): QueryParams => {
    const params: QueryParams = {};

    // Add search query
    if (debouncedQuery) {
      params.search = debouncedQuery;
    }

    // Add filters
    if (filters.length > 0) {
      // Convert filters to API format
      // Backend expects: ?field=operator:value
      filters.forEach(filter => {
        const { field, operator, value } = filter;
        
        if (operator === 'is_null') {
          params[field] = 'is.null';
        } else if (operator === 'not_null') {
          params[field] = 'not.null';
        } else {
          params[field] = `${operator}.${value}`;
        }
      });
    }

    // Add sort
    if (sort) {
      params.sort = sort.direction === 'desc' ? `-${sort.field}` : sort.field;
    }

    return params;
  }, [debouncedQuery, filters, sort]);

  // Reset all
  const reset = useCallback(() => {
    setQueryState(initialQuery);
    setDebouncedQuery(initialQuery);
    setFilters(initialFilters);
    setSort(initialSort);
  }, [initialQuery, initialFilters, initialSort]);

  return useMemo(() => ({
    // State
    query,
    filters,
    sort,
    isActive,
    
    // Controls
    setQuery,
    clearQuery,
    addFilter,
    removeFilter,
    clearFilters,
    updateFilter,
    setSort: handleSetSort,
    toggleSort,
    clearSort,
    getQueryParams,
    reset,
  }), [
    query,
    filters,
    sort,
    isActive,
    setQuery,
    clearQuery,
    addFilter,
    removeFilter,
    clearFilters,
    updateFilter,
    handleSetSort,
    toggleSort,
    clearSort,
    getQueryParams,
    reset,
  ]);
}

/**
 * Simple search - Text search only
 */
export function useSimpleSearch(debounceMs = 300) {
  return useSearch({ debounceMs });
}

/**
 * Table search - With sorting support
 */
export function useTableSearch(initialSort?: SortOption) {
  return useSearch({ initialSort, debounceMs: 300 });
}

