// Project-related types

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

