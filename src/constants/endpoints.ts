/**
 * API Endpoints Constants
 * Centralized endpoint definitions for consistency and maintainability
 * 
 * USAGE:
 *   import { ENDPOINTS } from '@/constants/endpoints';
 *   const response = await api.get(ENDPOINTS.AUTH.LOGIN);
 * 
 * BENEFITS:
 *   ✅ No hard-coded endpoints
 *   ✅ Easy refactoring
 *   ✅ Auto-complete support
 *   ✅ Type-safe
 *   ✅ Single source of truth
 */

export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // Admin - Database Reports
  ADMIN: {
    DATABASE: '/admin/database',
    SYNC_ANALYSIS: '/admin/sync-analysis',
    ANALYZE_FILES: '/admin/analyze-files',
    GET_LATEST_REPORT: '/admin/get-latest-report',
    GENERATE_REPORT: '/admin/generate-report',
    CURRENCIES: '/admin/currencies',
    UPDATE_EXCHANGE_RATE: '/admin/update-exchange-rate',
    TENANT_SETTINGS: '/admin/tenant-settings',
  },

  // Projects
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    GET: (id: string) => `/projects/${id}`,
    UPDATE: (id: string) => `/projects/${id}`,
    DELETE: (id: string) => `/projects/${id}`,
    STATISTICS: (id: string) => `/projects/${id}/statistics`,
  },

  // API Keys
  API_KEYS: {
    MY_KEY: '/api-keys/my-key',
    GENERATE: '/api-keys/generate',
    REGENERATE: '/api-keys/regenerate',
    DELETE: '/api-keys/delete',
    MASTER_ADMIN: '/api-keys/master-admin',
    MASTER_ADMIN_GENERATE: '/api-keys/master-admin/generate',
    MASTER_ADMIN_REGENERATE: '/api-keys/master-admin/regenerate',
  },

  // Data (Generic CRUD)
  DATA: {
    LIST: (resource: string) => `/data/${resource}`,
    CREATE: (resource: string) => `/data/${resource}`,
    GET: (resource: string, id: string) => `/data/${resource}/${id}`,
    UPDATE: (resource: string, id: string) => `/data/${resource}/${id}`,
    DELETE: (resource: string, id: string) => `/data/${resource}/${id}`,
  },

  // Health Check
  HEALTH: {
    STATUS: '/health',
    READY: '/health/ready',
    LIVE: '/health/live',
  },
} as const;

// Query parameter builders for common patterns
export const buildQueryParams = (params: Record<string, string | boolean | number | undefined>) => {
  const filtered = Object.entries(params)
    .filter(([_, value]) => value !== undefined)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {});
  
  return new URLSearchParams(filtered).toString();
};

// Common query parameters
export const QUERY_PARAMS = {
  TYPE: 'type',
  TARGET: 'target',
  FORCE: 'force',
  LIMIT: 'limit',
  OFFSET: 'offset',
  INCLUDE: 'include',
  SCHEMA: 'schema',
  TABLE: 'table',
} as const;

// Report types
export const REPORT_TYPES = {
  MIGRATION_REPORT: 'migration-report',
  PROJECT_STRUCTURE: 'project-structure',
  API_ENDPOINTS: 'api-endpoints',
  ARCHITECTURE_COMPLIANCE: 'architecture-compliance',
  CONFIGURATION_COMPLIANCE: 'configuration-compliance',
  BACKEND_TABLES: 'tables',
  SCHEMAS: 'schemas',
  STATS: 'stats',
} as const;

// Targets
export const TARGETS = {
  BACKEND: 'backend',
  FRONTEND: 'frontend',
} as const;

