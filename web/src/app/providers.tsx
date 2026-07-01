'use client';

import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../lib/auth";

const qc = new QueryClient({ 
  defaultOptions: { 
    queries: { 
      staleTime: 60_000, 
      retry: 1, 
      refetchOnWindowFocus: false 
    } 
  } 
});

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      });
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId="160485266294-9h7890pbh3bdn7ek17kn4f36nt3kl4bo.apps.googleusercontent.com">
      <QueryClientProvider client={qc}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

