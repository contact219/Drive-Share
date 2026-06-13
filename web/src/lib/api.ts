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

export interface AuthUser { id: string; email: string; name: string; phone?: string | null; avatarIndex?: number; isAdmin?: boolean; isOwner?: boolean; }
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

// ── Trips / bookings ──────────────────────────────────────────────────────
export interface TripQuote {
  available: boolean;
  hours: number;
  days: number;
  baseCost: string;
  insuranceCost: string;
  serviceFee: string;
  totalCost: string;
}
export interface Trip {
  id: string;
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  status: string;
  totalCost: string;
  baseCost?: string;
  insuranceCost?: string;
  serviceFee?: string;
  pickupLocation: string;
  createdAt: string;
  vehicle?: Vehicle | null;
}
export interface HostBooking extends Trip { renterName: string; }

export const quoteTrip = (vehicleId: string, startDate: string, endDate: string, includeInsurance: boolean) =>
  http<TripQuote>("/trips/quote", { method: "POST", body: JSON.stringify({ vehicleId, startDate, endDate, includeInsurance }) });

export interface CreateTripInput {
  userId: string; vehicleId: string; startDate: string; endDate: string;
  totalCost: string; baseCost: string; insuranceCost: string; serviceFee: string;
  pickupLocation: string; status?: string;
}
export const createTrip = (input: CreateTripInput) =>
  http<Trip>("/trips", { method: "POST", body: JSON.stringify({ status: "pending", ...input }) });
export const getMyTrips = () => http<Trip[]>("/trips");
export const cancelTrip = (id: string) =>
  http<Trip>(`/trips/${id}`, { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) });
export const setTripStatus = (id: string, status: string) =>
  http<Trip>(`/trips/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
export const getOwnerBookings = (ownerId: string) => http<HostBooking[]>(`/owner/${ownerId}/bookings`);

// ── Favorites ─────────────────────────────────────────────────────────────
export interface Favorite { id: string; userId: string; vehicleId: string; }
export const getFavorites = (userId: string) => http<Favorite[]>(`/users/${userId}/favorites`);
export const addFavorite = (userId: string, vehicleId: string) =>
  http<Favorite>("/favorites", { method: "POST", body: JSON.stringify({ userId, vehicleId }) });
export const removeFavorite = (userId: string, vehicleId: string) =>
  fetch(`/api/favorites/${userId}/${vehicleId}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });

// ── Profile ───────────────────────────────────────────────────────────────
export const updateProfile = (userId: string, fields: { name?: string; phone?: string }) =>
  http<AuthUser>(`/users/${userId}`, { method: "PATCH", body: JSON.stringify(fields) });

// ── Messaging ─────────────────────────────────────────────────────────────
export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  vehicleId?: string | null;
  tripId?: string | null;
  lastMessageAt?: string;
  lastMessagePreview?: string | null;
  otherParticipantName: string;
  otherParticipantId: string;
  otherParticipantAvatar: number;
  vehicleName?: string | null;
  vehicleImage?: string | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: string;
  senderName: string;
  senderAvatar: number;
}

export const getConversations = (userId: string) => http<Conversation[]>(`/conversations/${userId}`);
export const getMessages = (conversationId: string) => http<Message[]>(`/conversations/${conversationId}/messages`);
export const sendMessage = (conversationId: string, content: string) =>
  http<Message>(`/conversations/${conversationId}/messages`, { method: "POST", body: JSON.stringify({ content }) });
export const getOrCreateConversation = (p1: string, p2: string, vehicleId?: string) =>
  http<{ id: string }>("/conversations", { method: "POST", body: JSON.stringify({ participant1Id: p1, participant2Id: p2, vehicleId }) });
export const getUnreadCount = (userId: string) => http<{ unreadCount: number }>(`/messages/unread/${userId}`);

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
