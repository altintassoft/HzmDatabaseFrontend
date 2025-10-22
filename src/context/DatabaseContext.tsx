import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { DatabaseState, DatabaseAction, Project, Table, User, PricingPlan, Campaign, FieldValidation, FieldRelationship, ApiKey } from '../types';
import { ApiKeyGenerator } from '../utils/apiKeyGenerator';

const STORAGE_KEY = 'database_state';
const USERS_KEY = 'database_users';
const PRICING_KEY = 'pricing_plans';
const CAMPAIGNS_KEY = 'campaigns';

// Enhanced default campaigns with flexible billing options
const defaultCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Yıllık Plan İndirimi',
    description: '2 Ay Ücretsiz - Yıllık planlarda %17 indirim',
    discountType: 'percentage',
    discountValue: 17,
    applicableDuration: 'yearly',
    isActive: true,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    applicablePlans: ['basic', 'premium', 'enterprise'],
    createdAt: new Date().toISOString(),
    yearlyDiscount: {
      type: 'percentage',
      value: 17
    }
  },
  {
    id: '2',
    name: '3 Aylık Ücretsiz Deneme',
    description: '3 ay ücretsiz kullanım, sonrasında otomatik ücretlendirme',
    discountType: 'free_trial',
    discountValue: 100,
    applicableDuration: 'both',
    freeTrialMonths: 3,
    autoChargeAfterTrial: true,
    isActive: true,
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    applicablePlans: ['basic', 'premium'],
    createdAt: new Date().toISOString(),
    conditions: {
      newUsersOnly: true,
      maxUsagePerUser: 1
    }
  },
  {
    id: '3',
    name: 'Aylık Plan Kampanyası',
    description: 'İlk ay %50 indirim - Aylık planlar için',
    discountType: 'percentage',
    discountValue: 50,
    applicableDuration: 'monthly',
    isActive: true,
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    applicablePlans: ['basic', 'premium'],
    createdAt: new Date().toISOString(),
    monthlyDiscount: {
      type: 'percentage',
      value: 50
    }
  },
  {
    id: '4',
    name: 'Esnek İndirim Kampanyası',
    description: 'Aylık %25, Yıllık %35 indirim - Tüm planlar',
    discountType: 'percentage',
    discountValue: 25, // Default for monthly
    applicableDuration: 'both',
    isActive: true,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    applicablePlans: ['basic', 'premium', 'enterprise'],
    createdAt: new Date().toISOString(),
    monthlyDiscount: {
      type: 'percentage',
      value: 25
    },
    yearlyDiscount: {
      type: 'percentage',
      value: 35
    }
  }
];

// Enhanced default pricing plans with yearly options
const defaultPricingPlans: PricingPlan[] = [
  {
    id: '1',
    name: 'Ücretsiz',
    price: 0,
    currency: 'TL',
    duration: 'monthly',
    maxProjects: 2,
    maxTables: 5,
    features: ['2 Proje', '5 Tablo', 'Temel Destek', 'API Erişimi'],
    isActive: true,
    planType: 'general',
    trialDays: 0,
  },
  {
    id: '2',
    name: 'Temel',
    price: 99,
    yearlyPrice: 990, // 10 months price for yearly (2 months free)
    currency: 'TL',
    duration: 'monthly',
    maxProjects: 10,
    maxTables: 50,
    features: ['10 Proje', '50 Tablo', 'E-posta Desteği', 'Veri Dışa Aktarma', 'Gelişmiş Alan Tipleri', 'API Rate Limit: 10K/gün'],
    isActive: true,
    planType: 'general',
    trialDays: 7,
  },
  {
    id: '3',
    name: 'Premium',
    price: 299,
    yearlyPrice: 2990, // 10 months price for yearly
    currency: 'TL',
    duration: 'monthly',
    maxProjects: 50,
    maxTables: 200,
    features: ['50 Proje', '200 Tablo', 'Öncelikli Destek', 'API Erişimi', 'Gelişmiş Raporlar', 'Validation Kuralları', 'İlişkisel Tablolar', 'API Rate Limit: 100K/gün'],
    isActive: true,
    planType: 'general',
    trialDays: 14,
  },
  {
    id: '4',
    name: 'Kurumsal',
    price: 999,
    yearlyPrice: 9990, // 10 months price for yearly
    currency: 'TL',
    duration: 'monthly',
    maxProjects: -1, // Unlimited
    maxTables: -1, // Unlimited
    features: ['Sınırsız Proje', 'Sınırsız Tablo', '7/24 Destek', 'Özel Entegrasyon', 'Beyaz Etiket', 'Tüm Gelişmiş Özellikler', 'Sınırsız API Kullanımı', 'Webhook Desteği'],
    isActive: true,
    planType: 'general',
    trialDays: 30,
  },
];

