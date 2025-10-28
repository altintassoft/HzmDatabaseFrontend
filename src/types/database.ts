// Database state and actions

import type { Project, Table, FieldValidation, ApiKey } from './project';
import type { User } from './user';
import type { PricingPlan, Campaign } from './pricing';

export interface DatabaseState {
  projects: Project[];
  selectedProject: Project | null;
  selectedTable: Table | null;
  user: User | null;
  isAuthenticated: boolean;
  pricingPlans: PricingPlan[];
  campaigns: Campaign[];
}

export type DatabaseAction =
  | { type: 'LOGIN'; payload: { user: User } }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER'; payload: { user: User } }
  | { type: 'ADD_PROJECT'; payload: { name: string; description?: string } }
  | { type: 'UPDATE_PROJECT'; payload: { projectId: string; name?: string; description?: string; settings?: Partial<Project['settings']> } }
  | { type: 'SELECT_PROJECT'; payload: { projectId: string } }
  | { type: 'ADD_TABLE'; payload: { name: string } }
  | { type: 'DELETE_TABLE'; payload: { tableId: string } }
  | { type: 'SELECT_TABLE'; payload: { tableId: string } }
  | { type: 'ADD_FIELD'; payload: { name: string; type: string; required: boolean; validation?: FieldValidation; description?: string } }
  | { type: 'UPDATE_FIELD'; payload: { fieldId: string; name?: string; type?: string; required?: boolean; validation?: FieldValidation; description?: string } }
  | { type: 'DELETE_FIELD'; payload: { fieldId: string } }
  | { type: 'REORDER_FIELDS'; payload: { oldIndex: number; newIndex: number } }
  | { type: 'ADD_FIELD_RELATIONSHIP'; payload: { fieldId: string; relationship: import('./project').FieldRelationship } }
  | { type: 'REMOVE_FIELD_RELATIONSHIP'; payload: { fieldId: string; relationshipId: string } }
  | { type: 'ADD_API_KEY'; payload: { projectId: string; name: string; permissions: ApiKey['permissions']; expiresAt?: string } }
  | { type: 'UPDATE_API_KEY'; payload: { projectId: string; keyId: string; name?: string; permissions?: ApiKey['permissions']; isActive?: boolean } }
  | { type: 'DELETE_API_KEY'; payload: { projectId: string; keyId: string } }
  | { type: 'REGENERATE_MAIN_API_KEY'; payload: { projectId: string } }
  | { type: 'UPDATE_USER_STATUS'; payload: { userId: string; isActive: boolean } }
  | { type: 'UPDATE_USER_SUBSCRIPTION'; payload: { userId: string; subscriptionType: User['subscriptionType']; maxProjects: number; maxTables: number } }
  | { type: 'DELETE_USER'; payload: { userId: string } }
  | { type: 'ADD_PRICING_PLAN'; payload: { plan: PricingPlan } }
  | { type: 'UPDATE_PRICING_PLAN'; payload: { plan: PricingPlan } }
  | { type: 'DELETE_PRICING_PLAN'; payload: { planId: string } }
  | { type: 'ADD_CAMPAIGN'; payload: { campaign: Campaign } }
  | { type: 'UPDATE_CAMPAIGN'; payload: { campaign: Campaign } }
  | { type: 'DELETE_CAMPAIGN'; payload: { campaignId: string } };

