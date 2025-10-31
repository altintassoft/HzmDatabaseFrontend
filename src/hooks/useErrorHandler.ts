// useErrorHandler Hook - Global error handling
// Integrates with toast notifications and error boundary

import { useCallback } from 'react';
import {
  ApiError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  ServerError,
} from '../types/api';

/**
 * Error handler hook with user-friendly messages
 */
export function useErrorHandler() {
  /**
   * Convert API error to user-friendly message
   */
  const getErrorMessage = useCallback((error: unknown): string => {
    if (error instanceof AuthenticationError) {
      return 'Oturum süreniz doldu. Lütfen tekrar giriş yapın.';
    }

    if (error instanceof AuthorizationError) {
      return 'Bu işlemi yapmak için yetkiniz yok.';
    }

    if (error instanceof NotFoundError) {
      return error.message || 'İstediğiniz kayıt bulunamadı.';
    }

    if (error instanceof ValidationError) {
      if (error.fields) {
        const fieldErrors = Object.entries(error.fields)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join('\n');
        return `Doğrulama hatası:\n${fieldErrors}`;
      }
      return error.message || 'Girdiğiniz bilgilerde hata var.';
    }

    if (error instanceof NetworkError) {
      return 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
    }

    if (error instanceof ServerError) {
      return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
    }

    if (error instanceof ApiError) {
      return error.message || 'Bir hata oluştu.';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Bilinmeyen bir hata oluştu.';
  }, []);

  /**
   * Handle error with console log and optional toast
   */
  const handleError = useCallback(
    (error: unknown, context?: string) => {
      const message = getErrorMessage(error);
      
      if (context) {
        console.error(`[${context}]`, error);
      } else {
        console.error('Error:', error);
      }

      // TODO: Integrate with toast notification system
      // showToast({ type: 'error', message });

      return message;
    },
    [getErrorMessage]
  );

  /**
   * Check if error should trigger logout
   */
  const shouldLogout = useCallback((error: unknown): boolean => {
    return error instanceof AuthenticationError;
  }, []);

  /**
   * Check if error is retriable
   */
  const isRetriableError = useCallback((error: unknown): boolean => {
    return (
      error instanceof NetworkError ||
      error instanceof ServerError ||
      (error instanceof ApiError && error.statusCode && error.statusCode >= 500)
    );
  }, []);

  return {
    getErrorMessage,
    handleError,
    shouldLogout,
    isRetriableError,
  };
}

/**
 * Error boundary context (for React Error Boundary)
 */
export interface ErrorBoundaryContextType {
  error: Error | null;
  resetError: () => void;
}

