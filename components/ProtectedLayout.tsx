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
  const { user, loading } = useAuth();
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
      router.push("/auth/login");
    }
  }, [user, loading, router, pathname, isClient]);

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
