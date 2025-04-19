"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, refreshUserData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // This effect runs only on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Skip auth check for auth pages
    if (pathname.startsWith("/auth")) {
      return;
    }

    // If not loading and no user, redirect to login
    if (!loading && !user && isClient) {
      console.log('No authenticated user found, redirecting to login');
      // Use a slight delay to prevent redirect loops
      const redirectTimer = setTimeout(() => {
        router.push("/auth/login");
      }, 100);

      return () => clearTimeout(redirectTimer);
    }
  }, [user, loading, router, pathname, isClient]);

  // Check token expiration periodically
  useEffect(() => {
    if (!isClient || !user) return;

    // Initial check
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Token not found during expiration check');
        return false;
      }

      // Simple check if token is valid JWT format
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.warn('Invalid token format during expiration check');
        return false;
      }

      try {
        // Check if token is expired
        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.warn('Token expired during expiration check');
          return false;
        }
        return true; // Token is valid
      } catch (error) {
        console.error('Error checking token expiration:', error);
        return false;
      }
    };

    // Perform initial check
    if (!checkTokenExpiration()) {
      console.log('Token invalid or expired, clearing auth state');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use a slight delay to prevent redirect loops
      setTimeout(() => {
        router.push('/auth/login');
      }, 100);
      return; // Don't set up interval if initial check fails
    }

    // Check token every minute
    const checkTokenInterval = setInterval(() => {
      if (!checkTokenExpiration()) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/auth/login');
        clearInterval(checkTokenInterval);
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkTokenInterval);
  }, [isClient, user, router]);

  // Refresh user data periodically
  useEffect(() => {
    if (!isClient || !user) return;

    // Refresh user data every 5 minutes
    const refreshInterval = setInterval(() => {
      refreshUserData().catch(error => {
        console.error('Error refreshing user data:', error);
      });
    }, 300000); // Every 5 minutes

    return () => clearInterval(refreshInterval);
  }, [isClient, user, refreshUserData]);

  // Don't render anything on the server for protected routes
  if (!isClient) {
    return null;
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icon icon="eos-icons:loading" className="animate-spin h-10 w-10 text-blue-500" />
      </div>
    );
  }

  // If on auth page and logged in, redirect to home
  if (!loading && user && pathname.startsWith("/auth")) {
    router.push("/");
    return null;
  }

  // If on protected page and not logged in, component will redirect in useEffect
  // If on auth page and not logged in, show the page
  // If logged in and on protected page, show the page
  return <>{children}</>;
}
