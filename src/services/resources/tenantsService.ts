// Tenants Resource Service
// Generic Handler integration for tenants resource

import { apiClient } from '../apiClient';
import type { ListResponse, ItemResponse, QueryParams, RequestOptions } from '../../types/api';

/**
 * Tenant interface (Backend schema)
 */
export interface Tenant {
  id: number;
  name: string;
  slug: string;
  description?: string;
  settings?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: number;
}

/**
 * Tenants Service - Backend Generic Handler integration
 * Resource: /api/v1/data/tenants
 */
export class TenantsService {
  private readonly resource = 'tenants';

  /**
   * List all tenants
   * GET /api/v1/data/tenants
   */
  async list(params?: QueryParams, options?: RequestOptions): Promise<ListResponse<Tenant>> {
    return apiClient.listResources<Tenant>(this.resource, params, options);
  }

  /**
   * Get tenant by ID
   * GET /api/v1/data/tenants/:id
   */
  async get(id: string | number, options?: RequestOptions): Promise<ItemResponse<Tenant>> {
    return apiClient.getResource<Tenant>(this.resource, id, options);
  }

  /**
   * Create new tenant
   * POST /api/v1/data/tenants
   */
  async create(
    data: Partial<Tenant>,
    options?: RequestOptions
  ): Promise<ItemResponse<Tenant>> {
    return apiClient.createResource<Tenant>(this.resource, data, options);
  }

  /**
   * Update tenant
   * PUT /api/v1/data/tenants/:id
   */
  async update(
    id: string | number,
    data: Partial<Tenant>,
    options?: RequestOptions
  ): Promise<ItemResponse<Tenant>> {
    return apiClient.updateResource<Tenant>(this.resource, id, data, options);
  }

  /**
   * Count tenants
   * GET /api/v1/data/tenants/count
   */
  async count(params?: QueryParams, options?: RequestOptions): Promise<number> {
    const response = await apiClient.countResources(this.resource, params, options);
    return response.data || 0;
  }

  /**
   * Get active tenants
   * GET /api/v1/data/tenants?filter[is_active]=true
   */
  async getActiveTenants(
    params?: QueryParams,
    options?: RequestOptions
  ): Promise<ListResponse<Tenant>> {
    return this.list({
      ...params,
      filter: { ...params?.filter, is_active: true },
    }, options);
  }

  /**
   * Search tenants by name or slug
   * GET /api/v1/data/tenants?search=:query
   */
  async search(
    query: string,
    params?: QueryParams,
    options?: RequestOptions
  ): Promise<ListResponse<Tenant>> {
    return this.list({
      ...params,
      search: query,
    }, options);
  }

  /**
   * Get tenant by slug
   * GET /api/v1/data/tenants?filter[slug]=:slug
   */
  async getBySlug(
    slug: string,
    options?: RequestOptions
  ): Promise<ItemResponse<Tenant> | null> {
    const response = await this.list({
      filter: { slug },
      limit: 1,
    }, options);

    return response.data && response.data.length > 0
      ? { success: true, data: response.data[0] }
      : null;
  }

  /**
   * Update tenant settings
   * PUT /api/v1/data/tenants/:id
   */
  async updateSettings(
    id: string | number,
    settings: Record<string, any>,
    options?: RequestOptions
  ): Promise<ItemResponse<Tenant>> {
    return this.update(id, { settings }, options);
  }

  /**
   * Update tenant status
   * PUT /api/v1/data/tenants/:id
   */
  async updateStatus(
    id: string | number,
    isActive: boolean,
    options?: RequestOptions
  ): Promise<ItemResponse<Tenant>> {
    return this.update(id, { is_active: isActive }, options);
  }
}

// Export singleton instance
export const tenantsService = new TenantsService();
export default tenantsService;

