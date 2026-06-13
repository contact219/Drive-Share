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

// ── Host / owner ──────────────────────────────────────────────────────────
export interface OwnerProfile {
  id: string;
  userId: string;
  bio?: string;
  verificationStatus?: string;
  responseRate?: string;
  totalEarnings?: string;
}

export interface VehicleInput {
  name: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  pricePerHour: string;
  imageUrl: string;
  seats: number;
  fuelType: string;
  transmission: string;
  features: string[];
  locationAddress: string;
  locationLat?: string;
  locationLng?: string;
}

export interface OwnerListing {
  id: string;            // ownerVehicle id
  ownerId: string;
  vehicleId: string;
  listingStatus: string; // pending | active | paused
  vehicle: Vehicle | null;
  verificationStatus: string | null; // pending | approved | rejected
  verificationNotes: string | null;
}

export const getOwnerProfile = () => http<OwnerProfile | null>("/owner/profile");
export const createOwnerProfile = (userId: string, bio: string) =>
  http<OwnerProfile>("/owner/profile", { method: "POST", body: JSON.stringify({ userId, bio }) });
export const getOwnerListings = (ownerId: string) => http<OwnerListing[]>(`/owner/${ownerId}/vehicles`);
export const createListing = (ownerId: string, vehicleData: VehicleInput) =>
  http<{ vehicle: Vehicle }>("/owner/vehicles", { method: "POST", body: JSON.stringify({ ownerId, vehicleData }) });
export const updateListingStatus = (ownerVehicleId: string, listingStatus: string) =>
  http<OwnerListing>(`/owner/vehicles/${ownerVehicleId}`, { method: "PATCH", body: JSON.stringify({ listingStatus }) });
export const deleteListing = (ownerVehicleId: string) =>
  fetch(`/api/owner/vehicles/${ownerVehicleId}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });

export async function uploadVehicleImage(file: File): Promise<string> {
  const data: string = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  const res = await http<{ url: string }>("/upload/vehicle-image", {
    method: "POST",
    body: JSON.stringify({ filename: file.name, data, mimeType: file.type }),
  });
  return res.url;
}