// Default admin user
const defaultAdminUser: User = {
  id: 'admin-1',
  email: 'ozgurhzm@gmail.com',
  name: 'Özgür Admin',
  createdAt: new Date().toISOString(),
  isActive: true,
  isAdmin: true,
  subscriptionType: 'enterprise',
  maxProjects: -1,
  maxTables: -1,
};

// Generate unique ID with better uniqueness
const generateUniqueId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const counter = Math.floor(Math.random() * 1000);
  return `${timestamp}-${random}-${counter}`;
};

// CLEAN DUPLICATES - ONLY BY ID
const cleanDuplicates = (items: any[]) => {
  if (!Array.isArray(items)) return [];
  const seen = new Set();
  return items.filter(item => {
    if (!item || !item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

// CLEAN ALL STORAGE - COMPLETE RESET
const cleanAllStorage = () => {
  console.log('🧹 Cleaning all storage...');
  
  // Remove all project-related data
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.includes('all_projects') || key.includes('table_data_') || key === STORAGE_KEY) {
      localStorage.removeItem(key);
    }
  });
  
  // Initialize clean storage
  localStorage.setItem('all_projects', JSON.stringify([]));
};

// Load initial state from localStorage
const loadInitialState = (): DatabaseState => {
  const savedState = localStorage.getItem(STORAGE_KEY);
  const savedPlans = localStorage.getItem(PRICING_KEY);
  const savedCampaigns = localStorage.getItem(CAMPAIGNS_KEY);
  
  if (savedState) {
    try {
      const state = JSON.parse(savedState);
      return {
        ...state,
        isAuthenticated: !!state.user,
        pricingPlans: savedPlans ? JSON.parse(savedPlans) : defaultPricingPlans,
        campaigns: savedCampaigns ? JSON.parse(savedCampaigns) : defaultCampaigns,
        projects: cleanDuplicates(state.projects || []).map(project => ({
          ...project,
          // Ensure API key exists for existing projects
          apiKey: project.apiKey || ApiKeyGenerator.generateProjectApiKey(project.id, project.name),
          apiKeys: project.apiKeys || [],
          isPublic: project.isPublic || false,
          settings: project.settings || {
            allowApiAccess: true,
            requireAuth: false,
            maxRequestsPerMinute: 1000,
            enableWebhooks: false,
          },
          tables: cleanDuplicates(project.tables || []).map(table => ({
            ...table,
            fields: cleanDuplicates(table.fields || [])
          }))
        })),
      };
    } catch (error) {
      console.error('Error loading initial state:', error);
      cleanAllStorage();
    }
  }
  
  // Save default pricing plans and campaigns
  localStorage.setItem(PRICING_KEY, JSON.stringify(defaultPricingPlans));
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(defaultCampaigns));
  
  return {
    projects: [],
    selectedProject: null,
    selectedTable: null,
    user: null,
    isAuthenticated: false,
    pricingPlans: defaultPricingPlans,
    campaigns: defaultCampaigns,
  };
};

// Load users from localStorage
const loadUsers = (): User[] => {
  const savedUsers = localStorage.getItem(USERS_KEY);
  const users = savedUsers ? JSON.parse(savedUsers) : [];
  
  // Check if admin user exists, if not add it
  const adminExists = users.find((u: User) => u.email === defaultAdminUser.email);
  if (!adminExists) {
    users.push(defaultAdminUser);
    saveUsers(users);
  }
  
  return users;
};

// Save users to localStorage
const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Initial state
const initialState: DatabaseState = loadInitialState();

