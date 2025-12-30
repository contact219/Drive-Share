import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  phone: text("phone"),
  avatarIndex: integer("avatar_index").default(0),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  tripsCompleted: integer("trips_completed").default(0),
  isAdmin: boolean("is_admin").default(false),
  isOwner: boolean("is_owner").default(false),
  notificationPrefs: jsonb("notification_prefs").$type<{ push: boolean; email: boolean; sms: boolean }>().default({ push: true, email: true, sms: false }),
  defaultLocation: jsonb("default_location").$type<{ lat: number; lng: number; address: string }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  trips: many(trips),
  favorites: many(favorites),
}));

export const vehicles = pgTable("vehicles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  type: text("type").notNull(),
  pricePerHour: decimal("price_per_hour", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("4.5"),
  reviewCount: integer("review_count").default(0),
  seats: integer("seats").notNull(),
  fuelType: text("fuel_type").notNull(),
  transmission: text("transmission").notNull(),
  features: jsonb("features").$type<string[]>().default([]),
  locationAddress: text("location_address").notNull(),
  locationLat: decimal("location_lat", { precision: 10, scale: 7 }),
  locationLng: decimal("location_lng", { precision: 10, scale: 7 }),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  trips: many(trips),
  favorites: many(favorites),
}));

export const trips = pgTable("trips", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default("upcoming"),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  baseCost: decimal("base_cost", { precision: 10, scale: 2 }),
  insuranceCost: decimal("insurance_cost", { precision: 10, scale: 2 }),
  serviceFee: decimal("service_fee", { precision: 10, scale: 2 }),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }),
  promoCode: text("promo_code"),
  pickupLocation: text("pickup_location").notNull(),
  hasReview: boolean("has_review").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tripsRelations = relations(trips, ({ one }) => ({
  user: one(users, {
    fields: [trips.userId],
    references: [users.id],
  }),
  vehicle: one(vehicles, {
    fields: [trips.vehicleId],
    references: [vehicles.id],
  }),
}));

export const favorites = pgTable("favorites", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  vehicle: one(vehicles, {
    fields: [favorites.vehicleId],
    references: [vehicles.id],
  }),
}));

export const reviews = pgTable("reviews", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  tripId: varchar("trip_id").references(() => trips.id),
  rating: integer("rating").notNull(),
  title: text("title"),
  comment: text("comment"),
  ownerResponse: text("owner_response"),
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  vehicle: one(vehicles, {
    fields: [reviews.vehicleId],
    references: [vehicles.id],
  }),
  trip: one(trips, {
    fields: [reviews.tripId],
    references: [trips.id],
  }),
}));

export const pushTokens = pgTable("push_tokens", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull(),
  platform: text("platform").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pushTokensRelations = relations(pushTokens, ({ one }) => ({
  user: one(users, {
    fields: [pushTokens.userId],
    references: [users.id],
  }),
}));

export const availabilitySlots = pgTable("availability_slots", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isBlocked: boolean("is_blocked").default(false),
  source: text("source").default("owner"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const availabilitySlotsRelations = relations(availabilitySlots, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [availabilitySlots.vehicleId],
    references: [vehicles.id],
  }),
}));

export const ownerProfiles = pgTable("owner_profiles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  bio: text("bio"),
  verificationStatus: text("verification_status").default("pending"),
  responseRate: decimal("response_rate", { precision: 5, scale: 2 }).default("100.00"),
  totalEarnings: decimal("total_earnings", { precision: 12, scale: 2 }).default("0.00"),
  payoutMethod: jsonb("payout_method").$type<{ type: string; details: Record<string, string> }>(),
  documents: jsonb("documents").$type<{ license?: string; insurance?: string; proofOfOwnership?: string }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ownerProfilesRelations = relations(ownerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [ownerProfiles.userId],
    references: [users.id],
  }),
  ownerVehicles: many(ownerVehicles),
}));

export const ownerVehicles = pgTable("owner_vehicles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => ownerProfiles.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  listingStatus: text("listing_status").default("pending"),
  instantBook: boolean("instant_book").default(false),
  minTripDuration: integer("min_trip_duration").default(1),
  maxTripDuration: integer("max_trip_duration").default(30),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const ownerVehiclesRelations = relations(ownerVehicles, ({ one }) => ({
  owner: one(ownerProfiles, {
    fields: [ownerVehicles.ownerId],
    references: [ownerProfiles.id],
  }),
  vehicle: one(vehicles, {
    fields: [ownerVehicles.vehicleId],
    references: [vehicles.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  password: true,
  phone: true,
  isAdmin: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPushTokenSchema = createInsertSchema(pushTokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAvailabilitySlotSchema = createInsertSchema(availabilitySlots).omit({
  id: true,
  createdAt: true,
});

export const insertOwnerProfileSchema = createInsertSchema(ownerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOwnerVehicleSchema = createInsertSchema(ownerVehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertPushToken = z.infer<typeof insertPushTokenSchema>;
export type PushToken = typeof pushTokens.$inferSelect;
export type InsertAvailabilitySlot = z.infer<typeof insertAvailabilitySlotSchema>;
export type AvailabilitySlot = typeof availabilitySlots.$inferSelect;
export type InsertOwnerProfile = z.infer<typeof insertOwnerProfileSchema>;
export type OwnerProfile = typeof ownerProfiles.$inferSelect;
export type InsertOwnerVehicle = z.infer<typeof insertOwnerVehicleSchema>;
export type OwnerVehicle = typeof ownerVehicles.$inferSelect;
