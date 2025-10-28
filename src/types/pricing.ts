// Pricing and campaign-related types

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

