// Users Resource Service
// Generic Handler integration for users resource

import { apiClient } from '../apiClient';
import type { ListResponse, ItemResponse, QueryParams, RequestOptions } from '../../types/api';
import type { User } from '../../types';

/**
 * Users Service - Backend Generic Handler integration
 * Resource: /api/v1/data/users
 */
export class UsersService {
  private readonly resource = 'users';

  /**
   * List all users
   * GET /api/v1/data/users
   */
  async list(params?: QueryParams, options?: RequestOptions): Promise<ListResponse<User>> {
    return apiClient.listResources<User>(this.resource, params, options);
  }

  /**
   * Get user by ID
   * GET /api/v1/data/users/:id
   */
  async get(id: string | number, options?: RequestOptions): Promise<ItemResponse<User>> {
    return apiClient.getResource<User>(this.resource, id, options);
  }

  /**
   * Create new user
   * POST /api/v1/data/users
   */
  async create(
    data: Partial<User>,
    options?: RequestOptions
  ): Promise<ItemResponse<User>> {
    return apiClient.createResource<User>(this.resource, data, options);
  }

  /**
   * Update user
   * PUT /api/v1/data/users/:id
   */
  async update(
    id: string | number,
    data: Partial<User>,
    options?: RequestOptions
  ): Promise<ItemResponse<User>> {
    return apiClient.updateResource<User>(this.resource, id, data, options);
  }

  /**
   * Delete user
   * DELETE /api/v1/data/users/:id
   */
  async delete(id: string | number, options?: RequestOptions): Promise<void> {
    await apiClient.deleteResource(this.resource, id, options);
  }

  /**
   * Count users
   * GET /api/v1/data/users/count
   */
  async count(params?: QueryParams, options?: RequestOptions): Promise<number> {
    const response = await apiClient.countResources(this.resource, params, options);
    return response.data || 0;
  }

  /**
   * Get active users
   * GET /api/v1/data/users?filter[is_active]=true
   */
  async getActiveUsers(
    params?: QueryParams,
    options?: RequestOptions
  ): Promise<ListResponse<User>> {
    return this.list({
      ...params,
      filter: { ...params?.filter, is_active: true },
    }, options);
  }

  /**
   * Get admin users
   * GET /api/v1/data/users?filter[is_admin]=true
   */
  async getAdmins(
    params?: QueryParams,
    options?: RequestOptions
  ): Promise<ListResponse<User>> {
    return this.list({
      ...params,
      filter: { ...params?.filter, is_admin: true },
    }, options);
  }

  /**
   * Search users by email or name
   * GET /api/v1/data/users?search=:query
   */
  async search(
    query: string,
    params?: QueryParams,
    options?: RequestOptions
  ): Promise<ListResponse<User>> {
    return this.list({
      ...params,
      search: query,
    }, options);
  }

  /**
   * Update user status (active/inactive)
   * PUT /api/v1/data/users/:id
   */
  async updateStatus(
    id: string | number,
    isActive: boolean,
    options?: RequestOptions
  ): Promise<ItemResponse<User>> {
    return this.update(id, { isActive }, options);
  }

  /**
   * Update user subscription
   * PUT /api/v1/data/users/:id
   */
  async updateSubscription(
    id: string | number,
    subscriptionData: {
      subscriptionType: string;
      maxProjects?: number;
      maxTables?: number;
      subscriptionExpiry?: string;
    },
    options?: RequestOptions
  ): Promise<ItemResponse<User>> {
    return this.update(id, subscriptionData, options);
  }

  /**
   * Get user by email
   * GET /api/v1/data/users?filter[email]=:email
   */
  async getByEmail(
    email: string,
    options?: RequestOptions
  ): Promise<ItemResponse<User> | null> {
    const response = await this.list({
      filter: { email },
      limit: 1,
    }, options);

    return response.data && response.data.length > 0
      ? { success: true, data: response.data[0] }
      : null;
  }
}

// Export singleton instance
export const usersService = new UsersService();
export default usersService;

