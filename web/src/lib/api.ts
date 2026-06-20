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

export interface AuthUser { id: string; email: string; name: string; phone?: string | null; avatarIndex?: number; avatarUrl?: string | null; isAdmin?: boolean; isOwner?: boolean; }
export interface AuthResult { user: AuthUser; token: string; }

export const login = (email: string, password: string) =>
  http<AuthResult>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
export const forgotPassword = (email: string) =>
  http<{ message: string }>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
export const resetPassword = (token: string, newPassword: string) =>
  http<{ message: string }>("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword }) });
export const socialAuth = (provider: string, token: string, name?: string) =>
  http<AuthResult>("/auth/social", { method: "POST", body: JSON.stringify({ provider, token, ...(name ? { name } : {}) }) });
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
export const updateProfile = (userId: string, fields: { name?: string; phone?: string; avatarUrl?: string | null }) =>
  http<AuthUser>(`/users/${userId}`, { method: "PATCH", body: JSON.stringify(fields) });

// ── Admin ─────────────────────────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number; totalVehicles: number; availableVehicles: number;
  totalTrips: number; activeTrips: number; upcomingTrips: number; completedTrips: number;
  totalRevenue: string;
}
export interface AdminUser {
  id: string; email: string; name: string; phone?: string | null;
  isAdmin: boolean; isOwner?: boolean; avatarIndex?: number; createdAt?: string;
}
export interface Verification {
  id: string; vehicleId: string; ownerId?: string; status: string;
  reviewNotes?: string | null; rejectionReason?: string | null; decidedAt?: string | null;
  vehicle?: Vehicle | null; ownerName: string; ownerEmail: string;
}
export interface Payment {
  id: string; tripId: string; userId: string; paypalOrderId?: string;
  amount: string; platformFee?: string; ownerPayout?: string; status: string; createdAt?: string;
}
export interface UserDocument {
  id: string; userId: string; documentType: string; documentUrl?: string | null;
  fileName?: string | null; mimeType?: string | null;
  verificationStatus: string; reviewNotes?: string | null; createdAt?: string;
  userName: string; userEmail: string;
}

export interface UserOwnDocument {
  id: string; userId: string; documentType: string; documentUrl?: string | null;
  fileName?: string | null; mimeType?: string | null;
  verificationStatus: string; reviewNotes?: string | null; createdAt?: string;
}

export const adminGetStats = () => http<AdminStats>('/admin/stats');
export const adminGetUsers = () => http<AdminUser[]>('/admin/users');
export const adminCreateUser = (data: { email: string; name: string; password: string; isAdmin?: boolean }) =>
  http<AdminUser>('/admin/users', { method: 'POST', body: JSON.stringify(data) });
export const adminUpdateUser = (id: string, data: Partial<AdminUser>) =>
  http<AdminUser>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const adminResetPassword = (id: string, password: string) =>
  http(`/admin/users/${id}/password`, { method: 'PATCH', body: JSON.stringify({ password }) });
export const adminDeleteUser = (id: string) =>
  http<{ success: boolean }>(`/admin/users/${id}`, { method: 'DELETE' });
