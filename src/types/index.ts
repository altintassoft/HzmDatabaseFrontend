export interface FieldValidation {
  // String validations
  pattern?: string; // Regex pattern
  minLength?: number;
  maxLength?: number;
  
  // Number validations
  minValue?: number;
  maxValue?: number;
  
  // Date validations
  dateType?: 'date' | 'datetime';
  
  // Array validations
  arrayItemType?: string;
  minItemCount?: number;
  maxItemCount?: number;
  
  // Relation validations
  relatedTable?: string;
  relatedField?: string;
  relationshipType?: 'one-to-one' | 'one-to-many' | 'many-to-many';
  cascadeDelete?: boolean;
  
  // Currency validations
  currency?: string;
  decimalPlaces?: number;
  onlyPositive?: boolean;
  autoExchange?: boolean;
  
  // Weight validations
  weightUnit?: string;
  fixUnit?: boolean;
}

export interface FieldRelationship {
  id: string;
  sourceFieldId: string;
  targetTableId: string;
  targetFieldId: string;
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-many';
  cascadeDelete: boolean;
  createdAt: string;
}

export interface Field {
  id: string;
  name: string;
  type: string;
  required: boolean;
  validation?: FieldValidation;
  description?: string;
  relationships?: FieldRelationship[];
}

export interface Table {
  id: string;
  name: string;
  fields: Field[];
}

export interface ApiKey {
  id: string;
  key: string;
  projectId: string;
  name: string;
  permissions: ('read' | 'write' | 'delete' | 'admin')[];
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  usageCount: number;
  rateLimit: number; // requests per minute
}

export interface Project {
  id: string;
  name: string;
  tables: Table[];
  userId: string;
  createdAt: string;
  apiKey: string; // Main API key for the project
  apiKeys: ApiKey[]; // Additional API keys
  description?: string;
  isPublic: boolean;
  settings: {
    allowApiAccess: boolean;
    requireAuth: boolean;
    maxRequestsPerMinute: number;
    enableWebhooks: boolean;
    webhookUrl?: string;
  };
}

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

export interface Campaign {
  id: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_trial';
  discountValue: number;
  
  // Enhanced duration options
  applicableDuration: 'monthly' | 'yearly' | 'both';
  
  // Free trial options
  freeTrialMonths?: number; // For free trial campaigns
  autoChargeAfterTrial?: boolean; // Auto charge after trial ends
  
  // Billing cycle specific discounts
  monthlyDiscount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  yearlyDiscount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  
  isActive: boolean;
  startDate: string;
  endDate: string;
  applicablePlans: string[];
  createdAt: string;
  
  // Campaign conditions
  conditions?: {
    minSubscriptionMonths?: number;
    newUsersOnly?: boolean;
    maxUsagePerUser?: number;
  };
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: 'monthly' | 'yearly';
  maxProjects: number;
  maxTables: number;
  features: string[];
  isActive: boolean;
  planType: 'general' | 'custom';
  campaignId?: string;
  
  // Enhanced pricing options
  yearlyPrice?: number; // Different price for yearly billing
  setupFee?: number;
  trialDays?: number;
}

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
  | { type: 'ADD_FIELD_RELATIONSHIP'; payload: { fieldId: string; relationship: FieldRelationship } }
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