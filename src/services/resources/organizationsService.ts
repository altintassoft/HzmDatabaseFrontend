// Organizations Resource Service
// Generic Handler integration for organizations resource

import { apiClient } from '../apiClient';
import type { ListResponse, ItemResponse, QueryParams, RequestOptions } from '../../types/api';

/**
 * Organization interface (Backend schema)
 */
export interface Organization {
  id: number;
  name: string;
  slug: string;
  description?: string;
  settings?: Record<string, any>;
  features?: Record<string, any>;
  limits?: {
    max_projects?: number;
    max_members?: number;
    max_tables_per_project?: number;
    storage_gb?: number;
  };
  plan?: string;
  billing_email?: string;
  subscription_status?: string;
  trial_ends_at?: string;
  subscription_ends_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: number;
}

/**
 * Organization Member interface
 */
export interface OrganizationMember {
  id: number;
  organization_id: number;
  user_id: number;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  invited_by?: number;
  invited_at?: string;
  joined_at?: string;
  is_active: boolean;
  custom_permissions?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Organizations Service - Backend Generic Handler integration
 * Resource: /api/v1/data/organizations
 */
export class OrganizationsService {
  private readonly resource = 'organizations';

  /**
   * List all organizations
   * GET /api/v1/data/organizations
   */
  async list(
    params?: QueryParams,
    options?: RequestOptions
  ): Promise<ListResponse<Organization>> {
    return apiClient.listResources<Organization>(this.resource, params, options);
  }

  /**
   * Get organization by ID
   * GET /api/v1/data/organizations/:id
   */
  async get(
    id: string | number,
    options?: RequestOptions
  ): Promise<ItemResponse<Organization>> {
    return apiClient.getResource<Organization>(this.resource, id, options);
  }

  /**
   * Create new organization
   * POST /api/v1/data/organizations
   */
  async create(
    data: Partial<Organization>,
    options?: RequestOptions
  ): Promise<ItemResponse<Organization>> {
    return apiClient.createResource<Organization>(this.resource, data, options);
  }

  /**
   * Update organization
   * PUT /api/v1/data/organizations/:id
   */
  async update(
    id: string | number,
    data: Partial<Organization>,
    options?: RequestOptions
  ): Promise<ItemResponse<Organization>> {
    return apiClient.updateResource<Organization>(this.resource, id, data, options);
  }

  /**
   * Count organizations
   * GET /api/v1/data/organizations/count
   */
  async count(params?: QueryParams, options?: RequestOptions): Promise<number> {
    const response = await apiClient.countResources(this.resource, params, options);
    return response.data || 0;
  }

  /**
   * Get active organizations
   * GET /api/v1/data/organizations?filter[is_active]=true
   */
  async getActiveOrganizations(
    params?: QueryParams,
    options?: RequestOptions
  ): Promise<ListResponse<Organization>> {
    return this.list({
      ...params,
      filter: { ...params?.filter, is_active: true },
    }, options);
  }

  /**
   * Search organizations by name or slug
   * GET /api/v1/data/organizations?search=:query
   */
  async search(
    query: string,
    params?: QueryParams,
    options?: RequestOptions
  ): Promise<ListResponse<Organization>> {
    return this.list({
      ...params,
      search: query,
    }, options);
  }

  /**
   * Get organization by slug
   * GET /api/v1/data/organizations?filter[slug]=:slug
   */
  async getBySlug(
    slug: string,
    options?: RequestOptions
  ): Promise<ItemResponse<Organization> | null> {
    const response = await this.list({
      filter: { slug },
      limit: 1,
    }, options);

    return response.data && response.data.length > 0
      ? { success: true, data: response.data[0] }
      : null;
  }

  /**
   * Get user's organizations
   * GET /api/v1/data/organizations?filter[member_user_id]=:userId
   */
  async getUserOrganizations(
    userId: string | number,
    params?: QueryParams,
    options?: RequestOptions
  ): Promise<ListResponse<Organization>> {
    return this.list({
      ...params,
      filter: { ...params?.filter, member_user_id: userId },
    }, options);
  }

  /**
   * Update organization settings
   * PUT /api/v1/data/organizations/:id
   */
  async updateSettings(
    id: string | number,
    settings: Record<string, any>,
    options?: RequestOptions
  ): Promise<ItemResponse<Organization>> {
    return this.update(id, { settings }, options);
  }

  /**
   * Update organization limits
   * PUT /api/v1/data/organizations/:id
   */
  async updateLimits(
    id: string | number,
    limits: Partial<Organization['limits']>,
    options?: RequestOptions
  ): Promise<ItemResponse<Organization>> {
    return this.update(id, { limits }, options);
  }

  /**
   * Update organization plan
   * PUT /api/v1/data/organizations/:id
   */
  async updatePlan(
    id: string | number,
    plan: string,
    options?: RequestOptions
  ): Promise<ItemResponse<Organization>> {
    return this.update(id, { plan }, options);
  }

  /**
   * Get organization statistics
   * Custom endpoint for organization stats
   */
  async getStatistics(organizationId: string | number): Promise<any> {
    return apiClient.get(`/data/${this.resource}/${organizationId}/statistics`);
  }

  /**
   * Get organization members
   * GET /api/v1/data/organizations/:id/members
   */
  async getMembers(
    organizationId: string | number,
    params?: QueryParams
  ): Promise<ListResponse<OrganizationMember>> {
    return apiClient.get(`/data/${this.resource}/${organizationId}/members`, { params });
  }
}

// Export singleton instance
export const organizationsService = new OrganizationsService();
export default organizationsService;

