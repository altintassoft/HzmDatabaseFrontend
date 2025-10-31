// useOptimisticUpdate Hook - Optimistic UI updates with rollback
// Provides instant feedback for create/update/delete operations

import { useState, useCallback, useRef } from 'react';

export interface OptimisticUpdateConfig<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error, rollback: () => void) => void;
  autoRollback?: boolean; // Auto rollback on error (default: true)
}

export interface OptimisticState<T> {
  isOptimistic: boolean;
  data: T | null;
  error: Error | null;
}

/**
 * useOptimisticUpdate Hook
 * 
 * Provides optimistic UI updates with automatic rollback on error
 * 
 * @example
 * ```tsx
 * const optimistic = useOptimisticUpdate<Project>({
 *   onError: (error) => toast.error(error.message)
 * });
 * 
 * const handleCreate = async () => {
 *   await optimistic.execute(
 *     // Optimistic update (instant UI)
 *     () => {
 *       const tempProject = { id: 'temp', name: 'New Project', ...tempData };
 *       dispatch({ type: 'ADD_PROJECT', payload: { project: tempProject }});
 *       return tempProject;
 *     },
 *     // API call (actual operation)
 *     () => projectsService.create(data),
 *     // Commit (replace temp with real data)
 *     (realProject) => {
 *       dispatch({ type: 'UPDATE_PROJECT', payload: { projectId: 'temp', updates: realProject }});
 *     },
 *     // Rollback (on error)
 *     () => {
 *       dispatch({ type: 'DELETE_PROJECT', payload: { projectId: 'temp' }});
 *     }
 *   );
 * };
 * ```
 */
export function useOptimisticUpdate<T = any>(config: OptimisticUpdateConfig<T> = {}) {
  const {
    onSuccess,
    onError,
    autoRollback = true,
  } = config;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const rollbackRef = useRef<(() => void) | null>(null);

  /**
   * Execute optimistic update
   * 
   * @param optimisticFn - Function that updates UI optimistically (runs immediately)
   * @param apiFn - API call function (runs after optimistic update)
   * @param commitFn - Function to commit the final result (replaces optimistic data)
   * @param rollbackFn - Function to rollback optimistic update (on error)
   */
  const execute = useCallback(async <R = T>(
    optimisticFn: () => void,
    apiFn: () => Promise<R>,
    commitFn?: (result: R) => void,
    rollbackFn?: () => void
  ): Promise<R | null> => {
    setIsLoading(true);
    setError(null);
    rollbackRef.current = rollbackFn || null;

    try {
      // Step 1: Optimistic update (instant UI)
      optimisticFn();

      // Step 2: API call
      const result = await apiFn();

      // Step 3: Commit (replace optimistic with real data)
      if (commitFn) {
        commitFn(result);
      }

      // Step 4: Success callback
      if (onSuccess) {
        onSuccess(result as any);
      }

      setIsLoading(false);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);

      // Step 5: Rollback on error
      if (autoRollback && rollbackFn) {
        rollbackFn();
      }

      // Step 6: Error callback
      if (onError) {
        onError(error, rollbackFn || (() => {}));
      }

      setIsLoading(false);
      return null;
    }
  }, [onSuccess, onError, autoRollback]);

  /**
   * Manual rollback (if autoRollback is disabled)
   */
  const rollback = useCallback(() => {
    if (rollbackRef.current) {
      rollbackRef.current();
      rollbackRef.current = null;
      setError(null);
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    execute,
    rollback,
    clearError,
    isLoading,
    error,
  };
}

/**
 * Optimistic Create - Simplified for create operations
 */
export function useOptimisticCreate<T>(config: OptimisticUpdateConfig<T> = {}) {
  return useOptimisticUpdate<T>(config);
}

/**
 * Optimistic Delete - Simplified for delete operations
 */
export function useOptimisticDelete(config: OptimisticUpdateConfig<void> = {}) {
  return useOptimisticUpdate<void>(config);
}

