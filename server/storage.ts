import { 
  users, vehicles, trips, favorites, reviews, pushTokens, availabilitySlots, ownerProfiles, ownerVehicles,
  type User, type InsertUser,
  type Vehicle, type InsertVehicle,
  type Trip, type InsertTrip,
  type Favorite, type InsertFavorite,
  type Review, type InsertReview,
  type PushToken, type InsertPushToken,
  type AvailabilitySlot, type InsertAvailabilitySlot,
  type OwnerProfile, type InsertOwnerProfile,
  type OwnerVehicle, type InsertOwnerVehicle,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, or, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  getVehicle(id: string): Promise<Vehicle | undefined>;
  getAllVehicles(): Promise<Vehicle[]>;
  getAvailableVehicles(): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, updates: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;

  getTrip(id: string): Promise<Trip | undefined>;
  getTripsByUser(userId: string): Promise<Trip[]>;
  getAllTrips(): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: string, updates: Partial<InsertTrip>): Promise<Trip | undefined>;

  getFavoritesByUser(userId: string): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, vehicleId: string): Promise<boolean>;

  getReviewsByVehicle(vehicleId: string): Promise<Review[]>;
  getReviewsByUser(userId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, updates: Partial<InsertReview>): Promise<Review | undefined>;

  getPushTokensByUser(userId: string): Promise<PushToken[]>;
  registerPushToken(token: InsertPushToken): Promise<PushToken>;
  deactivatePushToken(token: string): Promise<boolean>;

  getAvailabilitySlots(vehicleId: string, startDate: Date, endDate: Date): Promise<AvailabilitySlot[]>;
  createAvailabilitySlot(slot: InsertAvailabilitySlot): Promise<AvailabilitySlot>;
  deleteAvailabilitySlot(id: string): Promise<boolean>;
  checkAvailability(vehicleId: string, startDate: Date, endDate: Date): Promise<boolean>;

  getOwnerProfile(userId: string): Promise<OwnerProfile | undefined>;
  createOwnerProfile(profile: InsertOwnerProfile): Promise<OwnerProfile>;
  updateOwnerProfile(id: string, updates: Partial<InsertOwnerProfile>): Promise<OwnerProfile | undefined>;

  getOwnerVehicles(ownerId: string): Promise<OwnerVehicle[]>;
  createOwnerVehicle(ownerVehicle: InsertOwnerVehicle): Promise<OwnerVehicle>;
  updateOwnerVehicle(id: string, updates: Partial<InsertOwnerVehicle>): Promise<OwnerVehicle | undefined>;
  deleteOwnerVehicle(id: string): Promise<boolean>;

  getFilteredVehicles(filters: {
    fuelType?: string;
    transmission?: string;
    minPrice?: number;
    maxPrice?: number;
    type?: string;
    minSeats?: number;
    features?: string[];
    lat?: number;
    lng?: number;
    radius?: number;
  }): Promise<Vehicle[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    console.log(`[STORAGE] updateUser called with id: ${id}`);
    console.log(`[STORAGE] Updates:`, JSON.stringify(updates, (key, value) => key === 'password' ? value?.substring(0, 20) + '...' : value));
    
    try {
      const result = await db.update(users).set({ ...updates, updatedAt: new Date() }).where(eq(users.id, id)).returning();
      console.log(`[STORAGE] Update result count: ${result.length}`);
      
      if (result.length > 0) {
        console.log(`[STORAGE] Updated user email: ${result[0].email}`);
        console.log(`[STORAGE] Updated password hash: ${result[0].password?.substring(0, 20)}...`);
      } else {
        console.log(`[STORAGE] No user found with id: ${id}`);
      }
      
      return result[0] || undefined;
    } catch (error) {
      console.error(`[STORAGE] Update error:`, error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    return db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
  }

  async getAvailableVehicles(): Promise<Vehicle[]> {
    return db.select().from(vehicles).where(eq(vehicles.isAvailable, true)).orderBy(desc(vehicles.createdAt));
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values(insertVehicle).returning();
    return vehicle;
  }

  async updateVehicle(id: string, updates: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const [vehicle] = await db.update(vehicles).set({ ...updates, updatedAt: new Date() }).where(eq(vehicles.id, id)).returning();
    return vehicle || undefined;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    await db.delete(vehicles).where(eq(vehicles.id, id));
    return true;
  }

  async getTrip(id: string): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip || undefined;
  }

  async getTripsByUser(userId: string): Promise<Trip[]> {
    return db.select().from(trips).where(eq(trips.userId, userId)).orderBy(desc(trips.createdAt));
  }

  async getAllTrips(): Promise<Trip[]> {
    return db.select().from(trips).orderBy(desc(trips.createdAt));
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const [trip] = await db.insert(trips).values(insertTrip).returning();
    return trip;
  }

  async updateTrip(id: string, updates: Partial<InsertTrip>): Promise<Trip | undefined> {
    const [trip] = await db.update(trips).set({ ...updates, updatedAt: new Date() }).where(eq(trips.id, id)).returning();
    return trip || undefined;
  }

  async getFavoritesByUser(userId: string): Promise<Favorite[]> {
    return db.select().from(favorites).where(eq(favorites.userId, userId));
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db.insert(favorites).values(insertFavorite).returning();
    return favorite;
  }

  async removeFavorite(userId: string, vehicleId: string): Promise<boolean> {
    await db.delete(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.vehicleId, vehicleId))
    );
    return true;
  }

  async getReviewsByVehicle(vehicleId: string): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.vehicleId, vehicleId)).orderBy(desc(reviews.createdAt));
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.userId, userId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    if (insertReview.tripId) {
      await db.update(trips).set({ hasReview: true }).where(eq(trips.id, insertReview.tripId));
    }
    const vehicleReviews = await this.getReviewsByVehicle(insertReview.vehicleId);
    const avgRating = vehicleReviews.reduce((sum, r) => sum + r.rating, 0) / vehicleReviews.length;
    await db.update(vehicles).set({ 
      rating: avgRating.toFixed(1), 
      reviewCount: vehicleReviews.length 
    }).where(eq(vehicles.id, insertReview.vehicleId));
    return review;
  }

  async updateReview(id: string, updates: Partial<InsertReview>): Promise<Review | undefined> {
    const [review] = await db.update(reviews).set({ ...updates, updatedAt: new Date() }).where(eq(reviews.id, id)).returning();
    return review || undefined;
  }

  async getPushTokensByUser(userId: string): Promise<PushToken[]> {
    return db.select().from(pushTokens).where(and(eq(pushTokens.userId, userId), eq(pushTokens.isActive, true)));
  }

  async registerPushToken(insertToken: InsertPushToken): Promise<PushToken> {
    const existing = await db.select().from(pushTokens).where(eq(pushTokens.token, insertToken.token));
    if (existing.length > 0) {
      const [updated] = await db.update(pushTokens).set({ isActive: true, updatedAt: new Date() }).where(eq(pushTokens.token, insertToken.token)).returning();
      return updated;
    }
    const [token] = await db.insert(pushTokens).values(insertToken).returning();
    return token;
  }

  async deactivatePushToken(token: string): Promise<boolean> {
    await db.update(pushTokens).set({ isActive: false, updatedAt: new Date() }).where(eq(pushTokens.token, token));
    return true;
  }

  async getAvailabilitySlots(vehicleId: string, startDate: Date, endDate: Date): Promise<AvailabilitySlot[]> {
    return db.select().from(availabilitySlots).where(
      and(
        eq(availabilitySlots.vehicleId, vehicleId),
        or(
          and(gte(availabilitySlots.startTime, startDate), lte(availabilitySlots.startTime, endDate)),
          and(gte(availabilitySlots.endTime, startDate), lte(availabilitySlots.endTime, endDate)),
          and(lte(availabilitySlots.startTime, startDate), gte(availabilitySlots.endTime, endDate))
        )
      )
    );
  }

  async createAvailabilitySlot(insertSlot: InsertAvailabilitySlot): Promise<AvailabilitySlot> {
    const [slot] = await db.insert(availabilitySlots).values(insertSlot).returning();
    return slot;
  }

  async deleteAvailabilitySlot(id: string): Promise<boolean> {
    await db.delete(availabilitySlots).where(eq(availabilitySlots.id, id));
    return true;
  }

  async checkAvailability(vehicleId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const conflictingTrips = await db.select().from(trips).where(
      and(
        eq(trips.vehicleId, vehicleId),
        or(eq(trips.status, "upcoming"), eq(trips.status, "active")),
        or(
          and(gte(trips.startDate, startDate), lte(trips.startDate, endDate)),
          and(gte(trips.endDate, startDate), lte(trips.endDate, endDate)),
          and(lte(trips.startDate, startDate), gte(trips.endDate, endDate))
        )
      )
    );
    const blockedSlots = await db.select().from(availabilitySlots).where(
      and(
        eq(availabilitySlots.vehicleId, vehicleId),
        eq(availabilitySlots.isBlocked, true),
        or(
          and(gte(availabilitySlots.startTime, startDate), lte(availabilitySlots.startTime, endDate)),
          and(gte(availabilitySlots.endTime, startDate), lte(availabilitySlots.endTime, endDate)),
          and(lte(availabilitySlots.startTime, startDate), gte(availabilitySlots.endTime, endDate))
        )
      )
    );
    return conflictingTrips.length === 0 && blockedSlots.length === 0;
  }

  async getOwnerProfile(userId: string): Promise<OwnerProfile | undefined> {
    const [profile] = await db.select().from(ownerProfiles).where(eq(ownerProfiles.userId, userId));
    return profile || undefined;
  }

  async createOwnerProfile(insertProfile: InsertOwnerProfile): Promise<OwnerProfile> {
    const [profile] = await db.insert(ownerProfiles).values(insertProfile).returning();
    await db.update(users).set({ isOwner: true }).where(eq(users.id, insertProfile.userId));
    return profile;
  }

  async updateOwnerProfile(id: string, updates: Partial<InsertOwnerProfile>): Promise<OwnerProfile | undefined> {
    const [profile] = await db.update(ownerProfiles).set({ ...updates, updatedAt: new Date() }).where(eq(ownerProfiles.id, id)).returning();
    return profile || undefined;
  }

  async getOwnerVehicles(ownerId: string): Promise<OwnerVehicle[]> {
    return db.select().from(ownerVehicles).where(eq(ownerVehicles.ownerId, ownerId));
  }

  async createOwnerVehicle(insertOwnerVehicle: InsertOwnerVehicle): Promise<OwnerVehicle> {
    const [ownerVehicle] = await db.insert(ownerVehicles).values(insertOwnerVehicle).returning();
    return ownerVehicle;
  }

  async updateOwnerVehicle(id: string, updates: Partial<InsertOwnerVehicle>): Promise<OwnerVehicle | undefined> {
    const [ownerVehicle] = await db.update(ownerVehicles).set({ ...updates, updatedAt: new Date() }).where(eq(ownerVehicles.id, id)).returning();
    return ownerVehicle || undefined;
  }

  async deleteOwnerVehicle(id: string): Promise<boolean> {
    await db.delete(ownerVehicles).where(eq(ownerVehicles.id, id));
    return true;
  }

  async getFilteredVehicles(filters: {
    fuelType?: string;
    transmission?: string;
    minPrice?: number;
    maxPrice?: number;
    type?: string;
    minSeats?: number;
    features?: string[];
    lat?: number;
    lng?: number;
    radius?: number;
  }): Promise<Vehicle[]> {
    let query = db.select().from(vehicles).where(eq(vehicles.isAvailable, true));
    const conditions = [eq(vehicles.isAvailable, true)];
    
    if (filters.fuelType) {
      conditions.push(eq(vehicles.fuelType, filters.fuelType));
    }
    if (filters.transmission) {
      conditions.push(eq(vehicles.transmission, filters.transmission));
    }
    if (filters.type) {
      conditions.push(eq(vehicles.type, filters.type));
    }
    if (filters.minPrice) {
      conditions.push(gte(vehicles.pricePerHour, filters.minPrice.toString()));
    }
    if (filters.maxPrice) {
      conditions.push(lte(vehicles.pricePerHour, filters.maxPrice.toString()));
    }
    if (filters.minSeats) {
      conditions.push(gte(vehicles.seats, filters.minSeats));
    }

    const allVehicles = await db.select().from(vehicles).where(and(...conditions)).orderBy(desc(vehicles.createdAt));
    
    let result = allVehicles;
    if (filters.features && filters.features.length > 0) {
      result = result.filter(v => {
        const vehicleFeatures = v.features || [];
        return filters.features!.every(f => vehicleFeatures.includes(f));
      });
    }
    
    if (filters.lat && filters.lng && filters.radius) {
      result = result.filter(v => {
        if (!v.locationLat || !v.locationLng) return true;
        const lat1 = filters.lat!;
        const lon1 = filters.lng!;
        const lat2 = parseFloat(v.locationLat);
        const lon2 = parseFloat(v.locationLng);
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        return distance <= filters.radius!;
      });
    }
    
    return result;
  }
}

export const storage = new DatabaseStorage();
