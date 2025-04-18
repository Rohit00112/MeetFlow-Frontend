/**
 * API utility functions for making requests to the backend
 */

// Base URL for API requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Types
type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: RequestMethod;
  headers?: Record<string, string>;
  body?: any;
  token?: string;
}

/**
 * Make an API request
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    token,
  } = options;

  // Build request headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authorization header if token is provided
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Build request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // Add body for non-GET requests
  if (method !== 'GET' && body) {
    requestOptions.body = JSON.stringify(body);
  }

  // Make the request
  const response = await fetch(`${API_URL}${endpoint}`, requestOptions);
  
  // Parse the response
  const data = await response.json();
  
  // Handle error responses
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  
  return data;
}

/**
 * Get the authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return localStorage.getItem('token');
}

/**
 * Make an authenticated API request
 */
export async function authenticatedRequest<T = any>(
  endpoint: string,
  options: Omit<RequestOptions, 'token'> = {}
): Promise<T> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  return apiRequest<T>(endpoint, {
    ...options,
    token,
  });
}
