/**
 * Token Manager - Centralized token management system
 *
 * This utility provides a consistent way to handle authentication tokens
 * throughout the application, ensuring that the token state is synchronized
 * between localStorage and the Redux store.
 */

// Get token from localStorage
export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const token = localStorage.getItem('token');

    // Validate token format (basic check)
    if (token && (!token.includes('.') || token.split('.').length !== 3)) {
      console.warn('Invalid token format detected in localStorage, clearing token');
      localStorage.removeItem('token');
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error getting token from localStorage:', error);
    return null;
  }
}

// Set token in localStorage
export function setToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Validate token format (basic check)
  if (!token || !token.includes('.') || token.split('.').length !== 3) {
    console.error('Invalid token format, not saving to localStorage');
    return;
  }

  try {
    console.log('Setting token in localStorage');
    localStorage.setItem('token', token);
  } catch (error) {
    console.error('Error setting token in localStorage:', error);
  }
}

// Remove token from localStorage
export function removeToken(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    console.log('Removing token from localStorage');
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Error removing token from localStorage:', error);
  }
}

// Check if token exists
export function hasToken(): boolean {
  return !!getToken();
}

// Clear all auth-related data
export function clearAuthData(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    console.log('Clearing all auth data from localStorage');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Add any other auth-related items that need to be cleared
  } catch (error) {
    console.error('Error clearing auth data from localStorage:', error);
  }
}
