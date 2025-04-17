"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  updateProfile: (name: string, email: string, profileImage?: string | null) => Promise<void>;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        // In a real app, you would check localStorage, cookies, or make an API call
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to restore authentication state:", error);
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
      // In a real app, you would make an API call here
      // For now, we'll simulate a successful login with a mock user

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock validation
      if (email !== "user@example.com" || password !== "password") {
        throw new Error("Invalid email or password");
      }

      const mockUser: User = {
        id: "1",
        email: email,
        name: "Demo User",
        avatar: "https://ui-avatars.com/api/?name=Demo+User&background=4285F4&color=fff&size=200"
      };

      // Save to localStorage (in a real app, you might use cookies or other methods)
      localStorage.setItem("user", JSON.stringify(mockUser));

      setUser(mockUser);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred");
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
      // In a real app, you would make an API call here
      // For now, we'll simulate a successful registration

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock validation
      if (!name || !email || !password) {
        throw new Error("All fields are required");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Determine avatar - use uploaded image or generate from initials
      let avatar = profileImage;

      // If no profile image was uploaded, use UI Avatars API to generate one based on initials
      if (!avatar) {
        avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff&size=200`;
      }

      const mockUser: User = {
        id: "1",
        email: email,
        name: name,
        avatar: avatar
      };

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(mockUser));

      setUser(mockUser);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);

    try {
      // In a real app, you would make an API call here
      // For now, we'll just clear localStorage

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      localStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      // In a real app, you would make an API call here
      // For now, we'll simulate a successful password reset request

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock validation
      if (!email) {
        throw new Error("Email is required");
      }

      // In a real app, this would send a reset link to the user's email
      console.log(`Password reset link sent to ${email}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (name: string, email: string, profileImage?: string | null) => {
    setLoading(true);
    setError(null);

    try {
      // In a real app, you would make an API call here
      // For now, we'll simulate a successful profile update

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock validation
      if (!name || !email) {
        throw new Error("Name and email are required");
      }

      if (!user) {
        throw new Error("You must be logged in to update your profile");
      }

      // Determine avatar - use uploaded image, current avatar, or generate from initials
      let avatar = profileImage || user.avatar;

      // If no profile image was uploaded and no current avatar, use UI Avatars API
      if (!avatar) {
        avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff&size=200`;
      }

      const updatedUser: User = {
        ...user,
        name,
        email,
        avatar
      };

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setUser(updatedUser);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred");
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
    updateProfile
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
