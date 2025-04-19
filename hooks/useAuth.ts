"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchUserProfile } from '@/redux/slices/authSlice';
import { getToken, clearAuthData } from '@/lib/tokenManager';

/**
 * Custom hook for authentication management
 *
 * This hook provides a consistent way to handle authentication
 * throughout the application, ensuring that the token state is
 * synchronized between localStorage and the Redux store.
 */
export function useAuth() {
  const { user, loading, isAuthenticated, token, error } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Check authentication on initial load
  useEffect(() => {
    const localToken = getToken();

    // If we have a token in localStorage but no user in Redux state
    if (localToken && !user && !loading) {
      console.log('Token found in localStorage but no user in Redux state, fetching user profile');
      dispatch(fetchUserProfile());
    }
  }, [user, loading, dispatch]);

  // Handle inconsistent auth states
  useEffect(() => {
    const localToken = getToken();

    // If we have no token in localStorage but have a user in Redux state
    // This is an inconsistent state that needs to be fixed
    if (!localToken && user) {
      console.warn('Inconsistent auth state: User in Redux but no token in localStorage');
      clearAuthData();
      // Use setTimeout to avoid React state updates during rendering
      setTimeout(() => {
        router.push('/auth/login');
      }, 0);
    }
  }, [user, router]);

  // Handle authentication errors
  useEffect(() => {
    if (error && typeof error === 'string' && (
      error.includes('token') ||
      error.includes('authentication') ||
      error.includes('unauthorized') ||
      error.includes('Authentication')
    )) {
      console.error('Authentication error detected:', error);
      clearAuthData();
      // Use setTimeout to avoid React state updates during rendering
      setTimeout(() => {
        router.push('/auth/login');
      }, 0);
    }
  }, [error, router]);

  return {
    user,
    loading,
    isAuthenticated,
    token,
    error
  };
}

export default useAuth;