export const adminGetVehicles = () => http<Vehicle[]>('/admin/vehicles');
export const adminUpdateVehicle = (id: string, data: Partial<Vehicle>) =>
  http<Vehicle>(`/admin/vehicles/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const adminDeleteVehicle = (id: string) =>
  fetch(`/api/admin/vehicles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
export const adminGetTrips = () => http<Trip[]>('/admin/trips');
export const adminSendBookingEmail = (tripId: string) =>
  http(`/admin/trips/${tripId}/send-confirmation`, { method: 'POST' });
export const adminGetVerifications = () => http<Verification[]>('/admin/verifications');
export const adminVerifyDecision = (id: string, status: string, reviewerId: string, reviewNotes?: string, rejectionReason?: string) =>
  http(`/admin/verifications/${id}/decision`, { method: 'PATCH', body: JSON.stringify({ status, reviewerId, reviewNotes, rejectionReason }) });
export const adminGetPayments = () => http<Payment[]>('/admin/payments');
export const adminRefundPayment = (id: string) =>
  http(`/admin/payments/${id}/refund`, { method: 'POST' });
export const adminGetDocuments = () => http<UserDocument[]>('/admin/user-documents');
export const adminGetUserDocuments = (userId: string) => http<UserDocument[]>(`/admin/users/${userId}/documents`);
export const adminCreateDocument = (userId: string, documentType: string, notes?: string) =>
  http<UserDocument>('/admin/user-documents', { method: 'POST', body: JSON.stringify({ userId, documentType, notes }) });
export const adminReviewDocument = (id: string, verificationStatus: string, reviewerId: string, reviewNotes?: string) =>
  http(`/admin/user-documents/${id}`, { method: 'PATCH', body: JSON.stringify({ verificationStatus, reviewerId, reviewNotes }) });

export interface PlatformConfig {
  platformFeePercent: number; insuranceRatePerDay: number; minBookingHours: number;
  smtpHost?: string; smtpPort?: number; smtpUser?: string; smtpPass?: string; smtpFrom?: string;
  terms?: string; supportEmail?: string;
}
export const adminGetConfig = () => http<PlatformConfig>('/admin/config');
export const adminSaveConfig = (cfg: Partial<PlatformConfig>) =>
  http<PlatformConfig>('/admin/config', { method: 'PUT', body: JSON.stringify(cfg) });

export interface AuditEntry { ts: string; adminId: string; adminEmail: string; action: string; detail: string; }
export const adminGetAuditLog = () => http<AuditEntry[]>('/admin/audit-log');

export interface ManualCharge { userId: string; amount: number; description: string; tripId?: string; }
export const adminCreateManualCharge = (data: ManualCharge) =>
  http<Payment>('/admin/payments/manual', { method: 'POST', body: JSON.stringify(data) });

export interface ServiceArea {
  id: string; city: string; state: string; stateCode: string;
  active: boolean; addedAt: string; note?: string;
}
export const getServiceAreas = () => http<ServiceArea[]>('/service-areas');
export const adminGetServiceAreas = () => http<ServiceArea[]>('/admin/service-areas');
export const adminSaveServiceAreas = (areas: ServiceArea[]) =>
  http<ServiceArea[]>('/admin/service-areas', { method: 'PUT', body: JSON.stringify({ areas }) });

// ── PayPal ────────────────────────────────────────────────────────────────
export const getPayPalClientId = () => http<{ clientId: string }>("/paypal/client-id");
export const createPayPalOrder = (tripId: string) =>
  http<{ orderId: string; approvalUrl: string; paymentId: string }>("/paypal/create-order", {
    method: "POST",
    body: JSON.stringify({ tripId }),
  });
export const capturePayPalOrder = (orderId: string, paymentId: string, tripId: string) =>
  http<{ success: boolean }>("/paypal/capture-order", {
    method: "POST",
    body: JSON.stringify({ orderId, paymentId, tripId }),
  });

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

// -- Support
export const startSupportThread = (message: string) =>
  http<{ conversationId: string; messageId: string }>('/support/thread', { method: 'POST', body: JSON.stringify({ message }) });

// -- Avatar
export async function uploadAvatar(file: File): Promise<{ url: string }> {
  const data: string = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  return http<{ url: string }>('/upload/avatar', {
    method: 'POST',
    body: JSON.stringify({ data, mimeType: file.type }),
  });
}

// -- User documents
export const getUserDocuments = (userId: string) => http<UserOwnDocument[]>(`/user/${userId}/documents`);
export const deleteUserDocument = (docId: string) =>
  http<{ success: boolean }>(`/user/documents/${docId}`, { method: 'DELETE' });

export async function uploadUserDocument(userId: string, documentType: string, file: File): Promise<UserOwnDocument> {
  const data: string = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  return http<UserOwnDocument>('/user/documents', {
    method: 'POST',
    body: JSON.stringify({ userId, documentType, documentData: data, fileName: file.name, mimeType: file.type }),
  });
}

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
