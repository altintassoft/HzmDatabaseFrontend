// usePagination Hook - Pagination logic and state management
// Supports both offset-based and page-based pagination

import { useState, useCallback, useMemo } from 'react';
import { QueryParams } from '../types/api';

export interface PaginationConfig {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationControls {
  // Current state
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  
  // Navigation
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // Query params for API
  getQueryParams: () => QueryParams;
  
  // Update pagination from API response
  updateFromResponse: (response: { total?: number; totalPages?: number; hasNext?: boolean; hasPrev?: boolean }) => void;
  
  // Reset to initial state
  reset: () => void;
}

/**
 * usePagination Hook
 * 
 * @example
 * ```tsx
 * const pagination = usePagination({ initialPageSize: 20 });
 * 
 * // Use in API call
 * const { data } = await apiClient.get('/users', pagination.getQueryParams());
 * 
 * // Update from response
 * pagination.updateFromResponse(data.pagination);
 * 
 * // In UI
 * <Pagination {...pagination} />
 * ```
 */
export function usePagination(config: PaginationConfig = {}): PaginationControls {
  const {
    initialPage = 1,
    initialPageSize = 10,
  } = config;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // Navigation functions
  const nextPage = useCallback(() => {
    if (hasNext) {
      setPage(prev => prev + 1);
    }
  }, [hasNext]);

  const prevPage = useCallback(() => {
    if (hasPrev) {
      setPage(prev => Math.max(1, prev - 1));
    }
  }, [hasPrev]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1); // Reset to first page when changing page size
  }, []);

  // Get query params for API call
  const getQueryParams = useCallback((): QueryParams => {
    return {
      page,
      pageSize,
      offset: (page - 1) * pageSize,
      limit: pageSize,
    };
  }, [page, pageSize]);

  // Update pagination from API response
  const updateFromResponse = useCallback((response: {
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  }) => {
    if (response.total !== undefined) {
      setTotal(response.total);
    }
    if (response.totalPages !== undefined) {
      setTotalPages(response.totalPages);
    }
    if (response.hasNext !== undefined) {
      setHasNext(response.hasNext);
    }
    if (response.hasPrev !== undefined) {
      setHasPrev(response.hasPrev);
    }
  }, []);

  // Reset to initial state
  const reset = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
    setTotal(0);
    setTotalPages(0);
    setHasNext(false);
    setHasPrev(false);
  }, [initialPage, initialPageSize]);

  return useMemo(() => ({
    // State
    page,
    pageSize,
    total,
    totalPages,
    hasNext,
    hasPrev,
    
    // Controls
    nextPage,
    prevPage,
    goToPage,
    setPageSize: handleSetPageSize,
    getQueryParams,
    updateFromResponse,
    reset,
  }), [
    page,
    pageSize,
    total,
    totalPages,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    goToPage,
    handleSetPageSize,
    getQueryParams,
    updateFromResponse,
    reset,
  ]);
}

/**
 * Simple variant - For basic list pagination
 */
export function useSimplePagination(pageSize = 10) {
  return usePagination({ initialPageSize: pageSize });
}

/**
 * Table variant - For data tables with page size options
 */
export function useTablePagination(initialPageSize = 20) {
  return usePagination({
    initialPageSize,
    pageSizeOptions: [10, 20, 50, 100],
  });
}

