// API Response Types - Backend Generic Handler Responses

/**
 * Standard API Response format from backend
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
  message?: string;
}

/**
 * Error Response from backend
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
  details?: Record<string, any>;
}

/**
 * Resource metadata from Generic Handler
 */
export interface ResourceMetadata {
  resource: string;
  count: number;
  fields?: string[];
  timestamp: string;
}

/**
 * Generic Handler list response
 */
export interface ListResponse<T = any> {
  success: boolean;
  data: T[];
  meta?: ResourceMetadata;
  error?: string;
}

/**
 * Generic Handler single item response
 */
export interface ItemResponse<T = any> {
  success: boolean;
  data: T;
  error?: string;
}

/**
 * Query parameters for API calls
 */
export interface QueryParams {
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, any>;
  include?: string[];
  [key: string]: any;
}

/**
 * Request options for API client
 */
export interface RequestOptions {
  params?: QueryParams;
  headers?: Record<string, string>;
  retry?: boolean;
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * API Client error
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Network error (no response from server)
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends Error {
  constructor(message: string = 'Permission denied') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends Error {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Server error (500)
 */
export class ServerError extends Error {
  constructor(message: string = 'Internal server error') {
    super(message);
    this.name = 'ServerError';
  }
}

