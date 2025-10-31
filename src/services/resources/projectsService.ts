// Projects Resource Service
// Generic Handler integration for projects resource

import { apiClient } from '../apiClient';
import type { ListResponse, ItemResponse, QueryParams, RequestOptions } from '../../types/api';
import type { Project } from '../../types';

/**
 * Projects Service - Backend Generic Handler integration
 * Resource: /api/v1/data/projects
 */
export class ProjectsService {
  private readonly resource = 'projects';

  /**
   * List all projects
   * GET /api/v1/data/projects
   */
  async list(params?: QueryParams, options?: RequestOptions): Promise<ListResponse<Project>> {
    return apiClient.listResources<Project>(this.resource, params, options);
  }

  /**
   * Get project by ID
   * GET /api/v1/data/projects/:id
   */
  async get(id: string | number, options?: RequestOptions): Promise<ItemResponse<Project>> {
    return apiClient.getResource<Project>(this.resource, id, options);
  }

  /**
   * Create new project
   * POST /api/v1/data/projects
   */
  async create(
    data: Partial<Project>,
    options?: RequestOptions
  ): Promise<ItemResponse<Project>> {
    return apiClient.createResource<Project>(this.resource, data, options);
  }

  /**
   * Update project
   * PUT /api/v1/data/projects/:id
   */
  async update(
    id: string | number,
    data: Partial<Project>,
    options?: RequestOptions
  ): Promise<ItemResponse<Project>> {
    return apiClient.updateResource<Project>(this.resource, id, data, options);
  }

  /**
   * Delete project
   * DELETE /api/v1/data/projects/:id
   */
  async delete(id: string | number, options?: RequestOptions): Promise<void> {
    await apiClient.deleteResource(this.resource, id, options);
  }

  /**
   * Count projects
   * GET /api/v1/data/projects/count
   */
  async count(params?: QueryParams, options?: RequestOptions): Promise<number> {
    const response = await apiClient.countResources(this.resource, params, options);
    return response.data || 0;
  }

  /**
   * Get user's projects
   * GET /api/v1/data/projects?filter[created_by]=:userId
   * Note: Backend uses created_by field, not user_id or owner_id
   */
  async getUserProjects(
    userId: string | number,
    params?: QueryParams,
    options?: RequestOptions
  ): Promise<ListResponse<Project>> {
    return this.list({
      ...params,
      filter: { ...params?.filter, created_by: userId },
    }, options);
  }

  /**
   * Search projects by name
   * GET /api/v1/data/projects?search=:query
   */
  async search(
    query: string,
    params?: QueryParams,
    options?: RequestOptions
  ): Promise<ListResponse<Project>> {
    return this.list({
      ...params,
      search: query,
    }, options);
  }

  /**
   * Get projects with tables
   * GET /api/v1/data/projects?include=tables
   */
  async listWithTables(
    params?: QueryParams,
    options?: RequestOptions
  ): Promise<ListResponse<Project>> {
    return this.list({
      ...params,
      include: ['tables', ...(params?.include || [])],
    }, options);
  }

  /**
   * Get project statistics
   * Custom endpoint for project stats
   */
  async getStatistics(projectId: string | number): Promise<any> {
    return apiClient.get(`/data/${this.resource}/${projectId}/statistics`);
  }
}

// Export singleton instance
export const projectsService = new ProjectsService();
export default projectsService;

