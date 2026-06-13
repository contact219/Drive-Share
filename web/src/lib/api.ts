export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  pricePerHour: string;
  imageUrl: string;
  rating: string;
  reviewCount: number;
  seats: number;
  fuelType: string;
  transmission: string;
  features: string[];
  locationAddress: string;
  locationLat: string;
  locationLng: string;
  isAvailable: boolean;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName?: string;
}

const TOKEN_KEY = "rush_token";
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function http<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(opts.headers as any) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, { ...opts, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export interface VehicleFilters {
  type?: string;
  fuelType?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  minSeats?: number;
}

export function fetchVehicles(filters: VehicleFilters = {}): Promise<Vehicle[]> {
  const q = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) q.set(k, String(v));
  });
  const qs = q.toString();
  return http<Vehicle[]>(`/vehicles${qs ? `?${qs}` : ""}`);
}

export const fetchVehicle = (id: string) => http<Vehicle>(`/vehicles/${id}`);
export const fetchReviews = (id: string) => http<Review[]>(`/vehicles/${id}/reviews`);

export interface AuthUser { id: string; email: string; name: string; isAdmin?: boolean; isOwner?: boolean; }
export interface AuthResult { user: AuthUser; token: string; }

export const login = (email: string, password: string) =>
  http<AuthResult>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
export const register = (name: string, email: string, password: string) =>
  http<AuthResult>("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
