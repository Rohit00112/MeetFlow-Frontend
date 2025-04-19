"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchUserProfile, clearError } from "@/redux/slices/authSlice";
import { getToken, clearAuthData } from "@/lib/tokenManager";

export default function ReduxProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // This effect runs only on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check authentication on initial load
  useEffect(() => {
    if (isClient) {
      const localToken = getToken();

      // If we have a token in localStorage but no user in Redux state
      if (localToken && !user) {
        console.log('Token found in localStorage but no user in Redux state, fetching user profile');
        dispatch(fetchUserProfile());
      }
      // If we have no token in localStorage but have a token in Redux state
      // This is an inconsistent state that needs to be fixed
      else if (!localToken && token) {
        console.warn('Inconsistent auth state: Token in Redux but not in localStorage');
        clearAuthData();
        router.push('/auth/login');
      }
      // If we have no token in localStorage and no token in Redux state
      else if (!localToken && !token && !pathname.startsWith("/auth")) {
        console.log('No token found, redirecting to login');
        router.push('/auth/login');
      }
    }
  }, [isClient, token, user, dispatch, router, pathname]);

  // Handle redirects based on authentication state
  useEffect(() => {
    // Skip auth check for auth pages
    if (pathname.startsWith("/auth")) {
      return;
    }

    // If not loading and not authenticated, redirect to login
    if (!loading && !isAuthenticated && isClient) {
      console.log('No authenticated user found, redirecting to login');
      // Clear any errors before redirecting
      dispatch(clearError());
      // Use a slight delay to prevent redirect loops
      const redirectTimer = setTimeout(() => {
        router.push("/auth/login");
      }, 100);

      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, loading, router, pathname, isClient]);

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
  if (!loading && isAuthenticated && pathname.startsWith("/auth")) {
    router.push("/");
    return null;
  }

  // If on protected page and not logged in, component will redirect in useEffect
  // If on auth page and not logged in, show the page
  // If logged in and on protected page, show the page
  return <>{children}</>;
}