// Reducer
function databaseReducer(state: DatabaseState, action: DatabaseAction): DatabaseState {
  let newState: DatabaseState;
  
  switch (action.type) {
    case 'LOGIN': {
      // CLEAN LOAD - Remove duplicates on login
      const allProjects = JSON.parse(localStorage.getItem('all_projects') || '[]');
      const cleanedProjects = cleanDuplicates(allProjects);
      
      // Save cleaned projects back
      localStorage.setItem('all_projects', JSON.stringify(cleanedProjects));
      
      // Load user's projects
      const userProjects = cleanedProjects.filter((p: Project) => p.userId === action.payload.user.id);
      
      newState = {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        projects: cleanDuplicates(userProjects).map(project => ({
          ...project,
          // Ensure API key exists
          apiKey: project.apiKey || ApiKeyGenerator.generateProjectApiKey(project.id, project.name),
          apiKeys: project.apiKeys || [],
          isPublic: project.isPublic || false,
          settings: project.settings || {
            allowApiAccess: true,
            requireAuth: false,
            maxRequestsPerMinute: 1000,
            enableWebhooks: false,
          },
          tables: cleanDuplicates(project.tables || []).map(table => ({
            ...table,
            fields: cleanDuplicates(table.fields || [])
          }))
        })),
        selectedProject: null,
        selectedTable: null,
      };
      break;
    }
    case 'LOGOUT': {
      newState = {
        ...state,
        user: null,
        isAuthenticated: false,
        projects: [],
        selectedProject: null,
        selectedTable: null,
      };
      break;
    }
    case 'REGISTER': {
      // User is already saved in the register function, just update state
      newState = {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        projects: [],
        selectedProject: null,
        selectedTable: null,
      };
      break;
    }
    case 'UPDATE_USER_STATUS': {
      const users = loadUsers();
      const updatedUsers = users.map(user => 
        user.id === action.payload.userId 
          ? { ...user, isActive: action.payload.isActive }
          : user
      );
      saveUsers(updatedUsers);
      
      newState = { ...state };
      break;
    }
    case 'UPDATE_USER_SUBSCRIPTION': {
      const users = loadUsers();
      const updatedUsers = users.map(user => 
        user.id === action.payload.userId 
          ? { 
              ...user, 
              subscriptionType: action.payload.subscriptionType,
              maxProjects: action.payload.maxProjects,
              maxTables: action.payload.maxTables,
              subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
            }
          : user
      );
      saveUsers(updatedUsers);
      
      newState = { ...state };
      break;
    }
    case 'DELETE_USER': {
      const users = loadUsers();
      const updatedUsers = users.filter(user => user.id !== action.payload.userId);
      saveUsers(updatedUsers);
      
      // Also delete user's projects
      const allProjects = JSON.parse(localStorage.getItem('all_projects') || '[]');
      const updatedProjects = allProjects.filter((project: Project) => project.userId !== action.payload.userId);
      localStorage.setItem('all_projects', JSON.stringify(updatedProjects));
      
      // If the deleted user is currently logged in, log them out
      if (state.user?.id === action.payload.userId) {
        newState = {
          ...state,
          user: null,
          isAuthenticated: false,
          projects: [],
          selectedProject: null,
          selectedTable: null,
        };
      } else {
        newState = { ...state };
      }
      break;
    }
    case 'ADD_PRICING_PLAN': {
      const updatedPlans = [...state.pricingPlans, action.payload.plan];
      localStorage.setItem(PRICING_KEY, JSON.stringify(updatedPlans));
      
      newState = {
        ...state,
        pricingPlans: updatedPlans,
      };
      break;
    }
    case 'UPDATE_PRICING_PLAN': {
      const updatedPlans = state.pricingPlans.map(plan =>
        plan.id === action.payload.plan.id ? action.payload.plan : plan
      );
      localStorage.setItem(PRICING_KEY, JSON.stringify(updatedPlans));
      
      newState = {
        ...state,
        pricingPlans: updatedPlans,
      };
      break;
    }
    case 'DELETE_PRICING_PLAN': {
      const updatedPlans = state.pricingPlans.filter(plan => plan.id !== action.payload.planId);
      localStorage.setItem(PRICING_KEY, JSON.stringify(updatedPlans));
      
      newState = {
        ...state,
        pricingPlans: updatedPlans,
      };
      break;
    }
    case 'ADD_CAMPAIGN': {
      const updatedCampaigns = [...state.campaigns, action.payload.campaign];
      localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(updatedCampaigns));
      
      newState = {
        ...state,
        campaigns: updatedCampaigns,
      };
      break;
    }
    case 'UPDATE_CAMPAIGN': {
      const updatedCampaigns = state.campaigns.map(campaign =>
        campaign.id === action.payload.campaign.id ? action.payload.campaign : campaign
      );
      localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(updatedCampaigns));
      
      newState = {
        ...state,
        campaigns: updatedCampaigns,
      };
      break;
    }
    case 'DELETE_CAMPAIGN': {
      const updatedCampaigns = state.campaigns.filter(campaign => campaign.id !== action.payload.campaignId);
      localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(updatedCampaigns));
      
      newState = {
        ...state,
        campaigns: updatedCampaigns,
      };
      break;
    }
    case 'ADD_PROJECT': {
      if (!state.user) return state;
      
      // Check project limits
      if (state.user.maxProjects !== -1 && state.projects.length >= state.user.maxProjects) {
        alert('Proje limitinize ulaştınız. Lütfen aboneliğinizi yükseltin.');
        return state;
      }
      
      // Check if project name already exists for this user
      const projectExists = state.projects.some(
        project => project.name.toLowerCase().trim() === action.payload.name.toLowerCase().trim()
      );
      
      if (projectExists) {
        alert('Bu isimde bir proje zaten mevcut. Lütfen farklı bir isim seçin.');
        return state;
      }
      
      // Create new project with unique ID and API key
      const projectId = generateUniqueId();
      const apiKey = ApiKeyGenerator.generateProjectApiKey(projectId, action.payload.name);
      
      const newProject: Project = {
        id: projectId,
        name: action.payload.name.trim(),
        description: action.payload.description?.trim(),
        tables: [],
        userId: state.user.id,
        createdAt: new Date().toISOString(),
        apiKey: apiKey,
        apiKeys: [],
        isPublic: false,
        settings: {
          allowApiAccess: true,
          requireAuth: false,
          maxRequestsPerMinute: state.user.subscriptionType === 'free' ? 100 : 
                                state.user.subscriptionType === 'basic' ? 1000 :
                                state.user.subscriptionType === 'premium' ? 10000 : -1,
          enableWebhooks: state.user.subscriptionType !== 'free',
        },
      };
      
      // Add to all projects with duplicate check
      const allProjects = JSON.parse(localStorage.getItem('all_projects') || '[]');
      const cleanedProjects = cleanDuplicates([...allProjects, newProject]);
      localStorage.setItem('all_projects', JSON.stringify(cleanedProjects));
      
      newState = {
        ...state,
        projects: cleanDuplicates([...state.projects, newProject]),
        selectedProject: newProject,
        selectedTable: null,
      };
      break;
    }
    case 'UPDATE_PROJECT': {
      if (!state.user) return state;
      
      const updatedProjects = state.projects.map((project) => {
        if (project.id === action.payload.projectId) {
          return {
            ...project,
            ...(action.payload.name && { name: action.payload.name.trim() }),
            ...(action.payload.description !== undefined && { description: action.payload.description.trim() }),
            ...(action.payload.settings && { settings: { ...project.settings, ...action.payload.settings } }),
          };
        }
        return project;
      });
      
      // Update all projects in localStorage
      const allProjects = JSON.parse(localStorage.getItem('all_projects') || '[]');
      const updatedAllProjects = allProjects.map((project: Project) => {
        if (project.id === action.payload.projectId) {
          return {
            ...project,
            ...(action.payload.name && { name: action.payload.name.trim() }),
            ...(action.payload.description !== undefined && { description: action.payload.description.trim() }),
            ...(action.payload.settings && { settings: { ...project.settings, ...action.payload.settings } }),
          };
        }
        return project;
      });
      localStorage.setItem('all_projects', JSON.stringify(cleanDuplicates(updatedAllProjects)));
      
      const updatedSelectedProject = state.selectedProject?.id === action.payload.projectId
        ? updatedProjects.find(p => p.id === action.payload.projectId) || null
        : state.selectedProject;
      
      newState = {
        ...state,
        projects: cleanDuplicates(updatedProjects),
        selectedProject: updatedSelectedProject,
      };
      break;
    }
    case 'SELECT_PROJECT': {
      const selectedProject = state.projects.find(
        (project) => project.id === action.payload.projectId
      ) || null;
      newState = {
        ...state,
        selectedProject,
        selectedTable: null,
      };
      break;
    }
    case 'ADD_API_KEY': {
      if (!state.user) return state;
      
      const newApiKey = ApiKeyGenerator.generateKeyWithPermissions(
        action.payload.projectId,
        action.payload.name,
        action.payload.permissions
      );
      
      if (action.payload.expiresAt) {
        newApiKey.expiresAt = action.payload.expiresAt;
      }
      
      const updatedProjects = state.projects.map((project) => {
        if (project.id === action.payload.projectId) {
          return {
            ...project,
            apiKeys: [...project.apiKeys, newApiKey],
          };
        }
        return project;
      });
      
      // Update all projects in localStorage
      const allProjects = JSON.parse(localStorage.getItem('all_projects') || '[]');
      const updatedAllProjects = allProjects.map((project: Project) => {
        if (project.id === action.payload.projectId) {
          return {
            ...project,
            apiKeys: [...project.apiKeys, newApiKey],
          };
        }
        return project;
      });
      localStorage.setItem('all_projects', JSON.stringify(cleanDuplicates(updatedAllProjects)));
      
      const updatedSelectedProject = state.selectedProject?.id === action.payload.projectId
        ? updatedProjects.find(p => p.id === action.payload.projectId) || null
        : state.selectedProject;
      
      newState = {
        ...state,
        projects: cleanDuplicates(updatedProjects),
        selectedProject: updatedSelectedProject,
      };
      break;
    }
    case 'REGENERATE_MAIN_API_KEY': {
      if (!state.user) return state;
      
      const project = state.projects.find(p => p.id === action.payload.projectId);
      if (!project) return state;
      
      const newApiKey = ApiKeyGenerator.generateProjectApiKey(project.id, project.name);
      
      const updatedProjects = state.projects.map((project) => {
        if (project.id === action.payload.projectId) {
          return {
            ...project,
            apiKey: newApiKey,
          };
        }
        return project;
      });
      
      // Update all projects in localStorage
      const allProjects = JSON.parse(localStorage.getItem('all_projects') || '[]');
      const updatedAllProjects = allProjects.map((project: Project) => {
        if (project.id === action.payload.projectId) {
          return {
            ...project,
            apiKey: newApiKey,
          };
        }
        return project;
      });
      localStorage.setItem('all_projects', JSON.stringify(cleanDuplicates(updatedAllProjects)));
      
      const updatedSelectedProject = state.selectedProject?.id === action.payload.projectId
        ? updatedProjects.find(p => p.id === action.payload.projectId) || null
        : state.selectedProject;
      
      newState = {
        ...state,
        projects: cleanDuplicates(updatedProjects),
        selectedProject: updatedSelectedProject,
      };
      break;
    }
    case 'ADD_TABLE': {
      if (!state.selectedProject || !state.user) return state;
      
      // Check table limits
      const totalTables = state.projects.reduce((total, project) => total + project.tables.length, 0);
      if (state.user.maxTables !== -1 && totalTables >= state.user.maxTables) {
        alert('Tablo limitinize ulaştınız. Lütfen aboneliğinizi yükseltin.');
        return state;
      }
      
      // Check if table name already exists in the current project
      const tableExists = state.selectedProject.tables.some(
        table => table.name.toLowerCase().trim() === action.payload.name.toLowerCase().trim()
      );
      
      if (tableExists) {
        alert('Bu isimde bir tablo zaten mevcut. Lütfen farklı bir isim seçin.');
        return state;
      }
      
      const newTable: Table = {
        id: generateUniqueId(),
        name: action.payload.name.trim(),
        fields: [],
      };
      
      const updatedProjects = state.projects.map((project) => {
        if (project.id === state.selectedProject?.id) {
          return {
            ...project,
            tables: cleanDuplicates([...project.tables, newTable]),
          };
        }
        return project;
      });
      
      // Update all projects in localStorage
      const allProjects = JSON.parse(localStorage.getItem('all_projects') || '[]');
      const updatedAllProjects = allProjects.map((project: Project) => {
        if (project.id === state.selectedProject?.id) {
          return {
            ...project,
            tables: cleanDuplicates([...project.tables, newTable]),
          };
        }
        return project;
      });
      localStorage.setItem('all_projects', JSON.stringify(cleanDuplicates(updatedAllProjects)));
      
      const updatedSelectedProject = updatedProjects.find(
        (project) => project.id === state.selectedProject?.id
      ) || null;
      
      newState = {
        ...state,
        projects: cleanDuplicates(updatedProjects),
        selectedProject: updatedSelectedProject,
        selectedTable: newTable,
      };
      break;
    }
    case 'DELETE_TABLE': {
      if (!state.selectedProject || !state.user) return state;
      
      const updatedProjects = state.projects.map((project) => {
        if (project.id === state.selectedProject?.id) {
          return {
            ...project,
            tables: project.tables.filter(table => table.id !== action.payload.tableId),
          };
        }
        return project;
      });
      
      // Update all projects in localStorage
      const allProjects = JSON.parse(localStorage.getItem('all_projects') || '[]');
      const updatedAllProjects = allProjects.map((project: Project) => {
        if (project.id === state.selectedProject?.id) {
          return {
            ...project,
            tables: project.tables.filter((table: Table) => table.id !== action.payload.tableId),
          };
        }
        return project;
      });
      localStorage.setItem('all_projects', JSON.stringify(cleanDuplicates(updatedAllProjects)));
      
      // Also delete table data from localStorage
      localStorage.removeItem(`table_data_${action.payload.tableId}`);
      
      const updatedSelectedProject = updatedProjects.find(
        (project) => project.id === state.selectedProject?.id
      ) || null;
      
      // If the deleted table was selected, clear selection
      const newSelectedTable = state.selectedTable?.id === action.payload.tableId 
        ? null 
        : state.selectedTable;
      
      newState = {
        ...state,
        projects: cleanDuplicates(updatedProjects),
        selectedProject: updatedSelectedProject,
        selectedTable: newSelectedTable,
      };
      break;
    }
    case 'SELECT_TABLE': {
      if (!state.selectedProject) return state;
      
      const selectedTable = state.selectedProject.tables.find(
        (table) => table.id === action.payload.tableId
      ) || null;
      
      newState = {
        ...state,
        selectedTable,
      };
      break;
    }
    case 'ADD_FIELD': {
      if (!state.selectedProject || !state.selectedTable || !state.user) return state;
      
      // Check if field name already exists in the current table
      const fieldExists = state.selectedTable.fields.some(
        field => field.name.toLowerCase().trim() === action.payload.name.toLowerCase().trim()
      );
      
      if (fieldExists) {
        alert('Bu isimde bir alan zaten mevcut. Lütfen farklı bir isim seçin.');
        return state;
      }
      
      const newField = {
        id: generateUniqueId(),
        name: action.payload.name.trim(),
        type: action.payload.type,
        required: action.payload.required,
        validation: action.payload.validation,
        description: action.payload.description,
        relationships: [],
      };
      
      const updatedProjects = state.projects.map((project) => {
        if (project.id === state.selectedProject?.id) {
          const updatedTables = project.tables.map((table) => {
            if (table.id === state.selectedTable?.id) {
              return {
                ...table,
                fields: cleanDuplicates([...table.fields, newField]),
              };
            }
            return table;
          });
          
          return {
            ...project,
            tables: cleanDuplicates(updatedTables),
          };
        }
        return project;
      });
      
      // Update all projects in localStorage
      const allProjects = JSON.parse(localStorage.getItem('all_projects') || '[]');
      const updatedAllProjects = allProjects.map((project: Project) => {
        if (project.id === state.selectedProject?.id) {
          const updatedTables = project.tables.map((table: Table) => {
            if (table.id === state.selectedTable?.id) {
              return {
                ...table,
                fields: cleanDuplicates([...table.fields, newField]),
              };
            }
            return table;
          });
          return {
            ...project,
            tables: cleanDuplicates(updatedTables),
          };
        }
        return project;
      });
      localStorage.setItem('all_projects', JSON.stringify(cleanDuplicates(updatedAllProjects)));
      
      const updatedSelectedProject = updatedProjects.find(
        (project) => project.id === state.selectedProject?.id
      ) || null;
      
      const updatedSelectedTable = updatedSelectedProject?.tables.find(
        (table) => table.id === state.selectedTable?.id
      ) || null;
      
      newState = {
        ...state,
        projects: cleanDuplicates(updatedProjects),
        selectedProject: updatedSelectedProject,
        selectedTable: updatedSelectedTable,
      };
      break;
    }
    case 'UPDATE_FIELD': {
      if (!state.selectedProject || !state.selectedTable || !state.user) return state;
      
      const updatedProjects = state.projects.map((project) => {
        if (project.id === state.selectedProject?.id) {
          const updatedTables = project.tables.map((table) => {
            if (table.id === state.selectedTable?.id) {
              const updatedFields = table.fields.map((field) => {
                if (field.id === action.payload.fieldId) {
                  return {
                    ...field,
                    ...(action.payload.name !== undefined && { name: action.payload.name }),
                    ...(action.payload.type !== undefined && { type: action.payload.type }),
                    ...(action.payload.required !== undefined && { required: action.payload.required }),
                    ...(action.payload.validation !== undefined && { validation: action.payload.validation }),
                    ...(action.payload.description !== undefined && { description: action.payload.description }),
                  };
                }
                return field;
              });
              return {
                ...table,
                fields: updatedFields,
              };
            }
            return table;
          });
          
          return {
            ...project,
            tables: updatedTables,
          };
        }
        return project;
      });
      
      // Update all projects in localStorage
      const allProjects = JSON.parse(localStorage.getItem('all_projects') || '[]');
      const updatedAllProjects = allProjects.map((project: Project) => {
        if (project.id === state.selectedProject?.id) {
          const updatedTables = project.tables.map((table: Table) => {
            if (table.id === state.selectedTable?.id) {
              const updatedFields = table.fields.map((field: any) => {
                if (field.id === action.payload.fieldId) {
                  return {
                    ...field,
                    ...(action.payload.name !== undefined && { name: action.payload.name }),
                    ...(action.payload.type !== undefined && { type: action.payload.type }),
                    ...(action.payload.required !== undefined && { required: action.payload.required }),
                    ...(action.payload.validation !== undefined && { validation: action.payload.validation }),
                    ...(action.payload.description !== undefined && { description: action.payload.description }),
                  };
                }
                return field;
              });
              return {
                ...table,
                fields: updatedFields,
              };
            }
            return table;
          });
          return {
            ...project,
            tables: updatedTables,
          };
        }
        return project;
      });
      localStorage.setItem('all_projects', JSON.stringify(updatedAllProjects));
      
      const updatedSelectedProject = updatedProjects.find(
        (project) => project.id === state.selectedProject?.id
      ) || null;
      
      const updatedSelectedTable = updatedSelectedProject?.tables.find(
        (table) => table.id === state.selectedTable?.id
      ) || null;
      
      newState = {
        ...state,
        projects: updatedProjects,
        selectedProject: updatedSelectedProject,
        selectedTable: updatedSelectedTable,
      };
      break;
    }
    case 'DELETE_FIELD': {
      if (!state.selectedProject || !state.selectedTable || !state.user) return state;
      
      const updatedProjects = state.projects.map((project) => {
        if (project.id === state.selectedProject?.id) {
          const updatedTables = project.tables.map((table) => {
            if (table.id === state.selectedTable?.id) {
              return {
                ...table,
                fields: table.fields.filter(field => field.id !== action.payload.fieldId),
              };
            }
            return table;
          });
          
          return {
            ...project,
            tables: updatedTables,
          };
        }
        return project;
      });
      
      // Update all projects in localStorage
      const allProjects = JSON.parse(localStorage.getItem('all_projects') || '[]');
      const updatedAllProjects = allProjects.map((project: Project) => {
        if (project.id === state.selectedProject?.id) {
          const updatedTables = project.tables.map((table: Table) => {
            if (table.id === state.selectedTable?.id) {
              return {
                ...table,
                fields: table.fields.filter((field: any) => field.id !== action.payload.fieldId),
              };
            }
            return table;
          });
          return {
            ...project,
            tables: updatedTables,
          };
        }
        return project;
      });
      localStorage.setItem('all_projects', JSON.stringify(updatedAllProjects));
      
      const updatedSelectedProject = updatedProjects.find(
        (project) => project.id === state.selectedProject?.id
      ) || null;
      
      const updatedSelectedTable = updatedSelectedProject?.tables.find(
        (table) => table.id === state.selectedTable?.id
      ) || null;
      
      newState = {
        ...state,
        projects: updatedProjects,
        selectedProject: updatedSelectedProject,
        selectedTable: updatedSelectedTable,
      };
      break;
    }
    case 'ADD_FIELD_RELATIONSHIP': {
      if (!state.selectedProject || !state.selectedTable || !state.user) return state;
      
      const updatedProjects = state.projects.map((project) => {
        if (project.id === state.selectedProject?.id) {
          const updatedTables = project.tables.map((table) => {
            if (table.id === state.selectedTable?.id) {
              const updatedFields = table.fields.map((field) => {
                if (field.id === action.payload.fieldId) {
                  return {
                    ...field,
                    relationships: [...(field.relationships || []), action.payload.relationship],
                  };
                }
                return field;
              });
              return {
                ...table,
                fields: updatedFields,
              };
            }
            return table;
          });
          return {
            ...project,
            tables: updatedTables,
          };
        }
        return project;
      });
      
      // Update all projects in localStorage
      const allProjects = JSON.parse(localStorage.getItem('all_projects') || '[]');
      const updatedAllProjects = allProjects.map((project: Project) => {
        if (project.id === state.selectedProject?.id) {
          const updatedTables = project.tables.map((table: Table) => {
            if (table.id === state.selectedTable?.id) {
              const updatedFields = table.fields.map((field: any) => {
                if (field.id === action.payload.fieldId) {
                  return {
                    ...field,
                    relationships: [...(field.relationships || []), action.payload.relationship],
                  };
                }
                return field;
              });
              return {
                ...table,
                fields: updatedFields,
              };
            }
            return table;
          });
          return {
            ...project,
            tables: updatedTables,
          };
        }
        return project;
      });
      localStorage.setItem('all_projects', JSON.stringify(updatedAllProjects));
      
      const updatedSelectedProject = updatedProjects.find(
        (project) => project.id === state.selectedProject?.id
      ) || null;
      
      const updatedSelectedTable = updatedSelectedProject?.tables.find(
        (table) => table.id === state.selectedTable?.id
      ) || null;
      
      newState = {
        ...state,
        projects: updatedProjects,
        selectedProject: updatedSelectedProject,
        selectedTable: updatedSelectedTable,
      };
      break;
    }
    case 'REMOVE_FIELD_RELATIONSHIP': {
      if (!state.selectedProject || !state.selectedTable || !state.user) return state;
      
      const updatedProjects = state.projects.map((project) => {
        if (project.id === state.selectedProject?.id) {
          const updatedTables = project.tables.map((table) => {
            if (table.id === state.selectedTable?.id) {
              const updatedFields = table.fields.map((field) => {
                if (field.id === action.payload.fieldId) {
                  return {
                    ...field,
                    relationships: (field.relationships || []).filter(
                      rel => rel.id !== action.payload.relationshipId
                    ),
                  };
                }
                return field;
              });
              return {
                ...table,
                fields: updatedFields,
              };
            }
            return table;
          });
          return {
            ...project,
            tables: updatedTables,
          };
        }
        return project;
      });
      
      // Update all projects in localStorage
      const allProjects = JSON.parse(localStorage.getItem('all_projects') || '[]');
      const updatedAllProjects = allProjects.map((project: Project) => {
        if (project.id === state.selectedProject?.id) {
          const updatedTables = project.tables.map((table: Table) => {
            if (table.id === state.selectedTable?.id) {
              const updatedFields = table.fields.map((field: any) => {
                if (field.id === action.payload.fieldId) {
                  return {
                    ...field,
                    relationships: (field.relationships || []).filter(
                      (rel: FieldRelationship) => rel.id !== action.payload.relationshipId
                    ),
                  };
                }
                return field;
              });
              return {
                ...table,
                fields: updatedFields,
              };
            }
            return table;
          });
          return {
            ...project,
            tables: updatedTables,
          };
        }
        return project;
      });
      localStorage.setItem('all_projects', JSON.stringify(updatedAllProjects));
      
      const updatedSelectedProject = updatedProjects.find(
        (project) => project.id === state.selectedProject?.id
      ) || null;
      
      const updatedSelectedTable = updatedSelectedProject?.tables.find(
        (table) => table.id === state.selectedTable?.id
      ) || null;
      
      newState = {
        ...state,
        projects: updatedProjects,
        selectedProject: updatedSelectedProject,
        selectedTable: updatedSelectedTable,
      };
      break;
    }
    case 'REORDER_FIELDS': {
      if (!state.selectedProject || !state.selectedTable || !state.user) return state;

      const updatedProjects = state.projects.map((project) => {
        if (project.id === state.selectedProject?.id) {
          const updatedTables = project.tables.map((table) => {
            if (table.id === state.selectedTable?.id) {
              const fields = [...table.fields];
              const [removed] = fields.splice(action.payload.oldIndex, 1);
              fields.splice(action.payload.newIndex, 0, removed);
              return {
                ...table,
                fields: cleanDuplicates(fields),
              };
            }
            return table;
          });
          
          return {
            ...project,
            tables: cleanDuplicates(updatedTables),
          };
        }
        return project;
      });
      
      // Update all projects in localStorage
      const allProjects = JSON.parse(localStorage.getItem('all_projects') || '[]');
      const updatedAllProjects = allProjects.map((project: Project) => {
        if (project.id === state.selectedProject?.id) {
          const updatedTables = project.tables.map((table: Table) => {
            if (table.id === state.selectedTable?.id) {
              const fields = [...table.fields];
              const [removed] = fields.splice(action.payload.oldIndex, 1);
              fields.splice(action.payload.newIndex, 0, removed);
              return {
                ...table,
                fields: cleanDuplicates(fields),
              };
            }
            return table;
          });
          return {
            ...project,
            tables: cleanDuplicates(updatedTables),
          };
        }
        return project;
      });
      localStorage.setItem('all_projects', JSON.stringify(cleanDuplicates(updatedAllProjects)));
      
      const updatedSelectedProject = updatedProjects.find(
        (project) => project.id === state.selectedProject?.id
      ) || null;
      
      const updatedSelectedTable = updatedSelectedProject?.tables.find(
        (table) => table.id === state.selectedTable?.id
      ) || null;
      
      newState = {
        ...state,
        projects: cleanDuplicates(updatedProjects),
        selectedProject: updatedSelectedProject,
        selectedTable: updatedSelectedTable,
      };
      break;
    }
    default:
      return state;
  }
  
  // Save to localStorage after each action (except for user management actions)
  if (!['UPDATE_USER_STATUS', 'UPDATE_USER_SUBSCRIPTION', 'DELETE_USER'].includes(action.type)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }
  return newState;
}

