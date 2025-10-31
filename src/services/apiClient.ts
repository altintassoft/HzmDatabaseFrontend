// Enhanced API Client with Generic Handler support
// Error handling, retry logic, loading states

import {
  ApiResponse,
  PaginatedResponse,
  ListResponse,
  ItemResponse,
  QueryParams,
  RequestOptions,
  ApiError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  ServerError,
} from '../types/api';

const API_URL = import.meta.env.VITE_API_URL || 'https://hzmdatabasebackend-production.up.railway.app/api/v1';

// Default retry configuration
const DEFAULT_RETRY_COUNT = 3;
const DEFAULT_RETRY_DELAY = 1000; // ms
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Enhanced API Client with Generic Handler support
 */
export class ApiClient {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.token = sessionStorage.getItem('auth_token');
    this.refreshToken = sessionStorage.getItem('refresh_token');
  }

  /**
   * Set authentication tokens
   */
  setTokens(token: string, refreshToken?: string) {
    this.token = token;
    sessionStorage.setItem('auth_token', token);
    
    if (refreshToken) {
      this.refreshToken = refreshToken;
      sessionStorage.setItem('refresh_token', refreshToken);
    }
  }

  /**
   * Clear authentication tokens
   */
  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('refresh_token');
    sessionStorage.removeItem('user');
  }

  /**
   * Get headers with auth token
   */
  private getHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: QueryParams): string {
    let url = `${API_URL}${endpoint}`;

    if (params && Object.keys(params).length > 0) {
      const filteredParams = Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .reduce((acc, [key, value]) => {
          if (Array.isArray(value)) {
            acc[key] = value.join(',');
          } else if (typeof value === 'object') {
            acc[key] = JSON.stringify(value);
          } else {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>);

      const queryString = new URLSearchParams(filteredParams).toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  }

  /**
   * Handle HTTP errors and throw appropriate error types
   */
  private async handleError(response: Response): Promise<never> {
    let errorData: any = {};
    
    try {
      errorData = await response.json();
    } catch {
      // Response body is not JSON
    }

    const message = errorData.error || errorData.message || response.statusText;

    switch (response.status) {
      case 400:
        throw new ValidationError(message, errorData.fields);
      case 401:
        throw new AuthenticationError(message);
      case 403:
        throw new AuthorizationError(message);
      case 404:
        throw new NotFoundError(errorData.resource);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ServerError(message);
      default:
        throw new ApiError(message, response.status, errorData);
    }
  }

  /**
   * Sleep utility for retry delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry logic with exponential backoff
   */
  private async retry<T>(
    fn: () => Promise<T>,
    retryCount: number = DEFAULT_RETRY_COUNT,
    retryDelay: number = DEFAULT_RETRY_DELAY
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx)
        if (error instanceof ValidationError ||
            error instanceof AuthenticationError ||
            error instanceof AuthorizationError ||
            error instanceof NotFoundError) {
          throw error;
        }

        // Last attempt, throw error
        if (attempt === retryCount) {
          throw error;
        }

        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        console.warn(`Retry attempt ${attempt + 1}/${retryCount} after ${delay}ms`, error);
        await this.sleep(delay);
      }
    }

    throw lastError || new Error('Retry failed');
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.refreshToken) {
      throw new AuthenticationError('No refresh token available');
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });

        if (!response.ok) {
          this.clearTokens();
          throw new AuthenticationError('Token refresh failed');
        }

        const data = await response.json();
        const newToken = data.token || data.accessToken;
        
        this.setTokens(newToken, data.refreshToken);
        return newToken;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Generic request method with retry and error handling
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      params,
      headers,
      retry = true,
      retryCount = DEFAULT_RETRY_COUNT,
      retryDelay = DEFAULT_RETRY_DELAY,
      timeout = DEFAULT_TIMEOUT,
      signal,
    } = options;

    const url = this.buildUrl(endpoint, params);

    const fetchFn = async (): Promise<T> => {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          method,
          headers: this.getHeaders(headers),
          body: data ? JSON.stringify(data) : undefined,
          credentials: 'include',
          signal: signal || controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle 401 with token refresh
        if (response.status === 401 && this.refreshToken && retry) {
          try {
            await this.refreshAccessToken();
            // Retry the original request with new token
            return await fetchFn();
          } catch (refreshError) {
            this.clearTokens();
            throw new AuthenticationError('Session expired, please login again');
          }
        }

        if (!response.ok) {
          await this.handleError(response);
        }

        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new NetworkError('Request timeout');
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new NetworkError('Network error - Backend unreachable');
        }

        throw error;
      }
    };

    if (retry) {
      return this.retry(fetchFn, retryCount, retryDelay);
    }

    return fetchFn();
  }

  // ==================== HTTP METHODS ====================

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', endpoint, data, options);
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  // ==================== GENERIC HANDLER METHODS ====================

  /**
   * List resources (Generic Handler)
   * GET /api/v1/data/:resource
   */
  async listResources<T = any>(
    resource: string,
    params?: QueryParams,
    options?: RequestOptions
  ): Promise<ListResponse<T>> {
    return this.get<ListResponse<T>>(`/data/${resource}`, { ...options, params });
  }

  /**
   * Get single resource by ID (Generic Handler)
   * GET /api/v1/data/:resource/:id
   */
  async getResource<T = any>(
    resource: string,
    id: string | number,
    options?: RequestOptions
  ): Promise<ItemResponse<T>> {
    return this.get<ItemResponse<T>>(`/data/${resource}/${id}`, options);
  }

  /**
   * Create resource (Generic Handler)
   * POST /api/v1/data/:resource
   */
  async createResource<T = any>(
    resource: string,
    data: any,
    options?: RequestOptions
  ): Promise<ItemResponse<T>> {
    return this.post<ItemResponse<T>>(`/data/${resource}`, data, options);
  }

  /**
   * Update resource (Generic Handler)
   * PUT /api/v1/data/:resource/:id
   */
  async updateResource<T = any>(
    resource: string,
    id: string | number,
    data: any,
    options?: RequestOptions
  ): Promise<ItemResponse<T>> {
    return this.put<ItemResponse<T>>(`/data/${resource}/${id}`, data, options);
  }

  /**
   * Delete resource (Generic Handler)
   * DELETE /api/v1/data/:resource/:id
   */
  async deleteResource(
    resource: string,
    id: string | number,
    options?: RequestOptions
  ): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/data/${resource}/${id}`, options);
  }

  /**
   * Count resources (Generic Handler)
   * GET /api/v1/data/:resource/count
   */
  async countResources(
    resource: string,
    params?: QueryParams,
    options?: RequestOptions
  ): Promise<ApiResponse<number>> {
    return this.get<ApiResponse<number>>(`/data/${resource}/count`, { ...options, params });
  }

  // ==================== AUTH METHODS ====================

  /**
   * Login
   */
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.post<any>('/auth/login', { email, password }, { retry: false });
      
      if (response.token) {
        this.setTokens(response.token, response.refreshToken);
        if (response.user) {
          sessionStorage.setItem('user', JSON.stringify(response.user));
        }
      }

      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  /**
   * Register
   */
  async register(email: string, password: string, name?: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.post<any>('/auth/register', { email, password, name }, { retry: false });
      
      if (response.token) {
        this.setTokens(response.token, response.refreshToken);
        if (response.user) {
          sessionStorage.setItem('user', JSON.stringify(response.user));
        }
      }

      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<ApiResponse<any>> {
    try {
      const response = await this.get<any>('/auth/me');
      return { success: true, data: response.user };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user',
      };
    }
  }

  /**
   * Logout
   */
  logout() {
    this.clearTokens();
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return !!this.token;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;

