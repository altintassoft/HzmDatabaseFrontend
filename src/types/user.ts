// User-related types

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  isActive: boolean;
  isAdmin: boolean;
  subscriptionType: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionExpiry?: string;
  maxProjects: number;
  maxTables: number;
}




