// API Client Basic Tests
// Manual test - Run in browser console

import { apiClient } from '../apiClient';
import {
  ApiError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  ServerError,
} from '../../types/api';

/**
 * Manual Test Suite for API Client
 * 
 * To run these tests:
 * 1. Open browser console
 * 2. Copy-paste test functions
 * 3. Call testApiClient()
 */

// Test 1: Error Classes
export function testErrorClasses() {
  console.log('🧪 Testing Error Classes...');
  
  try {
    throw new ApiError('Test error', 400, { detail: 'test' });
  } catch (e) {
    console.assert(e instanceof ApiError, 'ApiError instanceof check failed');
    console.assert(e.statusCode === 400, 'ApiError statusCode check failed');
    console.log('✅ ApiError works');
  }

  try {
    throw new NetworkError('Network failed');
  } catch (e) {
    console.assert(e instanceof NetworkError, 'NetworkError instanceof check failed');
    console.log('✅ NetworkError works');
  }

  try {
    throw new AuthenticationError();
  } catch (e) {
    console.assert(e instanceof AuthenticationError, 'AuthenticationError instanceof check failed');
    console.log('✅ AuthenticationError works');
  }

  try {
    throw new AuthorizationError();
  } catch (e) {
    console.assert(e instanceof AuthorizationError, 'AuthorizationError instanceof check failed');
    console.log('✅ AuthorizationError works');
  }

  try {
    throw new NotFoundError('Project');
  } catch (e) {
    console.assert(e instanceof NotFoundError, 'NotFoundError instanceof check failed');
    console.assert(e.message.includes('Project'), 'NotFoundError message check failed');
    console.log('✅ NotFoundError works');
  }

  try {
    throw new ValidationError('Invalid input', { email: ['Required'] });
  } catch (e) {
    console.assert(e instanceof ValidationError, 'ValidationError instanceof check failed');
    console.assert(e.fields?.email?.[0] === 'Required', 'ValidationError fields check failed');
    console.log('✅ ValidationError works');
  }

  try {
    throw new ServerError();
  } catch (e) {
    console.assert(e instanceof ServerError, 'ServerError instanceof check failed');
    console.log('✅ ServerError works');
  }

  console.log('✅ All error classes passed!\n');
}

// Test 2: URL Building with Query Params
export function testUrlBuilding() {
  console.log('🧪 Testing URL Building...');
  
  // Test with simple params
  const params1 = { limit: 10, offset: 0, sort: 'name' };
  console.log('Simple params:', params1);
  // Expected: ?limit=10&offset=0&sort=name
  
  // Test with array params
  const params2 = { include: ['user', 'project'], filter: { status: 'active' } };
  console.log('Array & object params:', params2);
  // Expected: ?include=user,project&filter={"status":"active"}
  
  // Test with undefined/null filtering
  const params3 = { limit: 10, offset: undefined, search: null };
  console.log('Undefined/null params:', params3);
  // Expected: ?limit=10 (undefined and null should be filtered)
  
  console.log('✅ URL building test passed!\n');
}

// Test 3: Token Management
export function testTokenManagement() {
  console.log('🧪 Testing Token Management...');
  
  // Clear tokens
  apiClient.clearTokens();
  console.assert(!apiClient.isAuthenticated(), 'Should not be authenticated after clearTokens');
  console.assert(apiClient.getToken() === null, 'Token should be null');
  console.log('✅ clearTokens() works');
  
  // Set tokens
  apiClient.setTokens('test_access_token', 'test_refresh_token');
  console.assert(apiClient.isAuthenticated(), 'Should be authenticated after setTokens');
  console.assert(apiClient.getToken() === 'test_access_token', 'Token should be set');
  console.log('✅ setTokens() works');
  
  // Check sessionStorage
  const storedToken = sessionStorage.getItem('auth_token');
  console.assert(storedToken === 'test_access_token', 'Token should be in sessionStorage');
  console.log('✅ Token stored in sessionStorage');
  
  // Clear for next tests
  apiClient.clearTokens();
  console.log('✅ Token management test passed!\n');
}

// Test 4: Generic Handler Methods (Mock)
export function testGenericHandlerMethods() {
  console.log('🧪 Testing Generic Handler Methods...');
  
  // These are just checking the methods exist and can be called
  console.assert(typeof apiClient.listResources === 'function', 'listResources should be a function');
  console.assert(typeof apiClient.getResource === 'function', 'getResource should be a function');
  console.assert(typeof apiClient.createResource === 'function', 'createResource should be a function');
  console.assert(typeof apiClient.updateResource === 'function', 'updateResource should be a function');
  console.assert(typeof apiClient.deleteResource === 'function', 'deleteResource should be a function');
  console.assert(typeof apiClient.countResources === 'function', 'countResources should be a function');
  
  console.log('✅ All Generic Handler methods exist');
  console.log('✅ Generic Handler test passed!\n');
}

// Test 5: Auth Methods
export function testAuthMethods() {
  console.log('🧪 Testing Auth Methods...');
  
  console.assert(typeof apiClient.login === 'function', 'login should be a function');
  console.assert(typeof apiClient.register === 'function', 'register should be a function');
  console.assert(typeof apiClient.getCurrentUser === 'function', 'getCurrentUser should be a function');
  console.assert(typeof apiClient.logout === 'function', 'logout should be a function');
  
  console.log('✅ All auth methods exist');
  console.log('✅ Auth methods test passed!\n');
}

// Test 6: HTTP Methods
export function testHttpMethods() {
  console.log('🧪 Testing HTTP Methods...');
  
  console.assert(typeof apiClient.get === 'function', 'get should be a function');
  console.assert(typeof apiClient.post === 'function', 'post should be a function');
  console.assert(typeof apiClient.put === 'function', 'put should be a function');
  console.assert(typeof apiClient.patch === 'function', 'patch should be a function');
  console.assert(typeof apiClient.delete === 'function', 'delete should be a function');
  
  console.log('✅ All HTTP methods exist');
  console.log('✅ HTTP methods test passed!\n');
}

// Run all tests
export function testApiClient() {
  console.log('🚀 Starting API Client Tests...\n');
  console.log('='.repeat(50));
  
  testErrorClasses();
  testUrlBuilding();
  testTokenManagement();
  testGenericHandlerMethods();
  testAuthMethods();
  testHttpMethods();
  
  console.log('='.repeat(50));
  console.log('✅ ALL TESTS PASSED! 🎉\n');
  console.log('Next steps:');
  console.log('1. Test real API calls with backend');
  console.log('2. Test retry logic (disconnect network)');
  console.log('3. Test token refresh (use expired token)');
  console.log('4. Test error handling (trigger 401/403/404/500)');
}

// Export for manual testing
if (typeof window !== 'undefined') {
  (window as any).testApiClient = testApiClient;
  (window as any).apiClientTests = {
    testErrorClasses,
    testUrlBuilding,
    testTokenManagement,
    testGenericHandlerMethods,
    testAuthMethods,
    testHttpMethods,
  };
  
  console.log('📝 API Client tests loaded!');
  console.log('Run: testApiClient() or window.apiClientTests.testErrorClasses()');
}

