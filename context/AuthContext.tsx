"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest, authenticatedRequest, getAuthToken } from "@/lib/api";

// Define the User type
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

// Define the AuthContext interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, profileImage?: string | null) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  updateProfile: (name: string, email: string, profileImage?: string | null) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to clear auth state (used internally)
  const clearAuthState = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  // Check if user is already logged in
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        const token = getAuthToken();
        const storedUser = localStorage.getItem('user');

        if (!token || !storedUser) {
          setLoading(false);
          return;
        }

        // Parse stored user data
        setUser(JSON.parse(storedUser));

        try {
          // Validate token with server using the authenticated request utility
          const data = await authenticatedRequest('/auth/me');

          // Update user data from server
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch (error) {
          // If token is invalid, clear auth state
          console.error('Token validation failed:', error);
          clearAuthState();
        }
      } catch (error) {
        console.error('Failed to restore authentication state:', error);
        // Clear invalid auth state
        clearAuthState();
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Use the API utility to make the request
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      // Save token to localStorage
      localStorage.setItem('token', data.token);

      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Register function
  const register = async (name: string, email: string, password: string, profileImage?: string | null) => {
    setLoading(true);
    setError(null);

    try {
      // Validate input
      if (!name || !email || !password) {
        throw new Error('All fields are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Determine avatar - use uploaded image or generate from initials
      let avatar = profileImage;

      // If no profile image was uploaded, use UI Avatars API to generate one based on initials
      if (!avatar) {
        avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff&size=200`;
      }

      // Use the API utility to make the request
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: { name, email, password, avatar },
      });

      // Save token to localStorage
      localStorage.setItem('token', data.token);

      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);

    try {
      // Clear authentication state
      clearAuthState();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      // Validate input
      if (!email) {
        throw new Error('Email is required');
      }

      // Use the API utility to make the request
      const data = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });

      // In development, log the reset link
      if (process.env.NODE_ENV !== 'production' && data.resetLink) {
        console.log('Password reset link:', data.resetLink);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (name: string, email: string, profileImage?: string | null) => {
    setLoading(true);
    setError(null);

    try {
      // Validate input
      if (!name || !email) {
        throw new Error('Name and email are required');
      }

      if (!user) {
        throw new Error('You must be logged in to update your profile');
      }

      // Determine avatar - use uploaded image, current avatar, or generate from initials
      let avatar = profileImage || user.avatar;

      // If no profile image was uploaded and no current avatar, use UI Avatars API
      if (!avatar) {
        avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff&size=200`;
      }

      // Use the authenticated API utility to make the request
      const data = await authenticatedRequest('/auth/update-profile', {
        method: 'PUT',
        body: { name, email, avatar },
      });

      // Save updated user data to localStorage
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (token: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Validate input
      if (!token || !password) {
        throw new Error('Token and password are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Use the API utility to make the request
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: { token, password },
      });

      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Validate input
      if (!currentPassword || !newPassword) {
        throw new Error('Current password and new password are required');
      }

      if (newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters');
      }

      // Use the authenticated API utility to make the request
      await authenticatedRequest('/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      });

      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
