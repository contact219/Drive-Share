import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Gets the base URL for the Express API server
 * In development (Expo Go): Uses port 5000 subdomain proxy
 * In production: Uses the main domain (static build served by Express)
 * @returns {string} The API base URL
 */
export function getApiUrl(): string {
  let host = process.env.EXPO_PUBLIC_DOMAIN;

  if (!host) {
    throw new Error("EXPO_PUBLIC_DOMAIN is not set");
  }

  // Check if host contains a port specification (development mode)
  if (host.includes(':5000')) {
    // Development: Use Replit's port-specific subdomain for iOS compatibility
    // Replit provides port-specific URLs like: https://5000-uuid.janeway.replit.dev
    const baseHost = host.split(':')[0];
    // Extract UUID portion and build port-specific subdomain
    const hostParts = baseHost.split('-00-');
    if (hostParts.length === 2) {
      // Transform: uuid-00-hash.janeway.replit.dev:5000 -> 5000-uuid-00-hash.janeway.replit.dev
      const url = new URL(`https://5000-${hostParts[0]}-00-${hostParts[1]}`);
      return url.href;
    }
    // Fallback: just use base host (may not work on iOS)
    return `https://${baseHost}/`;
  }

  // Production: host is already correct (no port)
  let url = new URL(`https://${host}`);
  return url.href;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);

  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join("/") as string, baseUrl);

    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
