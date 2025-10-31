// NEW Database Context - API-based (no LocalStorage)
// Migration from LocalStorage to Backend API

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { DatabaseState, DatabaseAction, Project, User, PricingPlan, Campaign } from '../types';
import { apiClient } from '../services/apiClient';
import { projectsService } from '../services/resources';

// Default campaigns and pricing plans (kept for backwards compatibility)
const defaultCampaigns: Campaign[] = [];
const defaultPricingPlans: PricingPlan[] = [];

// Initial state - NO LocalStorage
const initialState: DatabaseState = {
  projects: [],
  selectedProject: null,
  selectedTable: null,
  user: null,
  isAuthenticated: false,
  pricingPlans: defaultPricingPlans,
  campaigns: defaultCampaigns,
};

/**
 * Database Reducer - API-based actions
 * NO LocalStorage operations
 */
function databaseReducer(state: DatabaseState, action: DatabaseAction): DatabaseState {
  switch (action.type) {
    case 'LOGIN': {
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        projects: action.payload.projects || [],
        selectedProject: null,
        selectedTable: null,
      };
    }

    case 'LOGOUT': {
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        projects: [],
        selectedProject: null,
        selectedTable: null,
      };
    }

    case 'REGISTER': {
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        projects: [],
        selectedProject: null,
        selectedTable: null,
      };
    }

    case 'SET_PROJECTS': {
      return {
        ...state,
        projects: action.payload.projects,
      };
    }

    case 'ADD_PROJECT': {
      const newProject = action.payload.project;
      return {
        ...state,
        projects: [...state.projects, newProject],
        selectedProject: newProject,
        selectedTable: null,
      };
    }

    case 'UPDATE_PROJECT': {
      const updatedProjects = state.projects.map((project) =>
        project.id === action.payload.projectId
          ? { ...project, ...action.payload.updates }
          : project
      );

      const updatedSelectedProject = state.selectedProject?.id === action.payload.projectId
        ? updatedProjects.find(p => p.id === action.payload.projectId) || null
        : state.selectedProject;

      return {
        ...state,
        projects: updatedProjects,
        selectedProject: updatedSelectedProject,
      };
    }

    case 'DELETE_PROJECT': {
      const filteredProjects = state.projects.filter(p => p.id !== action.payload.projectId);
      const newSelectedProject = state.selectedProject?.id === action.payload.projectId
        ? null
        : state.selectedProject;

      return {
        ...state,
        projects: filteredProjects,
        selectedProject: newSelectedProject,
        selectedTable: null,
      };
    }

    case 'SELECT_PROJECT': {
      const selectedProject = state.projects.find(
        (project) => project.id === action.payload.projectId
      ) || null;
      return {
        ...state,
        selectedProject,
        selectedTable: null,
      };
    }

    case 'ADD_TABLE': {
      if (!state.selectedProject) return state;

      const newTable = action.payload.table;
      const updatedProjects = state.projects.map((project) =>
        project.id === state.selectedProject?.id
          ? { ...project, tables: [...project.tables, newTable] }
          : project
      );

      const updatedSelectedProject = updatedProjects.find(
        (project) => project.id === state.selectedProject?.id
      ) || null;

      return {
        ...state,
        projects: updatedProjects,
        selectedProject: updatedSelectedProject,
        selectedTable: newTable,
      };
    }

    case 'DELETE_TABLE': {
      if (!state.selectedProject) return state;

      const updatedProjects = state.projects.map((project) =>
        project.id === state.selectedProject?.id
          ? { ...project, tables: project.tables.filter(t => t.id !== action.payload.tableId) }
          : project
      );

      const updatedSelectedProject = updatedProjects.find(
        (project) => project.id === state.selectedProject?.id
      ) || null;

      const newSelectedTable = state.selectedTable?.id === action.payload.tableId
        ? null
        : state.selectedTable;

      return {
        ...state,
        projects: updatedProjects,
        selectedProject: updatedSelectedProject,
        selectedTable: newSelectedTable,
      };
    }

    case 'SELECT_TABLE': {
      if (!state.selectedProject) return state;

      const selectedTable = state.selectedProject.tables.find(
        (table) => table.id === action.payload.tableId
      ) || null;

      return {
        ...state,
        selectedTable,
      };
    }

    // Keep other actions for backwards compatibility
    default:
      return state;
  }
}

// Context type
type DatabaseContextType = {
  state: DatabaseState;
  dispatch: React.Dispatch<DatabaseAction>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  loadUserProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<Project | null>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<boolean>;
  deleteProject: (projectId: string) => Promise<boolean>;
};

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Provider component
export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(databaseReducer, initialState);

  /**
   * Login with backend API
   * Fetches user data and projects after login
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.login(email, password);

      if (!response.success || !response.data) {
        return false;
      }

      const user = response.data.user;

      // Load user's projects from API
      let projects: Project[] = [];
      try {
        const projectsResponse = await projectsService.getUserProjects(user.id);
        if (projectsResponse.success && projectsResponse.data) {
          projects = projectsResponse.data;
        }
      } catch (error) {
        console.warn('Failed to load projects on login:', error);
      }

      // Dispatch LOGIN action
      dispatch({
        type: 'LOGIN',
        payload: { user, projects },
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  /**
   * Register with backend API
   * Auto-login after registration
   */
  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await apiClient.register(email, password, name);

      if (!response.success || !response.data) {
        return false;
      }

      const user = response.data.user;

      // Dispatch REGISTER action (auto-login)
      dispatch({
        type: 'REGISTER',
        payload: { user },
      });

      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  /**
   * Logout
   * Clear API client tokens and reset state
   */
  const logout = () => {
    apiClient.logout();
    dispatch({ type: 'LOGOUT' });
  };

  /**
   * Load user's projects from API
   */
  const loadUserProjects = async () => {
    if (!state.user) return;

    try {
      const response = await projectsService.getUserProjects(state.user.id);
      if (response.success && response.data) {
        dispatch({
          type: 'SET_PROJECTS',
          payload: { projects: response.data },
        });
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  /**
   * Create project via API
   * POST /api/v1/data/projects
   */
  const createProject = async (
    name: string,
    description?: string
  ): Promise<Project | null> => {
    if (!state.user) {
      console.error('User not authenticated');
      return null;
    }

    try {
      const response = await projectsService.create({
        name: name.trim(),
        description: description?.trim(),
        userId: state.user.id,
      });

      if (response.success && response.data) {
        const newProject = response.data;

        dispatch({
          type: 'ADD_PROJECT',
          payload: { project: newProject },
        });

        return newProject;
      }

      return null;
    } catch (error) {
      console.error('Failed to create project:', error);
      return null;
    }
  };

  /**
   * Update project via API
   * PUT /api/v1/data/projects/:id
   */
  const updateProject = async (
    projectId: string,
    updates: Partial<Project>
  ): Promise<boolean> => {
    try {
      const response = await projectsService.update(projectId, updates);

      if (response.success && response.data) {
        dispatch({
          type: 'UPDATE_PROJECT',
          payload: { projectId, updates: response.data },
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to update project:', error);
      return false;
    }
  };

  /**
   * Delete project via API
   * DELETE /api/v1/data/projects/:id
   */
  const deleteProject = async (projectId: string): Promise<boolean> => {
    try {
      await projectsService.delete(projectId);

      dispatch({
        type: 'DELETE_PROJECT',
        payload: { projectId },
      });

      return true;
    } catch (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
  };

  return (
    <DatabaseContext.Provider
      value={{
        state,
        dispatch,
        login,
        register,
        logout,
        loadUserProjects,
        createProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

// Hook
export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}

