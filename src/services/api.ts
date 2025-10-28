// API Service for Backend Communication
// NO MOCK DATA - All data from backend API

// Backend API URL - Railway deployment
const API_URL = import.meta.env.VITE_API_URL || 'https://hzmdatabasebackend-production.up.railway.app/api/v1';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from sessionStorage (more secure than localStorage for sensitive tokens)
    this.token = sessionStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(credentials),
        credentials: 'include', // Include cookies for CORS
      });

      const data = await response.json();

      if (response.ok && data.token) {
        this.token = data.token;
        // Use sessionStorage instead of localStorage for better security
        sessionStorage.setItem('auth_token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, data };
      }

      return { success: false, error: data.error || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error - Backend unreachable' };
    }
  }

  async register(data: RegisterData): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok && result.token) {
        this.token = result.token;
        sessionStorage.setItem('auth_token', result.token);
        sessionStorage.setItem('user', JSON.stringify(result.user));
        return { success: true, data: result };
      }

      return { success: false, error: result.error || 'Registration failed' };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Network error - Backend unreachable' };
    }
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.user };
      }

      return { success: false, error: data.error || 'Failed to get user' };
    } catch (error) {
      console.error('Get user error:', error);
      return { success: false, error: 'Network error - Backend unreachable' };
    }
  }

  logout() {
    this.token = null;
    // Clear all session data
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user');
    sessionStorage.clear(); // Remove all session data for security
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  // Generic GET method for authenticated requests
  async get(endpoint: string, options?: { params?: Record<string, string> }): Promise<any> {
    try {
      // Build URL with query parameters
      let url = `${API_URL}${endpoint}`;
      if (options?.params) {
        const queryString = new URLSearchParams(options.params).toString();
        url += `?${queryString}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  }

  // Generic POST method for authenticated requests
  async post(endpoint: string, data?: any): Promise<any> {
    try {
      const url = `${API_URL}${endpoint}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  }

  // Generic PUT method for authenticated requests
  async put(endpoint: string, data?: any): Promise<any> {
    try {
      const url = `${API_URL}${endpoint}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API PUT error:', error);
      throw error;
    }
  }

  // Generic DELETE method for authenticated requests
  async delete(endpoint: string): Promise<any> {
    try {
      const url = `${API_URL}${endpoint}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API DELETE error:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
export default apiService;