// Context
type DatabaseContextType = {
  state: DatabaseState;
  dispatch: React.Dispatch<DatabaseAction>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  getAllUsers: () => User[];
};

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Provider component
export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(databaseReducer, initialState);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    const users = loadUsers();
    
    // Find user by email
    const user = users.find(u => u.email === email);
    
    // Special case for admin user
    if (email === 'ozgurhzm@gmail.com' && password === '123456') {
      const adminUser = user || defaultAdminUser;
      // Ensure admin user has correct properties
      const updatedAdminUser = {
        ...adminUser,
        isAdmin: true,
        subscriptionType: 'enterprise' as const,
        maxProjects: -1,
        maxTables: -1,
      };
      
      // Update admin user in storage if needed
      if (!user || !user.isAdmin) {
        const updatedUsers = users.filter(u => u.email !== 'ozgurhzm@gmail.com');
        updatedUsers.push(updatedAdminUser);
        saveUsers(updatedUsers);
      }
      
      dispatch({ type: 'LOGIN', payload: { user: updatedAdminUser } });
      return true;
    }
    
    if (user && user.isActive) {
      dispatch({ type: 'LOGIN', payload: { user } });
      return true;
    }
    return false;
  };
  
  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    const users = loadUsers();
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      return false; // User already exists
    }
    
    const newUser: User = {
      id: generateUniqueId(),
      email,
      name,
      createdAt: new Date().toISOString(),
      isActive: true,
      isAdmin: false,
      subscriptionType: 'free',
      maxProjects: 2,
      maxTables: 5,
    };
    
    // Save user to localStorage first
    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    
    // Then dispatch to update state
    dispatch({ type: 'REGISTER', payload: { user: newUser } });
    return true;
  };
  
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };
  
  const getAllUsers = (): User[] => {
    return loadUsers();
  };
  
  return (
    <DatabaseContext.Provider value={{ state, dispatch, login, register, logout, getAllUsers }}>
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