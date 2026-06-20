var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  availabilitySlots: () => availabilitySlots,
  availabilitySlotsRelations: () => availabilitySlotsRelations,
  conversations: () => conversations,
  conversationsRelations: () => conversationsRelations,
  favorites: () => favorites,
  favoritesRelations: () => favoritesRelations,
  insertAvailabilitySlotSchema: () => insertAvailabilitySlotSchema,
  insertConversationSchema: () => insertConversationSchema,
  insertFavoriteSchema: () => insertFavoriteSchema,
  insertInsurancePolicySchema: () => insertInsurancePolicySchema,
  insertMessageSchema: () => insertMessageSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertOwnerProfileSchema: () => insertOwnerProfileSchema,
  insertOwnerVehicleSchema: () => insertOwnerVehicleSchema,
  insertPasswordResetTokenSchema: () => insertPasswordResetTokenSchema,
  insertPaymentSchema: () => insertPaymentSchema,
  insertPayoutSchema: () => insertPayoutSchema,
  insertPushTokenSchema: () => insertPushTokenSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertTripSchema: () => insertTripSchema,
  insertUserDocumentSchema: () => insertUserDocumentSchema,
  insertUserSchema: () => insertUserSchema,
  insertVehicleSchema: () => insertVehicleSchema,
  insertVehicleVerificationSchema: () => insertVehicleVerificationSchema,
  insurancePolicies: () => insurancePolicies,
  insurancePoliciesRelations: () => insurancePoliciesRelations,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  notifications: () => notifications,
  ownerProfiles: () => ownerProfiles,
  ownerProfilesRelations: () => ownerProfilesRelations,
  ownerVehicles: () => ownerVehicles,
  ownerVehiclesRelations: () => ownerVehiclesRelations,
  passwordResetTokens: () => passwordResetTokens,
  passwordResetTokensRelations: () => passwordResetTokensRelations,
  payments: () => payments,
  paymentsRelations: () => paymentsRelations,
  payouts: () => payouts,
  payoutsRelations: () => payoutsRelations,
  pushTokens: () => pushTokens,
  pushTokensRelations: () => pushTokensRelations,
  reviews: () => reviews,
  reviewsRelations: () => reviewsRelations,
  trips: () => trips,
  tripsRelations: () => tripsRelations,
  userDocuments: () => userDocuments,
  userDocumentsRelations: () => userDocumentsRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  vehicleVerifications: () => vehicleVerifications,
  vehicleVerificationsRelations: () => vehicleVerificationsRelations,
  vehicles: () => vehicles,
  vehiclesRelations: () => vehiclesRelations
});
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users, usersRelations, vehicles, vehiclesRelations, trips, tripsRelations, favorites, favoritesRelations, reviews, reviewsRelations, pushTokens, pushTokensRelations, availabilitySlots, availabilitySlotsRelations, ownerProfiles, ownerProfilesRelations, ownerVehicles, ownerVehiclesRelations, vehicleVerifications, vehicleVerificationsRelations, insurancePolicies, insurancePoliciesRelations, payments, paymentsRelations, payouts, payoutsRelations, userDocuments, userDocumentsRelations, insertUserSchema, insertVehicleSchema, insertTripSchema, insertFavoriteSchema, insertReviewSchema, insertPushTokenSchema, insertAvailabilitySlotSchema, insertOwnerProfileSchema, insertOwnerVehicleSchema, insertVehicleVerificationSchema, insertInsurancePolicySchema, insertPaymentSchema, insertPayoutSchema, insertUserDocumentSchema, conversations, conversationsRelations, messages, messagesRelations, insertConversationSchema, insertMessageSchema, passwordResetTokens, passwordResetTokensRelations, insertPasswordResetTokenSchema, notifications, insertNotificationSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      email: text("email").notNull().unique(),
      name: text("name").notNull(),
      password: text("password").notNull(),
      phone: text("phone"),
      avatarIndex: integer("avatar_index").default(0),
      avatarUrl: text("avatar_url"),
      rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
      tripsCompleted: integer("trips_completed").default(0),
      isAdmin: boolean("is_admin").default(false),
      isOwner: boolean("is_owner").default(false),
      notificationPrefs: jsonb("notification_prefs").$type().default({ push: true, email: true, sms: false }),
      defaultLocation: jsonb("default_location").$type(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    usersRelations = relations(users, ({ many }) => ({
      trips: many(trips),
      favorites: many(favorites)
    }));
    vehicles = pgTable("vehicles", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
      features: jsonb("features").$type().default([]),
      locationAddress: text("location_address").notNull(),
      locationLat: decimal("location_lat", { precision: 10, scale: 7 }),
      locationLng: decimal("location_lng", { precision: 10, scale: 7 }),
      isAvailable: boolean("is_available").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    vehiclesRelations = relations(vehicles, ({ many }) => ({
      trips: many(trips),
      favorites: many(favorites)
    }));
    trips = pgTable("trips", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
      updatedAt: timestamp("updated_at").defaultNow()
    });
    tripsRelations = relations(trips, ({ one }) => ({
      user: one(users, {
        fields: [trips.userId],
        references: [users.id]
      }),
      vehicle: one(vehicles, {
        fields: [trips.vehicleId],
        references: [vehicles.id]
      })
    }));
    favorites = pgTable("favorites", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
      createdAt: timestamp("created_at").defaultNow()
    });
    favoritesRelations = relations(favorites, ({ one }) => ({
      user: one(users, {
        fields: [favorites.userId],
        references: [users.id]
      }),
      vehicle: one(vehicles, {
        fields: [favorites.vehicleId],
        references: [vehicles.id]
      })
    }));
    reviews = pgTable("reviews", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
      tripId: varchar("trip_id").references(() => trips.id),
      rating: integer("rating").notNull(),
      title: text("title"),
      comment: text("comment"),
      ownerResponse: text("owner_response"),
      helpfulCount: integer("helpful_count").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    reviewsRelations = relations(reviews, ({ one }) => ({
      user: one(users, {
        fields: [reviews.userId],
        references: [users.id]
      }),
      vehicle: one(vehicles, {
        fields: [reviews.vehicleId],
        references: [vehicles.id]
      }),
      trip: one(trips, {
        fields: [reviews.tripId],
        references: [trips.id]
      })
    }));
    pushTokens = pgTable("push_tokens", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      token: text("token").notNull(),
      platform: text("platform").notNull(),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    pushTokensRelations = relations(pushTokens, ({ one }) => ({
      user: one(users, {
        fields: [pushTokens.userId],
        references: [users.id]
      })
    }));
    availabilitySlots = pgTable("availability_slots", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
      startTime: timestamp("start_time").notNull(),
      endTime: timestamp("end_time").notNull(),
      isBlocked: boolean("is_blocked").default(false),
      source: text("source").default("owner"),
      createdAt: timestamp("created_at").defaultNow()
    });
    availabilitySlotsRelations = relations(availabilitySlots, ({ one }) => ({
      vehicle: one(vehicles, {
        fields: [availabilitySlots.vehicleId],
        references: [vehicles.id]
      })
    }));
    ownerProfiles = pgTable("owner_profiles", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id).unique(),
      bio: text("bio"),
      verificationStatus: text("verification_status").default("pending"),
      responseRate: decimal("response_rate", { precision: 5, scale: 2 }).default("100.00"),
      totalEarnings: decimal("total_earnings", { precision: 12, scale: 2 }).default("0.00"),
      payoutMethod: jsonb("payout_method").$type(),
      documents: jsonb("documents").$type(),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    ownerProfilesRelations = relations(ownerProfiles, ({ one, many }) => ({
      user: one(users, {
        fields: [ownerProfiles.userId],
        references: [users.id]
      }),
      ownerVehicles: many(ownerVehicles)
    }));
    ownerVehicles = pgTable("owner_vehicles", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      ownerId: varchar("owner_id").notNull().references(() => ownerProfiles.id),
      vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
      listingStatus: text("listing_status").default("pending"),
      instantBook: boolean("instant_book").default(false),
      minTripDuration: integer("min_trip_duration").default(1),
      maxTripDuration: integer("max_trip_duration").default(30),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    ownerVehiclesRelations = relations(ownerVehicles, ({ one }) => ({
      owner: one(ownerProfiles, {
        fields: [ownerVehicles.ownerId],
        references: [ownerProfiles.id]
      }),
      vehicle: one(vehicles, {
        fields: [ownerVehicles.vehicleId],
        references: [vehicles.id]
      })
    }));
    vehicleVerifications = pgTable("vehicle_verifications", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
      ownerId: varchar("owner_id").notNull().references(() => ownerProfiles.id),
      status: text("status").notNull().default("pending"),
      reviewerId: varchar("reviewer_id").references(() => users.id),
      reviewNotes: text("review_notes"),
      submittedDocuments: jsonb("submitted_documents").$type(),
      submittedAt: timestamp("submitted_at").defaultNow(),
      decidedAt: timestamp("decided_at"),
      rejectionReason: text("rejection_reason"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    vehicleVerificationsRelations = relations(vehicleVerifications, ({ one }) => ({
      vehicle: one(vehicles, {
        fields: [vehicleVerifications.vehicleId],
        references: [vehicles.id]
      }),
      owner: one(ownerProfiles, {
        fields: [vehicleVerifications.ownerId],
        references: [ownerProfiles.id]
      }),
      reviewer: one(users, {
        fields: [vehicleVerifications.reviewerId],
        references: [users.id]
      })
    }));
    insurancePolicies = pgTable("insurance_policies", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      ownerId: varchar("owner_id").references(() => ownerProfiles.id),
      userId: varchar("user_id").references(() => users.id),
      providerType: text("provider_type").notNull().default("owner"),
      providerName: text("provider_name"),
      policyNumber: text("policy_number"),
      coverageType: text("coverage_type"),
      effectiveDate: timestamp("effective_date"),
      expiryDate: timestamp("expiry_date"),
      documentUrl: text("document_url"),
      premiumCost: decimal("premium_cost", { precision: 10, scale: 2 }),
      verificationStatus: text("verification_status").default("pending"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    insurancePoliciesRelations = relations(insurancePolicies, ({ one }) => ({
      owner: one(ownerProfiles, {
        fields: [insurancePolicies.ownerId],
        references: [ownerProfiles.id]
      }),
      user: one(users, {
        fields: [insurancePolicies.userId],
        references: [users.id]
      })
    }));
    payments = pgTable("payments", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      tripId: varchar("trip_id").notNull().references(() => trips.id),
      userId: varchar("user_id").notNull().references(() => users.id),
      paypalOrderId: text("paypal_order_id"),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      platformFee: decimal("platform_fee", { precision: 10, scale: 2 }),
      ownerPayout: decimal("owner_payout", { precision: 10, scale: 2 }),
      status: text("status").notNull().default("pending"),
      receiptUrl: text("receipt_url"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    paymentsRelations = relations(payments, ({ one }) => ({
      trip: one(trips, {
        fields: [payments.tripId],
        references: [trips.id]
      }),
      user: one(users, {
        fields: [payments.userId],
        references: [users.id]
      })
    }));
    payouts = pgTable("payouts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      ownerId: varchar("owner_id").notNull().references(() => ownerProfiles.id),
      paymentId: varchar("payment_id").references(() => payments.id),
      paypalPayoutId: text("paypal_payout_id"),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      status: text("status").notNull().default("pending"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    payoutsRelations = relations(payouts, ({ one }) => ({
      owner: one(ownerProfiles, {
        fields: [payouts.ownerId],
        references: [ownerProfiles.id]
      }),
      payment: one(payments, {
        fields: [payouts.paymentId],
        references: [payments.id]
      })
    }));
    userDocuments = pgTable("user_documents", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      documentType: text("document_type").notNull(),
      documentUrl: text("document_url"),
      documentData: text("document_data"),
      fileName: text("file_name"),
      mimeType: text("mime_type"),
      verificationStatus: text("verification_status").default("pending"),
      reviewerId: varchar("reviewer_id").references(() => users.id),
      reviewNotes: text("review_notes"),
      expiryDate: timestamp("expiry_date"),
      submittedAt: timestamp("submitted_at").defaultNow(),
      reviewedAt: timestamp("reviewed_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    userDocumentsRelations = relations(userDocuments, ({ one }) => ({
      user: one(users, {
        fields: [userDocuments.userId],
        references: [users.id]
      }),
      reviewer: one(users, {
        fields: [userDocuments.reviewerId],
        references: [users.id]
      })
    }));
    insertUserSchema = createInsertSchema(users).pick({
      email: true,
      name: true,
      password: true,
      phone: true,
      isAdmin: true
    });
    insertVehicleSchema = createInsertSchema(vehicles).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertTripSchema = createInsertSchema(trips).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertFavoriteSchema = createInsertSchema(favorites).omit({
      id: true,
      createdAt: true
    });
    insertReviewSchema = createInsertSchema(reviews).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPushTokenSchema = createInsertSchema(pushTokens).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertAvailabilitySlotSchema = createInsertSchema(availabilitySlots).omit({
      id: true,
      createdAt: true
    });
    insertOwnerProfileSchema = createInsertSchema(ownerProfiles).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertOwnerVehicleSchema = createInsertSchema(ownerVehicles).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertVehicleVerificationSchema = createInsertSchema(vehicleVerifications).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertInsurancePolicySchema = createInsertSchema(insurancePolicies).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPaymentSchema = createInsertSchema(payments).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPayoutSchema = createInsertSchema(payouts).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertUserDocumentSchema = createInsertSchema(userDocuments).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    conversations = pgTable("conversations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      participant1Id: varchar("participant1_id").notNull().references(() => users.id),
      participant2Id: varchar("participant2_id").notNull().references(() => users.id),
      vehicleId: varchar("vehicle_id").references(() => vehicles.id),
      tripId: varchar("trip_id").references(() => trips.id),
      lastMessageAt: timestamp("last_message_at").defaultNow(),
      lastMessagePreview: text("last_message_preview"),
      participant1Unread: integer("participant1_unread").default(0),
      participant2Unread: integer("participant2_unread").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    conversationsRelations = relations(conversations, ({ one, many }) => ({
      participant1: one(users, {
        fields: [conversations.participant1Id],
        references: [users.id],
        relationName: "participant1"
      }),
      participant2: one(users, {
        fields: [conversations.participant2Id],
        references: [users.id],
        relationName: "participant2"
      }),
      vehicle: one(vehicles, {
        fields: [conversations.vehicleId],
        references: [vehicles.id]
      }),
      trip: one(trips, {
        fields: [conversations.tripId],
        references: [trips.id]
      }),
      messages: many(messages)
    }));
    messages = pgTable("messages", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
      senderId: varchar("sender_id").notNull().references(() => users.id),
      content: text("content").notNull(),
      messageType: text("message_type").default("text"),
      // text, image, system
      isRead: boolean("is_read").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    messagesRelations = relations(messages, ({ one }) => ({
      conversation: one(conversations, {
        fields: [messages.conversationId],
        references: [conversations.id]
      }),
      sender: one(users, {
        fields: [messages.senderId],
        references: [users.id]
      })
    }));
    insertConversationSchema = createInsertSchema(conversations).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertMessageSchema = createInsertSchema(messages).omit({
      id: true,
      createdAt: true
    });
    passwordResetTokens = pgTable("password_reset_tokens", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      token: text("token").notNull().unique(),
      expiresAt: timestamp("expires_at").notNull(),
      used: boolean("used").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
      user: one(users, {
        fields: [passwordResetTokens.userId],
        references: [users.id]
      })
    }));
    insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
      id: true,
      createdAt: true
    });
    notifications = pgTable("notifications", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      type: text("type").notNull(),
      title: text("title").notNull(),
      body: text("body").notNull(),
      link: text("link"),
      isRead: boolean("is_read").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertNotificationSchema = createInsertSchema(notifications);
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  pool: () => pool
});
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
var Pool, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    ({ Pool } = pg);
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema: schema_exports });
  }
});

// server/index.ts
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

// server/routes.ts
import { createServer } from "node:http";
import * as crypto from "node:crypto";
import * as fs2 from "node:fs";
import * as path2 from "node:path";

// server/storage.ts
init_schema();
init_db();
import { eq, desc, and, gte, lte, or, sql as sql2 } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async getAllUsers() {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }
  async updateUser(id, updates) {
    const [result] = await db.update(users).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return result || void 0;
  }
  async deleteUser(id) {
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }
  async getVehicle(id) {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || void 0;
  }
  async getAllVehicles() {
    return db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
  }
  async getAvailableVehicles() {
    return db.select().from(vehicles).where(eq(vehicles.isAvailable, true)).orderBy(desc(vehicles.createdAt));
  }
  async createVehicle(insertVehicle) {
    const [vehicle] = await db.insert(vehicles).values(insertVehicle).returning();
    return vehicle;
  }
  async updateVehicle(id, updates) {
    const [vehicle] = await db.update(vehicles).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(vehicles.id, id)).returning();
    return vehicle || void 0;
  }
  async deleteVehicle(id) {
    await db.delete(vehicles).where(eq(vehicles.id, id));
    return true;
  }
  async getTrip(id) {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip || void 0;
  }
  async getTripsByUser(userId) {
    return db.select().from(trips).where(eq(trips.userId, userId)).orderBy(desc(trips.createdAt));
  }
  async getAllTrips() {
    return db.select().from(trips).orderBy(desc(trips.createdAt));
  }
  async createTrip(insertTrip) {
    const [trip] = await db.insert(trips).values(insertTrip).returning();
    return trip;
  }
  async updateTrip(id, updates) {
    const [trip] = await db.update(trips).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(trips.id, id)).returning();
    return trip || void 0;
  }
  async getFavoritesByUser(userId) {
    return db.select().from(favorites).where(eq(favorites.userId, userId));
  }
  async addFavorite(insertFavorite) {
    const [favorite] = await db.insert(favorites).values(insertFavorite).returning();
    return favorite;
  }
  async removeFavorite(userId, vehicleId) {
    await db.delete(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.vehicleId, vehicleId))
    );
    return true;
  }
  async getReviewsByVehicle(vehicleId) {
    return db.select().from(reviews).where(eq(reviews.vehicleId, vehicleId)).orderBy(desc(reviews.createdAt));
  }
  async getReviewsByUser(userId) {
    return db.select().from(reviews).where(eq(reviews.userId, userId)).orderBy(desc(reviews.createdAt));
  }
  async createReview(insertReview) {
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
  async updateReview(id, updates) {
    const [review] = await db.update(reviews).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(reviews.id, id)).returning();
    return review || void 0;
  }
  async getPushTokensByUser(userId) {
    return db.select().from(pushTokens).where(and(eq(pushTokens.userId, userId), eq(pushTokens.isActive, true)));
  }
  async registerPushToken(insertToken) {
    const existing = await db.select().from(pushTokens).where(eq(pushTokens.token, insertToken.token));
    if (existing.length > 0) {
      const [updated] = await db.update(pushTokens).set({ isActive: true, updatedAt: /* @__PURE__ */ new Date() }).where(eq(pushTokens.token, insertToken.token)).returning();
      return updated;
    }
    const [token] = await db.insert(pushTokens).values(insertToken).returning();
    return token;
  }
  async deactivatePushToken(token) {
    await db.update(pushTokens).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(eq(pushTokens.token, token));
    return true;
  }
  async getAvailabilitySlots(vehicleId, startDate, endDate) {
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
  async createAvailabilitySlot(insertSlot) {
    const [slot] = await db.insert(availabilitySlots).values(insertSlot).returning();
    return slot;
  }
  async deleteAvailabilitySlot(id) {
    await db.delete(availabilitySlots).where(eq(availabilitySlots.id, id));
    return true;
  }
  async checkAvailability(vehicleId, startDate, endDate) {
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
  async getOwnerProfile(userId) {
    const [profile] = await db.select().from(ownerProfiles).where(eq(ownerProfiles.userId, userId));
    return profile || void 0;
  }
  async createOwnerProfile(insertProfile) {
    const [profile] = await db.insert(ownerProfiles).values(insertProfile).returning();
    await db.update(users).set({ isOwner: true }).where(eq(users.id, insertProfile.userId));
    return profile;
  }
  async updateOwnerProfile(id, updates) {
    const [profile] = await db.update(ownerProfiles).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(ownerProfiles.id, id)).returning();
    return profile || void 0;
  }
  async getOwnerVehicles(ownerId) {
    return db.select().from(ownerVehicles).where(eq(ownerVehicles.ownerId, ownerId));
  }
  async createOwnerVehicle(insertOwnerVehicle) {
    const [ownerVehicle] = await db.insert(ownerVehicles).values(insertOwnerVehicle).returning();
    return ownerVehicle;
  }
  async updateOwnerVehicle(id, updates) {
    const [ownerVehicle] = await db.update(ownerVehicles).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(ownerVehicles.id, id)).returning();
    return ownerVehicle || void 0;
  }
  async deleteOwnerVehicle(id) {
    await db.delete(ownerVehicles).where(eq(ownerVehicles.id, id));
    return true;
  }
  async getFilteredVehicles(filters) {
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
      result = result.filter((v) => {
        const vehicleFeatures = v.features || [];
        return filters.features.every((f) => vehicleFeatures.includes(f));
      });
    }
    if (filters.lat && filters.lng && filters.radius) {
      result = result.filter((v) => {
        if (!v.locationLat || !v.locationLng) return true;
        const lat1 = filters.lat;
        const lon1 = filters.lng;
        const lat2 = parseFloat(v.locationLat);
        const lon2 = parseFloat(v.locationLng);
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance <= filters.radius;
      });
    }
    return result;
  }
  async getPendingVerifications() {
    return db.select().from(vehicleVerifications).where(eq(vehicleVerifications.status, "pending")).orderBy(desc(vehicleVerifications.submittedAt));
  }
  async getAllVerifications() {
    return db.select().from(vehicleVerifications).orderBy(desc(vehicleVerifications.createdAt));
  }
  async getVerification(id) {
    const [verification] = await db.select().from(vehicleVerifications).where(eq(vehicleVerifications.id, id));
    return verification || void 0;
  }
  async createVerification(data) {
    const [verification] = await db.insert(vehicleVerifications).values(data).returning();
    return verification;
  }
  async updateVerification(id, updates) {
    const [verification] = await db.update(vehicleVerifications).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(vehicleVerifications.id, id)).returning();
    return verification || void 0;
  }
  async getInsurancePolicies() {
    return db.select().from(insurancePolicies).orderBy(desc(insurancePolicies.createdAt));
  }
  async getInsurancePolicy(id) {
    const [policy] = await db.select().from(insurancePolicies).where(eq(insurancePolicies.id, id));
    return policy || void 0;
  }
  async getInsurancePoliciesByOwner(ownerId) {
    return db.select().from(insurancePolicies).where(eq(insurancePolicies.ownerId, ownerId));
  }
  async createInsurancePolicy(data) {
    const [policy] = await db.insert(insurancePolicies).values(data).returning();
    return policy;
  }
  async updateInsurancePolicy(id, updates) {
    const [policy] = await db.update(insurancePolicies).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(insurancePolicies.id, id)).returning();
    return policy || void 0;
  }
  async getAllPayments() {
    return db.select().from(payments).orderBy(desc(payments.createdAt));
  }
  async getPayment(id) {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || void 0;
  }
  async getPaymentByTrip(tripId) {
    const [payment] = await db.select().from(payments).where(eq(payments.tripId, tripId));
    return payment || void 0;
  }
  async createPayment(data) {
    const [payment] = await db.insert(payments).values(data).returning();
    return payment;
  }
  async updatePayment(id, updates) {
    const [payment] = await db.update(payments).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(payments.id, id)).returning();
    return payment || void 0;
  }
  async getAllPayouts() {
    return db.select().from(payouts).orderBy(desc(payouts.createdAt));
  }
  async createPayout(data) {
    const [payout] = await db.insert(payouts).values(data).returning();
    return payout;
  }
  async updatePayout(id, updates) {
    const [payout] = await db.update(payouts).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(payouts.id, id)).returning();
    return payout || void 0;
  }
  async getAnalytics() {
    const allTrips = await this.getAllTrips();
    const allPayments = await this.getAllPayments();
    const pendingVerifs = await this.getPendingVerifications();
    const owners = await db.select().from(ownerProfiles);
    const totalRevenue = allTrips.reduce((sum, t) => sum + parseFloat(t.totalCost || "0"), 0);
    const platformFees = allPayments.reduce((sum, p) => sum + parseFloat(p.platformFee || "0"), 0);
    const tripsByStatus = [
      { status: "upcoming", count: allTrips.filter((t) => t.status === "upcoming").length },
      { status: "active", count: allTrips.filter((t) => t.status === "active").length },
      { status: "completed", count: allTrips.filter((t) => t.status === "completed").length },
      { status: "cancelled", count: allTrips.filter((t) => t.status === "cancelled").length }
    ];
    const revenueByMonth = [];
    const monthMap = /* @__PURE__ */ new Map();
    allTrips.forEach((trip) => {
      const month = new Date(trip.createdAt).toISOString().slice(0, 7);
      monthMap.set(month, (monthMap.get(month) || 0) + parseFloat(trip.totalCost || "0"));
    });
    monthMap.forEach((revenue, month) => {
      revenueByMonth.push({ month, revenue });
    });
    revenueByMonth.sort((a, b) => a.month.localeCompare(b.month));
    const vehicleTrips = /* @__PURE__ */ new Map();
    for (const trip of allTrips) {
      const existing = vehicleTrips.get(trip.vehicleId) || { count: 0, revenue: 0, name: "" };
      existing.count++;
      existing.revenue += parseFloat(trip.totalCost || "0");
      vehicleTrips.set(trip.vehicleId, existing);
    }
    const allVehicles = await this.getAllVehicles();
    const vehicleNames = new Map(allVehicles.map((v) => [v.id, v.name]));
    const topVehicles = Array.from(vehicleTrips.entries()).map(([id, data]) => ({ id, name: vehicleNames.get(id) || "Unknown", trips: data.count, revenue: data.revenue })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    return {
      totalRevenue,
      totalTrips: allTrips.length,
      completedTrips: allTrips.filter((t) => t.status === "completed").length,
      activeTrips: allTrips.filter((t) => t.status === "active").length,
      pendingVerifications: pendingVerifs.length,
      totalOwners: owners.length,
      totalPayments: allPayments.length,
      platformFees,
      revenueByMonth,
      tripsByStatus,
      topVehicles
    };
  }
  async getUserDocuments(userId) {
    return db.select().from(userDocuments).where(eq(userDocuments.userId, userId)).orderBy(desc(userDocuments.createdAt));
  }
  async getUserDocumentById(id) {
    const [doc] = await db.select().from(userDocuments).where(eq(userDocuments.id, id));
    return doc || void 0;
  }
  async getAllUserDocuments() {
    return db.select().from(userDocuments).orderBy(desc(userDocuments.submittedAt));
  }
  async getPendingUserDocuments() {
    return db.select().from(userDocuments).where(eq(userDocuments.verificationStatus, "pending")).orderBy(desc(userDocuments.submittedAt));
  }
  async createUserDocument(data) {
    const [doc] = await db.insert(userDocuments).values(data).returning();
    return doc;
  }
  async updateUserDocument(id, updates) {
    const [doc] = await db.update(userDocuments).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(userDocuments.id, id)).returning();
    return doc || void 0;
  }
  async deleteUserDocument(id) {
    const result = await db.delete(userDocuments).where(eq(userDocuments.id, id));
    return true;
  }
  // Messaging methods
  async getConversationsByUser(userId) {
    return db.select().from(conversations).where(or(
      eq(conversations.participant1Id, userId),
      eq(conversations.participant2Id, userId)
    )).orderBy(desc(conversations.lastMessageAt));
  }
  async getConversation(id) {
    const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conv || void 0;
  }
  async findExistingConversation(participant1Id, participant2Id, vehicleId) {
    const [conv] = await db.select().from(conversations).where(and(
      or(
        and(eq(conversations.participant1Id, participant1Id), eq(conversations.participant2Id, participant2Id)),
        and(eq(conversations.participant1Id, participant2Id), eq(conversations.participant2Id, participant1Id))
      ),
      vehicleId ? eq(conversations.vehicleId, vehicleId) : sql2`true`
    ));
    return conv || void 0;
  }
  async createConversation(data) {
    const [conv] = await db.insert(conversations).values(data).returning();
    return conv;
  }
  async updateConversation(id, updates) {
    const [conv] = await db.update(conversations).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(conversations.id, id)).returning();
    return conv || void 0;
  }
  async getMessagesByConversation(conversationId) {
    return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }
  async createMessage(data) {
    const [msg] = await db.insert(messages).values(data).returning();
    return msg;
  }
  async markMessagesAsRead(conversationId, userId) {
    await db.update(messages).set({ isRead: true }).where(and(
      eq(messages.conversationId, conversationId),
      sql2`${messages.senderId} != ${userId}`
    ));
  }
  async getUnreadMessageCount(userId) {
    const convs = await this.getConversationsByUser(userId);
    let count = 0;
    for (const conv of convs) {
      if (conv.participant1Id === userId) {
        count += conv.participant1Unread || 0;
      } else {
        count += conv.participant2Unread || 0;
      }
    }
    return count;
  }
  async createPasswordResetToken(userId, token, expiresAt) {
    const [result] = await db.insert(passwordResetTokens).values({ userId, token, expiresAt }).returning();
    return result;
  }
  async getPasswordResetToken(token) {
    const [result] = await db.select().from(passwordResetTokens).where(and(
      eq(passwordResetTokens.token, token),
      eq(passwordResetTokens.used, false),
      gte(passwordResetTokens.expiresAt, /* @__PURE__ */ new Date())
    ));
    return result || void 0;
  }
  async markTokenUsed(token) {
    await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.token, token));
  }
  async createNotification(data) {
    const [result] = await db.insert(notifications).values(data).returning();
    return result;
  }
  async getNotifications(userId, limit = 50) {
    return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(limit);
  }
  async getUnreadNotificationCount(userId) {
    const result = await db.select({ count: sql2`count(*)` }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return Number(result[0]?.count ?? 0);
  }
  async markNotificationRead(id, userId) {
    await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }
  async markAllNotificationsRead(userId) {
    await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
init_schema();
import * as bcrypt from "bcryptjs";

// server/seedIfEmpty.ts
init_db();
init_schema();
import { sql as sql3 } from "drizzle-orm";
var DEV_VEHICLES = [
  {
    id: "e2811f8e-ffe4-43a9-9f25-89cebd1a2a0c",
    name: "Tesla Model 3",
    brand: "Tesla",
    model: "Model 3",
    year: 2024,
    type: "sedan",
    pricePerHour: "18.00",
    imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
    rating: "4.9",
    reviewCount: 127,
    seats: 5,
    fuelType: "electric",
    transmission: "automatic",
    features: ["Autopilot", "Premium Sound", "Heated Seats", "Navigation"],
    locationAddress: "123 Market St, San Francisco, CA",
    locationLat: "37.7937",
    locationLng: "-122.3965",
    isAvailable: true
  },
  {
    id: "b5a7228a-3c30-464e-a81a-6c7b7102658d",
    name: "BMW X5",
    brand: "BMW",
    model: "X5",
    year: 2023,
    type: "suv",
    pricePerHour: "28.00",
    imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
    rating: "4.7",
    reviewCount: 89,
    seats: 7,
    fuelType: "gas",
    transmission: "automatic",
    features: ["Leather Seats", "Panoramic Roof", "Apple CarPlay", "Parking Sensors"],
    locationAddress: "456 Mission St, San Francisco, CA",
    locationLat: "37.7879",
    locationLng: "-122.4007",
    isAvailable: true
  },
  {
    id: "8946bfb9-8efd-4a08-9854-841f44846aba",
    name: "Porsche 911",
    brand: "Porsche",
    model: "911",
    year: 2024,
    type: "sports",
    pricePerHour: "65.00",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
    rating: "5.0",
    reviewCount: 45,
    seats: 2,
    fuelType: "gas",
    transmission: "manual",
    features: ["Sport Exhaust", "Track Mode", "Carbon Fiber Interior", "Launch Control"],
    locationAddress: "789 Folsom St, San Francisco, CA",
    locationLat: "37.7847",
    locationLng: "-122.3927",
    isAvailable: true
  },
  {
    id: "c06be65e-bb59-418d-af78-7d491fa0bdad",
    name: "Toyota Camry",
    brand: "Toyota",
    model: "Camry",
    year: 2023,
    type: "sedan",
    pricePerHour: "12.00",
    imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
    rating: "4.6",
    reviewCount: 203,
    seats: 5,
    fuelType: "hybrid",
    transmission: "automatic",
    features: ["Fuel Efficient", "Bluetooth", "Backup Camera", "USB Charging"],
    locationAddress: "321 Howard St, San Francisco, CA",
    locationLat: "37.7889",
    locationLng: "-122.3952",
    isAvailable: true
  },
  {
    id: "37a4e7fc-eff2-40d1-b97e-8a27dbd4ccd3",
    name: "Mercedes-Benz GLE",
    brand: "Mercedes-Benz",
    model: "GLE",
    year: 2024,
    type: "suv",
    pricePerHour: "42.00",
    imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
    rating: "4.9",
    reviewCount: 58,
    seats: 5,
    fuelType: "gas",
    transmission: "automatic",
    features: ["Air Suspension", "Burmester Sound", "MBUX", "360 Camera"],
    locationAddress: "888 Brannan St, San Francisco, CA",
    locationLat: "37.7718",
    locationLng: "-122.4031",
    isAvailable: true
  },
  {
    id: "54facea2-3d6f-4828-97d5-b1a82b06af1d",
    name: "Chevrolet Corvette",
    brand: "Chevrolet",
    model: "Corvette",
    year: 2024,
    type: "sports",
    pricePerHour: "75.00",
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
    rating: "5.0",
    reviewCount: 32,
    seats: 2,
    fuelType: "gas",
    transmission: "automatic",
    features: ["Mid-Engine", "Magnetic Ride", "Performance Data Recorder", "Z51 Package"],
    locationAddress: "100 Embarcadero, San Francisco, CA",
    locationLat: "37.7941",
    locationLng: "-122.3931",
    isAvailable: true
  },
  {
    id: "fd3c1a22-5b44-4e7a-8d59-2c6f90a1b3e8",
    name: "Ford Mustang GT",
    brand: "Ford",
    model: "Mustang GT",
    year: 2024,
    type: "sports",
    pricePerHour: "35.00",
    imageUrl: "https://images.unsplash.com/photo-1584345604476-8ec5f82d5b21?w=800",
    rating: "4.8",
    reviewCount: 76,
    seats: 4,
    fuelType: "gas",
    transmission: "manual",
    features: ["V8 Engine", "Active Exhaust", "Track Apps", "Premium Audio"],
    locationAddress: "555 California St, San Francisco, CA",
    locationLat: "37.7922",
    locationLng: "-122.4036",
    isAvailable: true
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Honda CR-V",
    brand: "Honda",
    model: "CR-V",
    year: 2023,
    type: "suv",
    pricePerHour: "15.00",
    imageUrl: "https://images.unsplash.com/photo-1568844293986-8c3a4c5c5bd7?w=800",
    rating: "4.5",
    reviewCount: 156,
    seats: 5,
    fuelType: "hybrid",
    transmission: "automatic",
    features: ["Honda Sensing", "Apple CarPlay", "Wireless Charging", "Roof Rails"],
    locationAddress: "999 Van Ness Ave, San Francisco, CA",
    locationLat: "37.7858",
    locationLng: "-122.4224",
    isAvailable: true
  },
  {
    id: "ed89c42a-3432-42c6-9230-d8bbafa1ad69",
    name: "Ram ProMaster",
    brand: "Dodge",
    model: "Ram ProMaster",
    year: 2025,
    type: "van",
    pricePerHour: "18.00",
    imageUrl: "https://www.stellantisfleet.com/content/dam/fca-fleet/na/fleet/en_us/ramtrucks/2025/promaster/GALLERY_3.jpg.fleetimage.1440.jpg",
    rating: "4.5",
    reviewCount: 0,
    seats: 8,
    fuelType: "gas",
    transmission: "automatic",
    features: ["Heated Steering Wheel", "Heated Front Seats", "Second-Row Sunshades"],
    locationAddress: "Philadelphia, PA",
    locationLat: null,
    locationLng: null,
    isAvailable: true
  },
  {
    id: "504999d1-4ebd-4884-a966-c16d6c7cc2c0",
    name: "Chrysler Pacifica",
    brand: "Chrysler",
    model: "Pacifica",
    year: 2025,
    type: "van",
    pricePerHour: "15.00",
    imageUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
    rating: "4.5",
    reviewCount: 0,
    seats: 5,
    fuelType: "gas",
    transmission: "automatic",
    features: ["GPS", "Bluetooth", "Backup Camera", "Heated Seats", "Sunroof", "USB Charging", "Apple CarPlay", "Android Auto"],
    locationAddress: "1500 Market St, Philadelphia, PA",
    locationLat: null,
    locationLng: null,
    isAvailable: false
  },
  {
    id: "b11c5568-9fee-497c-be69-248baeff135c",
    name: "Ford F150",
    brand: "Ford",
    model: "F150",
    year: 2023,
    type: "truck",
    pricePerHour: "15.00",
    imageUrl: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
    rating: "4.5",
    reviewCount: 0,
    seats: 5,
    fuelType: "gas",
    transmission: "automatic",
    features: ["Bluetooth", "GPS", "Android Auto", "Apple CarPlay"],
    locationAddress: "1420 Main Street, Dallas, TX",
    locationLat: null,
    locationLng: null,
    isAvailable: false
  }
];
var DEV_USERS = [
  {
    id: "7a5dffab-1f02-4c3d-9311-13671c1ef7a1",
    email: "admin@rush.com",
    name: "Admin User",
    password: "$2b$10$JyzHXCF266eKGg9rXuyvl..jHZNRIGbRbjOYUYDyUmux7Jl/zN/Ae",
    isAdmin: true,
    isOwner: false,
    rating: "5.0",
    tripsCompleted: 0,
    avatarIndex: 0
  },
  {
    id: "539ca065-9345-4e4b-929d-73111052fb60",
    email: "jarrelasparks@gmail.com",
    name: "Jarrela Sparks",
    password: "$2b$10$kkKrC0Dmz.GpNNzgwaAAdeoedAqJPG6UVAy8Z7LIJgGU11o7cVR8S",
    isAdmin: false,
    isOwner: true,
    rating: "5.0",
    tripsCompleted: 0,
    avatarIndex: 0
  },
  {
    id: "055775e6-f39e-43f7-aa05-e9d7ec949752",
    email: "dgreen610@gmail.com",
    name: "Darrin Smith",
    password: "$2b$10$pto8qSzVBJMBSdCJwWKGT.EV1WFMS/ZMYhtLaNIU5Xciq3npzzRBC",
    isAdmin: false,
    isOwner: true,
    rating: "5.0",
    tripsCompleted: 0,
    avatarIndex: 0
  },
  {
    id: "6971cbcb-1a17-4fc3-bf20-1a4929ad16c8",
    email: "nshotwell9@gmail.com",
    name: "Nice Sparks",
    password: "$2b$10$KyCgqWSjfOUobEzRcQMnI.8HxETiJoRg7lbl92vOrX9Znw7NbpHiS",
    isAdmin: false,
    isOwner: true,
    rating: "5.0",
    tripsCompleted: 0,
    avatarIndex: 0
  },
  {
    id: "50589ef2-300f-4e36-810e-5e0d36d43bbf",
    email: "tsparks@deployp2v.com",
    name: "T. Sparks",
    password: "$2b$10$hUsaWoPH89xAp35LYaE7wONIteWecjzt6N7WM4uo7ompfkZuONhAy",
    isAdmin: false,
    isOwner: true,
    rating: "5.0",
    tripsCompleted: 0,
    avatarIndex: 0
  },
  {
    id: "783de35c-f579-4bb9-82e1-5649c3cb669c",
    email: "newadmin@rush.com",
    name: "New Admin",
    password: "$2b$10$M4HmAB9ERXmLBEOqWgk4juzO72gD5n7Ewb2fBQI/WiGYRC271JSBi",
    isAdmin: true,
    isOwner: false,
    rating: "5.0",
    tripsCompleted: 0,
    avatarIndex: 0
  }
];
var DEV_OWNER_PROFILES = [
  {
    id: "d0335301-4aab-433c-acba-da858ba24754",
    userId: "539ca065-9345-4e4b-929d-73111052fb60",
    verificationStatus: "pending",
    responseRate: "100.00",
    totalEarnings: "0.00"
  },
  {
    id: "244c44e0-e12b-4aea-a538-0a8aca996b2b",
    userId: "055775e6-f39e-43f7-aa05-e9d7ec949752",
    verificationStatus: "pending",
    responseRate: "100.00",
    totalEarnings: "0.00"
  },
  {
    id: "90f90df2-5400-43e4-9f9d-295a68d2d808",
    userId: "6971cbcb-1a17-4fc3-bf20-1a4929ad16c8",
    verificationStatus: "pending",
    responseRate: "100.00",
    totalEarnings: "0.00"
  },
  {
    id: "cb9a148f-fade-464d-979b-e3839622f957",
    userId: "50589ef2-300f-4e36-810e-5e0d36d43bbf",
    verificationStatus: "pending",
    responseRate: "100.00",
    totalEarnings: "0.00"
  }
];
var DEV_OWNER_VEHICLES = [
  {
    id: "60291809-3e1f-47ba-ad7d-9838d68d2890",
    ownerId: "244c44e0-e12b-4aea-a538-0a8aca996b2b",
    vehicleId: "504999d1-4ebd-4884-a966-c16d6c7cc2c0",
    listingStatus: "pending",
    instantBook: false,
    minTripDuration: 1,
    maxTripDuration: 30
  },
  {
    id: "3e66cb90-1d7a-43ff-84db-aeba2482c317",
    ownerId: "cb9a148f-fade-464d-979b-e3839622f957",
    vehicleId: "b11c5568-9fee-497c-be69-248baeff135c",
    listingStatus: "pending",
    instantBook: false,
    minTripDuration: 1,
    maxTripDuration: 30
  }
];
var DEV_VEHICLE_VERIFICATIONS = [
  {
    id: "c0715e81-76af-4857-9a03-a764d33b5b42",
    vehicleId: "b11c5568-9fee-497c-be69-248baeff135c",
    ownerId: "cb9a148f-fade-464d-979b-e3839622f957",
    status: "pending"
  }
];
async function seedIfEmpty() {
  console.log("Checking if database needs seeding...");
  try {
    await db.insert(vehicles).values(DEV_VEHICLES).onConflictDoNothing();
    console.log("Vehicles seeded (skipped existing)");
    await db.insert(users).values(DEV_USERS).onConflictDoNothing();
    console.log("Users seeded (skipped existing)");
    await db.insert(ownerProfiles).values(DEV_OWNER_PROFILES).onConflictDoNothing();
    console.log("Owner profiles seeded (skipped existing)");
    await db.insert(ownerVehicles).values(DEV_OWNER_VEHICLES).onConflictDoNothing();
    console.log("Owner vehicles seeded (skipped existing)");
    await db.insert(vehicleVerifications).values(DEV_VEHICLE_VERIFICATIONS).onConflictDoNothing();
    console.log("Vehicle verifications seeded (skipped existing)");
    console.log("Database seeding check complete");
  } catch (error) {
    console.error("Error during database seeding:", error);
  }
}
async function migrateToDevState() {
  try {
    console.log("Starting full migration from dev state...");
    await db.execute(sql3`TRUNCATE TABLE vehicle_verifications CASCADE`);
    await db.execute(sql3`TRUNCATE TABLE owner_vehicles CASCADE`);
    await db.execute(sql3`TRUNCATE TABLE owner_profiles CASCADE`);
    await db.execute(sql3`TRUNCATE TABLE reviews CASCADE`);
    await db.execute(sql3`TRUNCATE TABLE push_tokens CASCADE`);
    await db.execute(sql3`TRUNCATE TABLE messages CASCADE`);
    await db.execute(sql3`TRUNCATE TABLE conversations CASCADE`);
    await db.execute(sql3`TRUNCATE TABLE availability_slots CASCADE`);
    await db.execute(sql3`TRUNCATE TABLE trips CASCADE`);
    await db.execute(sql3`TRUNCATE TABLE favorites CASCADE`);
    await db.execute(sql3`TRUNCATE TABLE vehicles CASCADE`);
    await db.execute(sql3`TRUNCATE TABLE users CASCADE`);
    console.log("All tables cleared");
    await db.insert(users).values(DEV_USERS);
    console.log(`Inserted ${DEV_USERS.length} users`);
    await db.insert(vehicles).values(DEV_VEHICLES);
    console.log(`Inserted ${DEV_VEHICLES.length} vehicles`);
    await db.insert(ownerProfiles).values(DEV_OWNER_PROFILES);
    console.log(`Inserted ${DEV_OWNER_PROFILES.length} owner profiles`);
    await db.insert(ownerVehicles).values(DEV_OWNER_VEHICLES);
    console.log(`Inserted ${DEV_OWNER_VEHICLES.length} owner vehicles`);
    await db.insert(vehicleVerifications).values(DEV_VEHICLE_VERIFICATIONS);
    console.log(`Inserted ${DEV_VEHICLE_VERIFICATIONS.length} vehicle verifications`);
    console.log("Migration complete!");
    return { success: true, message: "Migration completed successfully. All dev data has been copied to this environment." };
  } catch (error) {
    console.error("Migration error:", error);
    return { success: false, message: `Migration failed: ${error.message}` };
  }
}

// server/paypalClient.ts
var PAYPAL_BASE_URL = process.env.PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set");
  }
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });
  if (!response.ok) {
    throw new Error(`PayPal auth failed: ${response.statusText}`);
  }
  const data = await response.json();
  return data.access_token;
}
async function createPayPalOrder(amountUSD, returnUrl, cancelUrl, metadata) {
  const accessToken = await getAccessToken();
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: "USD", value: amountUSD },
          custom_id: JSON.stringify(metadata)
        }
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        brand_name: "Rush Car Rentals",
        user_action: "PAY_NOW"
      }
    })
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`PayPal create order failed: ${err}`);
  }
  const order = await response.json();
  const approvalLink = order.links.find((l) => l.rel === "approve");
  if (!approvalLink) {
    throw new Error("PayPal approval URL not found in order response");
  }
  return { id: order.id, approvalUrl: approvalLink.href };
}
async function capturePayPalOrder(orderId) {
  const accessToken = await getAccessToken();
  const response = await fetch(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`PayPal capture failed: ${err}`);
  }
  return response.json();
}
function getPayPalClientId() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  if (!clientId) throw new Error("PAYPAL_CLIENT_ID is not set");
  return clientId;
}

// server/email.ts
import * as nodemailer from "nodemailer";
import * as fs from "node:fs";
import * as path from "node:path";
var CONFIG_PATH = path.join(process.cwd(), "platform-config.json");
function getSmtpConfig() {
  try {
    const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    if (cfg.smtpHost && cfg.smtpUser && cfg.smtpPass) return cfg;
  } catch {
  }
  return null;
}
async function send(to, subject, html) {
  const cfg = getSmtpConfig();
  if (!cfg) {
    console.log(`[EMAIL STUB] To: ${to} | Subject: ${subject}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: cfg.smtpHost,
    port: cfg.smtpPort || 587,
    secure: (cfg.smtpPort || 587) === 465,
    auth: { user: cfg.smtpUser, pass: cfg.smtpPass }
  });
  await transporter.sendMail({
    from: cfg.smtpFrom || cfg.smtpUser,
    to,
    subject,
    html
  });
}
function bookingCard(fields) {
  return fields.map((f) => `<tr><td style="padding:6px 12px;color:#94a3b8;font-size:13px;">${f.label}</td><td style="padding:6px 12px;font-size:13px;font-weight:600;">${f.value}</td></tr>`).join("");
}
function fmt(iso) {
  return new Date(iso).toLocaleString(void 0, { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function wrap(title, body) {
  return `<!DOCTYPE html><html><body style="margin:0;background:#07090f;font-family:'Outfit',sans-serif;color:#f8fafc;">
<div style="max-width:540px;margin:32px auto;background:#0d1117;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
<div style="background:linear-gradient(135deg,#22d3ee,#fbbf24);padding:24px;text-align:center;">
<div style="font-size:22px;font-weight:900;color:#07090f;letter-spacing:-0.5px;">Rush</div>
</div>
<div style="padding:28px 32px;">
<h2 style="margin:0 0 16px;font-size:18px;font-weight:800;">${title}</h2>
${body}
</div>
<div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.07);font-size:12px;color:#475569;text-align:center;">
\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Rush Car Sharing \xB7 <a href="https://rush-enterprise.com" style="color:#22d3ee;">rush-enterprise.com</a>
</div>
</div></body></html>`;
}
async function sendBookingConfirmationEmail(to, name, vehicleName, startDate, endDate, totalCost) {
  await send(to, `Booking confirmed \u2014 ${vehicleName}`, wrap(
    "Your booking is confirmed!",
    `<p style="color:#94a3b8;margin:0 0 16px;">Hi ${name}, your reservation has been confirmed.</p>
<table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.03);border-radius:12px;overflow:hidden;margin-bottom:16px;">
${bookingCard([
      { label: "Vehicle", value: vehicleName },
      { label: "Pick-up", value: fmt(startDate) },
      { label: "Return", value: fmt(endDate) },
      { label: "Total", value: `$${totalCost.toFixed(2)}` }
    ])}</table>
<p style="color:#94a3b8;font-size:13px;margin:0;">Questions? Reply to this email or visit your <a href="https://rush-enterprise.com/trips" style="color:#22d3ee;">trips dashboard</a>.</p>`
  ));
}
async function sendNewBookingNotificationToOwner(to, ownerName, vehicleName, renterName, startDate, endDate, totalCost) {
  await send(to, `New booking \u2014 ${vehicleName}`, wrap(
    "You have a new booking!",
    `<p style="color:#94a3b8;margin:0 0 16px;">Hi ${ownerName}, ${renterName} just booked your ${vehicleName}.</p>
<table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.03);border-radius:12px;overflow:hidden;margin-bottom:16px;">
${bookingCard([
      { label: "Renter", value: renterName },
      { label: "Pick-up", value: fmt(startDate) },
      { label: "Return", value: fmt(endDate) },
      { label: "Payout", value: `$${(totalCost * 0.88).toFixed(2)}` }
    ])}</table>
<p style="color:#94a3b8;font-size:13px;">Manage bookings in your <a href="https://rush-enterprise.com/host/dashboard" style="color:#22d3ee;">host dashboard</a>.</p>`
  ));
}
async function sendVehicleVerificationApprovedEmail(to, ownerName, vehicleName) {
  await send(to, `Vehicle approved \u2014 ${vehicleName}`, wrap(
    "Your vehicle is live!",
    `<p style="color:#94a3b8;margin:0 0 16px;">Hi ${ownerName}, <strong style="color:#f8fafc;">${vehicleName}</strong> has been approved and is now live on Rush.</p>
<p style="color:#94a3b8;font-size:13px;">View your listing in your <a href="https://rush-enterprise.com/host/dashboard" style="color:#22d3ee;">host dashboard</a>.</p>`
  ));
}
async function sendVehicleVerificationRejectedEmail(to, ownerName, vehicleName, reason) {
  await send(to, `Vehicle update required \u2014 ${vehicleName}`, wrap(
    "Action required on your listing",
    `<p style="color:#94a3b8;margin:0 0 16px;">Hi ${ownerName}, your vehicle <strong style="color:#f8fafc;">${vehicleName}</strong> requires attention.</p>
${reason ? `<div style="background:rgba(239,68,68,0.1);border-left:3px solid #ef4444;padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:13px;">${reason}</div>` : ""}
<p style="color:#94a3b8;font-size:13px;">Update your listing in your <a href="https://rush-enterprise.com/host/dashboard" style="color:#22d3ee;">host dashboard</a> and resubmit.</p>`
  ));
}
async function sendTripCompletedEmail(to, name, vehicleName, totalCost) {
  await send(to, `Trip complete \u2014 ${vehicleName}`, wrap(
    "Thanks for riding with Rush!",
    `<p style="color:#94a3b8;margin:0 0 16px;">Hi ${name}, your trip in the <strong style="color:#f8fafc;">${vehicleName}</strong> is complete.</p>
<p style="color:#94a3b8;margin:0 0 16px;">Total charged: <strong style="color:#22d3ee;">$${totalCost.toFixed(2)}</strong></p>
<p style="color:#94a3b8;font-size:13px;">Leave a review in your <a href="https://rush-enterprise.com/trips" style="color:#22d3ee;">trips dashboard</a>.</p>`
  ));
}
async function sendPasswordResetEmail(to, name, resetUrl) {
  await send(to, "Reset your Rush password", wrap(
    "Password reset request",
    `<p style="color:#94a3b8;margin:0 0 16px;">Hi ${name}, we received a request to reset your password.</p>
<div style="text-align:center;margin:24px 0;">
<a href="${resetUrl}" style="background:#22d3ee;color:#07090f;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;display:inline-block;">Reset password</a>
</div>
<p style="color:#94a3b8;font-size:12px;text-align:center;">Link expires in 1 hour. If you didn't request this, ignore this email.</p>`
  ));
}
async function sendSupportNotificationEmail(adminEmail, userName, userEmail, message) {
  await send(adminEmail, `Support message from ${userName}`, wrap(
    "New support message",
    `<p style="color:#94a3b8;margin:0 0 16px;">A user has sent a support message.</p>
<table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.03);border-radius:12px;overflow:hidden;margin-bottom:16px;">
${bookingCard([
      { label: "From", value: userName },
      { label: "Email", value: userEmail }
    ])}</table>
<div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:16px;">
  <p style="color:#f8fafc;font-size:14px;margin:0;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
</div>
<p style="color:#94a3b8;font-size:13px;">Reply via the <a href="https://rush-enterprise.com/messages" style="color:#22d3ee;">messages inbox</a> or reply to this email.</p>`
  ));
}

// server/middleware.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET env var not set \u2014 using insecure fallback. Set JWT_SECRET in production.");
}
var SECRET = JWT_SECRET || "insecure-dev-secret-change-me";
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  });
}
function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

// server/routes.ts
import { createRemoteJWKSet, jwtVerify } from "jose";
var APPLE_JWKS = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));
var MIN_PASSWORD_LENGTH = 8;
var MAX_MESSAGE_LENGTH = 2e3;
var ALLOWED_IMAGE_MAGIC = {
  jpg: Buffer.from([255, 216, 255]),
  png: Buffer.from([137, 80, 78, 71]),
  webp: Buffer.from([82, 73, 70, 70]),
  gif: Buffer.from([71, 73, 70, 56])
};
function validateImageMagicBytes(buffer, ext) {
  const magic = ALLOWED_IMAGE_MAGIC[ext];
  if (!magic) return false;
  return buffer.slice(0, magic.length).equals(magic);
}
var APP_BASE_URL = process.env.APP_BASE_URL || process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "https://localhost:5000";
async function registerRoutes(app2) {
  app2.get("/api/vehicles", async (req, res) => {
    try {
      const {
        fuelType,
        transmission,
        minPrice,
        maxPrice,
        type,
        minSeats,
        features,
        lat,
        lng,
        radius
      } = req.query;
      if (fuelType || transmission || minPrice || maxPrice || type || minSeats || features || lat && lng) {
        const filters = {};
        if (fuelType) filters.fuelType = fuelType;
        if (transmission) filters.transmission = transmission;
        if (minPrice) filters.minPrice = parseFloat(minPrice);
        if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
        if (type) filters.type = type;
        if (minSeats) filters.minSeats = parseInt(minSeats);
        if (features) filters.features = features.split(",");
        if (lat && lng) {
          filters.lat = parseFloat(lat);
          filters.lng = parseFloat(lng);
          filters.radius = radius ? parseFloat(radius) : 50;
        }
        const vehicles3 = await storage.getFilteredVehicles(filters);
        return res.json(vehicles3);
      }
      const vehicles2 = await storage.getAvailableVehicles();
      res.json(vehicles2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });
  app2.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicle" });
    }
  });
  app2.get("/api/vehicles/:id/reviews", async (req, res) => {
    try {
      const reviews2 = await storage.getReviewsByVehicle(req.params.id);
      res.json(reviews2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });
  app2.get(
    "/api/vehicles/:id/availability",
    async (req, res) => {
      try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
          return res.status(400).json({ error: "Start and end dates are required" });
        }
        const slots = await storage.getAvailabilitySlots(
          req.params.id,
          new Date(startDate),
          new Date(endDate)
        );
        res.json(slots);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch availability" });
      }
    }
  );
  app2.post(
    "/api/vehicles/:id/availability/check",
    async (req, res) => {
      try {
        const { startDate, endDate } = req.body;
        if (!startDate || !endDate) {
          return res.status(400).json({ error: "Start and end dates are required" });
        }
        const isAvailable = await storage.checkAvailability(
          req.params.id,
          new Date(startDate),
          new Date(endDate)
        );
        res.json({ available: isAvailable });
      } catch (error) {
        res.status(500).json({ error: "Failed to check availability" });
      }
    }
  );
  app2.post("/api/trips/quote", async (req, res) => {
    try {
      const { vehicleId, startDate, endDate, includeInsurance } = req.body;
      if (!vehicleId || !startDate || !endDate) {
        return res.status(400).json({ error: "vehicleId, startDate, and endDate are required" });
      }
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        return res.status(400).json({ error: "Invalid date range" });
      }
      const hours = Math.ceil(
        (end.getTime() - start.getTime()) / (1e3 * 60 * 60)
      );
      const days = Math.max(1, Math.ceil(hours / 24));
      const pricePerDay = parseFloat(vehicle.pricePerHour);
      const baseCost = days * pricePerDay;
      const insuranceCost = includeInsurance ? days * 15 : 0;
      const serviceFee = baseCost * 0.1;
      const totalCost = baseCost + insuranceCost + serviceFee;
      const isAvailable = await storage.checkAvailability(vehicleId, start, end);
      res.json({
        available: isAvailable,
        hours,
        days,
        baseCost: baseCost.toFixed(2),
        insuranceCost: insuranceCost.toFixed(2),
        serviceFee: serviceFee.toFixed(2),
        totalCost: totalCost.toFixed(2),
        pricePerDay: pricePerDay.toFixed(2),
        vehicle: {
          id: vehicle.id,
          name: vehicle.name,
          imageUrl: vehicle.imageUrl
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate quote" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, name, password } = req.body;
      if (!email || !name || !password) {
        return res.status(400).json({ error: "Email, name, and password are required" });
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await storage.createUser({ email, name, password: hashedPassword });
      const { password: _, ...userWithoutPassword } = user;
      const token = signToken({ id: user.id, isAdmin: user.isAdmin ?? false, email: user.email });
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(500).json({ error: "Failed to register user" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        await bcrypt.hash("dummy", 12);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const { password: _, ...userWithoutPassword } = user;
      const token = signToken({ id: user.id, isAdmin: user.isAdmin ?? false, email: user.email });
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(500).json({ error: "Failed to login" });
    }
  });
  app2.post("/api/auth/social", async (req, res) => {
    try {
      const { provider, token, name: clientName } = req.body;
      if (!provider || !token) {
        return res.status(400).json({ error: "Provider and token are required" });
      }
      if (!["apple", "google"].includes(provider)) {
        return res.status(400).json({ error: "Invalid provider" });
      }
      let verifiedEmail = null;
      let verifiedName = clientName || null;
      if (provider === "google") {
        const googleRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (!googleRes.ok) {
          return res.status(401).json({ error: "Invalid Google token" });
        }
        const googleUser = await googleRes.json();
        if (!googleUser.sub || !googleUser.email) {
          return res.status(401).json({ error: "Invalid Google token claims" });
        }
        verifiedEmail = googleUser.email;
        verifiedName = verifiedName || googleUser.name || null;
      } else if (provider === "apple") {
        try {
          const { payload } = await jwtVerify(token, APPLE_JWKS, {
            issuer: "https://appleid.apple.com"
          });
          if (!payload.sub || !payload.email) {
            return res.status(401).json({ error: "Invalid Apple token claims" });
          }
          verifiedEmail = payload.email;
        } catch {
          return res.status(401).json({ error: "Failed to verify Apple token" });
        }
      }
      if (!verifiedEmail) {
        return res.status(400).json({ error: "Could not verify email from provider" });
      }
      let user = await storage.getUserByEmail(verifiedEmail);
      if (!user) {
        const randomPassword = await bcrypt.hash(
          crypto.randomBytes(32).toString("hex"),
          12
        );
        user = await storage.createUser({
          email: verifiedEmail,
          name: verifiedName || verifiedEmail.split("@")[0],
          password: randomPassword
        });
      }
      const { password: _, ...userWithoutPassword } = user;
      const authToken = signToken({ id: user.id, isAdmin: user.isAdmin ?? false, email: user.email });
      res.json({ user: userWithoutPassword, token: authToken });
    } catch (error) {
      res.status(500).json({ error: "Social authentication failed" });
    }
  });
  app2.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current password and new password are required" });
      }
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({ error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await storage.updateUser(userId, { password: hashedPassword });
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to change password" });
    }
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const user = await storage.getUserByEmail(email);
      if (user) {
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
        await storage.createPasswordResetToken(user.id, token, expiresAt);
        const baseUrl = process.env.APP_BASE_URL || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "");
        const resetLink = `${baseUrl}/reset-password?token=${token}`;
        await sendPasswordResetEmail(user.email, user.name, resetLink, token);
      }
      res.json({
        message: "If an account exists with that email, a password reset link has been sent."
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ error: "Token and new password are required" });
      }
      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      }
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await storage.updateUser(resetToken.userId, { password: hashedPassword });
      await storage.markTokenUsed(token);
      res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset password" });
    }
  });
  app2.get("/api/users/:id/trips", requireAuth, async (req, res) => {
    try {
      if (req.user.id !== req.params.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      const trips2 = await storage.getTripsByUser(req.params.id);
      res.json(trips2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  });
  app2.post("/api/trips", requireAuth, async (req, res) => {
    try {
      const rawBody = { ...req.body };
      if (typeof rawBody.startDate === "string") rawBody.startDate = new Date(rawBody.startDate);
      if (typeof rawBody.endDate === "string") rawBody.endDate = new Date(rawBody.endDate);
      const tripData = insertTripSchema.parse(rawBody);
      if (tripData.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      const trip = await storage.createTrip(tripData);
      try {
        const renter = await storage.getUser(trip.userId);
        const vehicle = await storage.getVehicle(trip.vehicleId);
        if (renter && vehicle && renter.email) {
          sendBookingConfirmationEmail(
            renter.email,
            renter.name,
            vehicle.name,
            trip.startDate.toISOString(),
            trip.endDate.toISOString(),
            Number(trip.totalCost)
          ).catch(
            (err) => console.error("Failed to send renter confirmation email:", err)
          );
          const owner = await getVehicleOwnerUser(vehicle.id);
          if (owner && owner.email) {
            sendNewBookingNotificationToOwner(
              owner.email,
              owner.name,
              renter.name,
              vehicle.name,
              trip.startDate.toISOString(),
              trip.endDate.toISOString(),
              Number(trip.totalCost)
            ).catch(
              (err) => console.error("Failed to send owner notification email:", err)
            );
            storage.createNotification({
              userId: owner.id,
              type: "booking_request",
              title: "New booking request",
              body: renter.name + " requested to rent " + vehicle.name + ".",
              link: "/host/bookings"
            }).catch(() => {
            });
          }
        }
      } catch (emailError) {
        console.error("Email notification error (non-blocking):", emailError);
      }
      res.status(201).json(trip);
    } catch (error) {
      res.status(500).json({ error: "Failed to create trip" });
    }
  });
  app2.patch("/api/trips/:id", requireAuth, async (req, res) => {
    try {
      const existingTrip = await storage.getTrip(req.params.id);
      if (!existingTrip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      const isRenter = existingTrip.userId === req.user.id;
      let isHost = false;
      if (!isRenter && !req.user.isAdmin) {
        const owner = await getVehicleOwnerUser(existingTrip.vehicleId);
        isHost = !!owner && owner.id === req.user.id;
      }
      if (!isRenter && !req.user.isAdmin && !isHost) {
        return res.status(403).json({ error: "Access denied" });
      }
      const trip = await storage.updateTrip(req.params.id, req.body);
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      try {
        const tripStatus = req.body.status;
        if (tripStatus === "completed" || tripStatus === "accepted" || tripStatus === "declined" || tripStatus === "cancelled") {
          const renter = await storage.getUser(trip.userId);
          const vehicle = await storage.getVehicle(trip.vehicleId);
          const owner = vehicle ? await getVehicleOwnerUser(vehicle.id) : null;
          const vName = vehicle?.name || "the vehicle";
          if (tripStatus === "completed") {
            storage.createNotification({ userId: trip.userId, type: "trip_completed", title: "Trip completed", body: "Your trip with " + vName + " has ended. Leave a review!", link: "/trips" }).catch(() => {
            });
            if (renter?.email) sendTripCompletedEmail(renter.email, renter.name, vName, owner?.name || "the host").catch(() => {
            });
          } else if (tripStatus === "accepted") {
            storage.createNotification({ userId: trip.userId, type: "booking_accepted", title: "Booking confirmed", body: "Your booking for " + vName + " was accepted.", link: "/trips" }).catch(() => {
            });
          } else if (tripStatus === "declined") {
            storage.createNotification({ userId: trip.userId, type: "booking_declined", title: "Booking declined", body: "Your booking for " + vName + " was declined.", link: "/trips" }).catch(() => {
            });
          } else if (tripStatus === "cancelled" && owner) {
            storage.createNotification({ userId: owner.id, type: "booking_cancelled", title: "Booking cancelled", body: (renter?.name || "A renter") + " cancelled their booking for " + vName + ".", link: "/host/bookings" }).catch(() => {
            });
          }
        }
      } catch (notifErr) {
        console.error("Notification error (non-blocking):", notifErr);
      }
      res.json(trip);
    } catch (error) {
      res.status(500).json({ error: "Failed to update trip" });
    }
  });
  app2.get("/api/trips", requireAuth, async (req, res) => {
    try {
      const trips2 = await storage.getTripsByUser(req.user.id);
      const enriched = await Promise.all(
        trips2.map(async (t) => ({ ...t, vehicle: await storage.getVehicle(t.vehicleId) || null }))
      );
      enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  });
  app2.get("/api/owner/:ownerId/bookings", requireAuth, async (req, res) => {
    try {
      const owned = await storage.getOwnerVehicles(req.params.ownerId);
      const vehicleIds = new Set(owned.map((o) => o.vehicleId));
      const all = await storage.getAllTrips();
      const mine = all.filter((t) => vehicleIds.has(t.vehicleId));
      const enriched = await Promise.all(
        mine.map(async (t) => {
          const renter = await storage.getUser(t.userId);
          return {
            ...t,
            vehicle: await storage.getVehicle(t.vehicleId) || null,
            renterName: renter?.name || "Renter"
          };
        })
      );
      enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });
  app2.patch("/api/users/:id", requireAuth, async (req, res) => {
    try {
      if (req.params.id !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      const updates = {};
      for (const k of ["name", "phone", "avatarIndex", "avatarUrl"]) {
        if (k in req.body) updates[k] = req.body[k];
      }
      const updated = await storage.updateUser(req.params.id, updates);
      if (!updated) return res.status(404).json({ error: "User not found" });
      const { password, ...safe } = updated;
      res.json(safe);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });
  app2.get("/api/users/:id/favorites", requireAuth, async (req, res) => {
    try {
      if (req.user.id !== req.params.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      const favorites2 = await storage.getFavoritesByUser(req.params.id);
      res.json(favorites2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });
  app2.post("/api/favorites", requireAuth, async (req, res) => {
    try {
      const { userId, vehicleId } = req.body;
      if (userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      const favorite = await storage.addFavorite({ userId, vehicleId });
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });
  app2.delete(
    "/api/favorites/:userId/:vehicleId",
    requireAuth,
    async (req, res) => {
      try {
        if (req.params.userId !== req.user.id && !req.user.isAdmin) {
          return res.status(403).json({ error: "Access denied" });
        }
        await storage.removeFavorite(req.params.userId, req.params.vehicleId);
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: "Failed to remove favorite" });
      }
    }
  );
  app2.get("/api/users/:id/reviews", requireAuth, async (req, res) => {
    try {
      if (req.user.id !== req.params.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      const reviews2 = await storage.getReviewsByUser(req.params.id);
      res.json(reviews2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });
  app2.post("/api/reviews", requireAuth, async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      if (reviewData.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ error: "Failed to create review" });
    }
  });
  app2.get(
    "/api/user/:userId/documents",
    requireAuth,
    async (req, res) => {
      try {
        if (req.params.userId !== req.user.id && !req.user.isAdmin) {
          return res.status(403).json({ error: "Access denied" });
        }
        const docs = await storage.getUserDocuments(req.params.userId);
        res.json(docs);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch user documents" });
      }
    }
  );
  app2.post("/api/user/documents", requireAuth, async (req, res) => {
    try {
      const {
        userId,
        documentType,
        documentData,
        fileName,
        mimeType,
        expiryDate
      } = req.body;
      if (!userId || !documentType) {
        return res.status(400).json({ error: "Missing required fields: userId, documentType" });
      }
      if (userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (!["drivers_license", "insurance_card", "proof_of_identity"].includes(documentType)) {
        return res.status(400).json({
          error: "Invalid documentType. Must be: drivers_license, insurance_card, or proof_of_identity"
        });
      }
      let documentUrl = null;
      if (documentData) {
        const buffer = Buffer.from(documentData, "base64");
        const extMap = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
        const ext = extMap[mimeType] || "bin";
        const safeName = `doc_${Date.now()}_${crypto.randomBytes(6).toString("hex")}.${ext}`;
        const docsDir = path2.resolve(process.cwd(), "uploads", "documents");
        fs2.mkdirSync(docsDir, { recursive: true });
        await fs2.promises.writeFile(path2.join(docsDir, safeName), buffer);
        documentUrl = `/uploads/documents/${safeName}`;
      }
      const doc = await storage.createUserDocument({
        userId,
        documentType,
        documentUrl,
        documentData: null,
        fileName: fileName || null,
        mimeType: mimeType || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        verificationStatus: "pending",
        submittedAt: /* @__PURE__ */ new Date()
      });
      res.status(201).json(doc);
    } catch (error) {
      res.status(500).json({ error: "Failed to upload document" });
    }
  });
  app2.delete("/api/user/documents/:id", requireAuth, async (req, res) => {
    try {
      const doc = await storage.getUserDocumentById(req.params.id);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      if (doc.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      await storage.deleteUserDocument(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  });
  app2.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const items = await storage.getNotifications(req.user.id);
      res.json(items);
    } catch {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });
  app2.get("/api/notifications/unread-count", requireAuth, async (req, res) => {
    try {
      const count = await storage.getUnreadNotificationCount(req.user.id);
      res.json({ count });
    } catch {
      res.status(500).json({ error: "Failed to fetch count" });
    }
  });
  app2.patch("/api/notifications/read-all", requireAuth, async (req, res) => {
    try {
      await storage.markAllNotificationsRead(req.user.id);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to mark read" });
    }
  });
  app2.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id, req.user.id);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to mark read" });
    }
  });
  app2.post(
    "/api/notifications/register",
    requireAuth,
    async (req, res) => {
      try {
        const tokenData = insertPushTokenSchema.parse(req.body);
        const token = await storage.registerPushToken(tokenData);
        res.status(201).json(token);
      } catch (error) {
        res.status(500).json({ error: "Failed to register push token" });
      }
    }
  );
  app2.post(
    "/api/notifications/deactivate",
    requireAuth,
    async (req, res) => {
      try {
        const { token } = req.body;
        await storage.deactivatePushToken(token);
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: "Failed to deactivate token" });
      }
    }
  );
  app2.get("/api/owner/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.query.userId || req.user.id;
      if (userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      const profile = await storage.getOwnerProfile(userId);
      res.json(profile || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch owner profile" });
    }
  });
  app2.post("/api/owner/profile", requireAuth, async (req, res) => {
    try {
      const { userId, bio } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      if (userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      const existingProfile = await storage.getOwnerProfile(userId);
      if (existingProfile) {
        return res.status(400).json({ error: "Owner profile already exists" });
      }
      const profile = await storage.createOwnerProfile({ userId, bio });
      res.status(201).json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to create owner profile" });
    }
  });
  app2.patch("/api/owner/profile/:id", requireAuth, async (req, res) => {
    try {
      const profile = await storage.updateOwnerProfile(req.params.id, req.body);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update owner profile" });
    }
  });
  app2.get(
    "/api/owner/:ownerId/vehicles",
    requireAuth,
    async (req, res) => {
      try {
        const ownerVehicles2 = await storage.getOwnerVehicles(req.params.ownerId);
        const enriched = await Promise.all(
          ownerVehicles2.map(async (ov) => {
            const vehicle = await storage.getVehicle(ov.vehicleId);
            const verification = vehicle ? (await storage.getAllVerifications()).find(
              (v) => v.vehicleId === vehicle.id && v.ownerId === ov.ownerId
            ) : null;
            return {
              ...ov,
              vehicle: vehicle || null,
              verificationStatus: verification?.status || null,
              verificationNotes: verification?.reviewNotes || null
            };
          })
        );
        res.json(enriched);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch owner vehicles" });
      }
    }
  );
  app2.post("/api/upload/avatar", requireAuth, async (req, res) => {
    try {
      const { data, mimeType } = req.body;
      if (!data) return res.status(400).json({ error: "No image data provided" });
      const extMap = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
      const ext = extMap[mimeType] || "jpg";
      const buffer = Buffer.from(data, "base64");
      if (buffer.length > 5 * 1024 * 1024) return res.status(400).json({ error: "Image must be under 5 MB" });
      const safeName = `avatar_${req.user.id}_${Date.now()}.${ext}`;
      const avatarsDir = path2.resolve(process.cwd(), "uploads", "avatars");
      fs2.mkdirSync(avatarsDir, { recursive: true });
      await fs2.promises.writeFile(path2.join(avatarsDir, safeName), buffer);
      const avatarUrl = `/uploads/avatars/${safeName}`;
      await storage.updateUser(req.user.id, { avatarUrl });
      res.json({ url: avatarUrl });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload avatar" });
    }
  });
  app2.post("/api/upload/vehicle-image", requireAuth, async (req, res) => {
    try {
      const { filename, data, mimeType } = req.body;
      if (!filename || !data || !mimeType) {
        return res.status(400).json({ error: "filename, data, and mimeType are required" });
      }
      const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedMimeTypes.includes(mimeType)) {
        return res.status(400).json({ error: "Only image files are allowed" });
      }
      const buffer = Buffer.from(data, "base64");
      if (buffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({ error: "File size exceeds 10MB limit" });
      }
      const extMap = { "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp" };
      const ext = extMap[mimeType];
      if (!validateImageMagicBytes(buffer, ext)) {
        return res.status(400).json({ error: "File content does not match declared type" });
      }
      const uploadsDir = path2.resolve(process.cwd(), "uploads", "vehicles");
      fs2.mkdirSync(uploadsDir, { recursive: true });
      const safeName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;
      const filePath = path2.join(uploadsDir, safeName);
      await fs2.promises.writeFile(filePath, buffer);
      res.json({ url: `/uploads/vehicles/${safeName}` });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload image" });
    }
  });
  app2.post("/api/owner/vehicles", requireAuth, async (req, res) => {
    try {
      const { ownerId, vehicleData } = req.body;
      const vehicle = await storage.createVehicle({
        ...vehicleData,
        isAvailable: false
      });
      const ownerVehicle = await storage.createOwnerVehicle({
        ownerId,
        vehicleId: vehicle.id,
        listingStatus: "pending"
      });
      await storage.createVerification({
        vehicleId: vehicle.id,
        ownerId,
        status: "pending"
      });
      res.status(201).json({ vehicle, ownerVehicle });
    } catch (error) {
      res.status(500).json({ error: "Failed to create vehicle listing" });
    }
  });
  app2.patch("/api/owner/vehicles/:id", requireAuth, async (req, res) => {
    try {
      const { vehicleData, ...ownerVehicleUpdates } = req.body;
      const ownerVehicle = await storage.updateOwnerVehicle(
        req.params.id,
        ownerVehicleUpdates
      );
      if (!ownerVehicle) {
        return res.status(404).json({ error: "Owner vehicle not found" });
      }
      if (ownerVehicleUpdates.listingStatus === "active") {
        await storage.updateVehicle(ownerVehicle.vehicleId, { isAvailable: true });
      } else if (ownerVehicleUpdates.listingStatus === "paused" || ownerVehicleUpdates.listingStatus === "pending") {
        await storage.updateVehicle(ownerVehicle.vehicleId, { isAvailable: false });
      }
      if (vehicleData) {
        await storage.updateVehicle(ownerVehicle.vehicleId, vehicleData);
      }
      res.json(ownerVehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to update owner vehicle" });
    }
  });
  app2.delete("/api/owner/vehicles/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteOwnerVehicle(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete owner vehicle" });
    }
  });
  app2.post(
    "/api/owner/vehicles/:vehicleId/availability",
    requireAuth,
    async (req, res) => {
      try {
        const { startTime, endTime, isBlocked } = req.body;
        const slot = await storage.createAvailabilitySlot({
          vehicleId: req.params.vehicleId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          isBlocked: isBlocked || false,
          source: "owner"
        });
        res.status(201).json(slot);
      } catch (error) {
        res.status(500).json({ error: "Failed to create availability slot" });
      }
    }
  );
  app2.delete(
    "/api/owner/availability/:id",
    requireAuth,
    async (req, res) => {
      try {
        await storage.deleteAvailabilitySlot(req.params.id);
        res.status(204).send();
      } catch (error) {
        res.status(500).json({ error: "Failed to delete availability slot" });
      }
    }
  );
  app2.get("/api/paypal/client-id", (_req, res) => {
    try {
      const clientId = getPayPalClientId();
      res.json({ clientId });
    } catch (error) {
      res.status(500).json({ error: "PayPal client ID not configured" });
    }
  });
  app2.post(
    "/api/paypal/create-order",
    requireAuth,
    async (req, res) => {
      try {
        const { tripId } = req.body;
        const userId = req.user.id;
        if (!tripId) {
          return res.status(400).json({ error: "tripId is required" });
        }
        const trip = await storage.getTrip(tripId);
        if (!trip) {
          return res.status(404).json({ error: "Trip not found" });
        }
        if (trip.userId !== userId) {
          return res.status(403).json({ error: "Access denied" });
        }
        const amount = parseFloat(trip.totalCost);
        if (isNaN(amount) || amount <= 0) {
          return res.status(400).json({ error: "Invalid trip amount" });
        }
        const baseUrl = process.env.APP_BASE_URL || "https://rush-enterprise.com";
        const amountStr = amount.toFixed(2);
        const platformFee = (amount * 0.1).toFixed(2);
        const ownerPayout = (amount * 0.9).toFixed(2);
        const { id: orderId, approvalUrl } = await createPayPalOrder(
          amountStr,
          `${baseUrl}/api/paypal/return`,
          `${baseUrl}/api/paypal/cancel`,
          { tripId, userId }
        );
        const payment = await storage.createPayment({
          tripId,
          userId,
          paypalOrderId: orderId,
          amount: amountStr,
          platformFee,
          ownerPayout,
          status: "pending"
        });
        res.json({ orderId, approvalUrl, paymentId: payment.id });
      } catch (error) {
        res.status(500).json({ error: error.message || "Failed to create PayPal order" });
      }
    }
  );
  app2.get("/api/paypal/return", (req, res) => {
    const orderId = req.query.token || "";
    res.redirect(`rush://payment/success?orderId=${encodeURIComponent(orderId)}`);
  });
  app2.get("/api/paypal/cancel", (_req, res) => {
    res.redirect("rush://payment/cancel");
  });
  app2.post(
    "/api/paypal/capture-order",
    requireAuth,
    async (req, res) => {
      try {
        const { orderId, paymentId, tripId } = req.body;
        if (!orderId || !paymentId || !tripId) {
          return res.status(400).json({ error: "Missing orderId, paymentId, or tripId" });
        }
        const payment = await storage.getPayment(paymentId);
        if (!payment) {
          return res.status(404).json({ error: "Payment not found" });
        }
        if (payment.userId !== req.user.id && !req.user.isAdmin) {
          return res.status(403).json({ error: "Access denied" });
        }
        const capture = await capturePayPalOrder(orderId);
        const captureStatus = capture.purchase_units?.[0]?.payments?.captures?.[0]?.status;
        if (capture.status !== "COMPLETED" && captureStatus !== "COMPLETED") {
          return res.status(400).json({ error: `Payment capture status: ${capture.status}` });
        }
        await storage.updatePayment(paymentId, { status: "completed" });
        await storage.updateTrip(tripId, { status: "upcoming" });
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ error: error.message || "Failed to capture payment" });
      }
    }
  );
  app2.get("/api/conversations/:userId", requireAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      if (userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      const convs = await storage.getConversationsByUser(userId);
      const enrichedConvs = await Promise.all(
        convs.map(async (conv) => {
          const participant1 = await storage.getUser(conv.participant1Id);
          const participant2 = await storage.getUser(conv.participant2Id);
          const vehicle = conv.vehicleId ? await storage.getVehicle(conv.vehicleId) : null;
          const otherParticipant = conv.participant1Id === userId ? participant2 : participant1;
          const unreadCount = conv.participant1Id === userId ? conv.participant1Unread : conv.participant2Unread;
          return {
            ...conv,
            participant1Name: participant1?.name || "Unknown",
            participant2Name: participant2?.name || "Unknown",
            otherParticipantName: otherParticipant?.name || "Unknown",
            otherParticipantId: otherParticipant?.id,
            otherParticipantAvatar: otherParticipant?.avatarIndex || 0,
            vehicleName: vehicle?.name || null,
            vehicleImage: vehicle?.imageUrl || null,
            unreadCount: unreadCount || 0
          };
        })
      );
      res.json(enrichedConvs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });
  app2.post("/api/conversations", requireAuth, async (req, res) => {
    try {
      const { participant1Id, participant2Id, vehicleId, tripId } = req.body;
      if (!participant1Id || !participant2Id) {
        return res.status(400).json({ error: "Both participant IDs are required" });
      }
      if (participant1Id === participant2Id) {
        return res.status(400).json({ error: "Cannot create a conversation with yourself" });
      }
      if (participant1Id !== req.user.id && participant2Id !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: "Access denied" });
      }
      const [p1, p2] = await Promise.all([
        storage.getUser(participant1Id),
        storage.getUser(participant2Id)
      ]);
      if (!p1 || !p2) {
        return res.status(400).json({ error: "One or more participants not found" });
      }
      const existingConv = await storage.findExistingConversation(
        participant1Id,
        participant2Id,
        vehicleId
      );
      if (existingConv) {
        return res.json(existingConv);
      }
      const conv = await storage.createConversation({
        participant1Id,
        participant2Id,
        vehicleId: vehicleId || null,
        tripId: tripId || null,
        lastMessageAt: /* @__PURE__ */ new Date()
      });
      res.status(201).json(conv);
    } catch (error) {
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });
  app2.get(
    "/api/conversations/:conversationId/messages",
    requireAuth,
    async (req, res) => {
      try {
        const { conversationId } = req.params;
        const conv = await storage.getConversation(conversationId);
        if (!conv) {
          return res.status(404).json({ error: "Conversation not found" });
        }
        if (conv.participant1Id !== req.user.id && conv.participant2Id !== req.user.id && !req.user.isAdmin) {
          return res.status(403).json({ error: "Access denied" });
        }
        const messages2 = await storage.getMessagesByConversation(conversationId);
        const enrichedMessages = await Promise.all(
          messages2.map(async (msg) => {
            const sender = await storage.getUser(msg.senderId);
            return {
              ...msg,
              senderName: sender?.name || "Unknown",
              senderAvatar: sender?.avatarIndex || 0
            };
          })
        );
        const userId = req.user.id;
        await storage.markMessagesAsRead(conversationId, userId);
        const updates = {};
        if (conv.participant1Id === userId) {
          updates.participant1Unread = 0;
        } else if (conv.participant2Id === userId) {
          updates.participant2Unread = 0;
        }
        await storage.updateConversation(conversationId, updates);
        res.json(enrichedMessages);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch messages" });
      }
    }
  );
  app2.post(
    "/api/conversations/:conversationId/messages",
    requireAuth,
    async (req, res) => {
      try {
        const { conversationId } = req.params;
        const { content, messageType } = req.body;
        const senderId = req.user.id;
        if (!content) {
          return res.status(400).json({ error: "content is required" });
        }
        if (typeof content !== "string" || content.length > MAX_MESSAGE_LENGTH) {
          return res.status(400).json({ error: `Message must be a string under ${MAX_MESSAGE_LENGTH} characters` });
        }
        const conv = await storage.getConversation(conversationId);
        if (!conv) {
          return res.status(404).json({ error: "Conversation not found" });
        }
        if (conv.participant1Id !== senderId && conv.participant2Id !== senderId && !req.user.isAdmin) {
          return res.status(403).json({ error: "Access denied" });
        }
        const msg = await storage.createMessage({
          conversationId,
          senderId,
          content,
          messageType: messageType || "text"
        });
        const preview = content.length > 50 ? content.substring(0, 50) + "..." : content;
        const updates = {
          lastMessageAt: /* @__PURE__ */ new Date(),
          lastMessagePreview: preview
        };
        if (conv.participant1Id === senderId) {
          updates.participant2Unread = (conv.participant2Unread || 0) + 1;
        } else {
          updates.participant1Unread = (conv.participant1Unread || 0) + 1;
        }
        await storage.updateConversation(conversationId, updates);
        try {
          const recipientId = conv.participant1Id === senderId ? conv.participant2Id : conv.participant1Id;
          const senderUser = await storage.getUser(senderId);
          await storage.createNotification({ userId: recipientId, type: "new_message", title: "New message", body: (senderUser ? senderUser.name + ": " : "") + content.slice(0, 80), link: "/messages/" + conversationId });
        } catch {
        }
        const sender = await storage.getUser(senderId);
        res.status(201).json({
          ...msg,
          senderName: sender?.name || "Unknown",
          senderAvatar: sender?.avatarIndex || 0
        });
      } catch (error) {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  );
  app2.get(
    "/api/messages/unread/:userId",
    requireAuth,
    async (req, res) => {
      try {
        const { userId } = req.params;
        if (userId !== req.user.id && !req.user.isAdmin) {
          return res.status(403).json({ error: "Access denied" });
        }
        const count = await storage.getUnreadMessageCount(userId);
        res.json({ unreadCount: count });
      } catch (error) {
        res.status(500).json({ error: "Failed to get unread count" });
      }
    }
  );
  app2.post("/api/insurance", requireAuth, async (req, res) => {
    try {
      const { ownerId, vehicleId, providerType } = req.body;
      if (!ownerId || !vehicleId || !providerType) {
        return res.status(400).json({
          error: "Missing required fields: ownerId, vehicleId, providerType"
        });
      }
      if (!["platform", "owner"].includes(providerType)) {
        return res.status(400).json({ error: "providerType must be 'platform' or 'owner'" });
      }
      const policy = await storage.createInsurancePolicy(req.body);
      res.status(201).json(policy);
    } catch (error) {
      res.status(500).json({ error: "Failed to create insurance policy" });
    }
  });
  app2.post("/api/support/thread", requireAuth, async (req, res) => {
    try {
      const userId = req.user.id;
      const { message } = req.body;
      if (!message?.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }
      const admins = await storage.getAllUsers();
      const supportUser = admins.find((u) => u.isAdmin && u.id !== userId) ?? await storage.getUserByEmail("admin@rush.com");
      if (!supportUser) {
        return res.status(500).json({ error: "Support account not found" });
      }
      if (supportUser.id === userId) {
        return res.status(400).json({ error: "You are the support account" });
      }
      let conv = await storage.findExistingConversation(userId, supportUser.id);
      if (!conv) {
        conv = await storage.createConversation({
          participant1Id: userId,
          participant2Id: supportUser.id,
          vehicleId: null,
          tripId: null,
          lastMessageAt: /* @__PURE__ */ new Date()
        });
      }
      const msg = await storage.createMessage({
        conversationId: conv.id,
        senderId: userId,
        content: message.trim(),
        messageType: "text"
      });
      await storage.updateConversation(conv.id, { lastMessageAt: /* @__PURE__ */ new Date(), lastMessagePreview: message.trim().slice(0, 100) });
      const sender = await storage.getUser(userId);
      try {
        await sendSupportNotificationEmail(
          supportUser.email,
          sender?.name || "Unknown",
          sender?.email || "",
          message.trim()
        );
      } catch {
      }
      res.json({ conversationId: conv.id, messageId: msg.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to send support message" });
    }
  });
  app2.post(
    "/api/admin/migrate-from-dev",
    requireAdmin,
    async (req, res) => {
      try {
        const result = await migrateToDevState();
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: "Migration failed" });
      }
    }
  );
  app2.post("/api/admin/upload-image", requireAdmin, async (req, res) => {
    try {
      const { filename, data, mimeType } = req.body;
      if (!filename || !data || !mimeType) {
        return res.status(400).json({ error: "filename, data, and mimeType are required" });
      }
      const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
      if (!allowedMimeTypes.includes(mimeType)) {
        return res.status(400).json({ error: "Only image files are allowed" });
      }
      const buffer = Buffer.from(data, "base64");
      if (buffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({ error: "File size exceeds 10MB limit" });
      }
      const extMap = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif"
      };
      const ext = extMap[mimeType];
      if (!validateImageMagicBytes(buffer, ext)) {
        return res.status(400).json({ error: "File content does not match declared type" });
      }
      const uploadsDir = path2.resolve(process.cwd(), "uploads", "vehicles");
      fs2.mkdirSync(uploadsDir, { recursive: true });
      const safeName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;
      const filePath = path2.join(uploadsDir, safeName);
      await fs2.promises.writeFile(filePath, buffer);
      res.json({ url: `/uploads/vehicles/${safeName}` });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload image" });
    }
  });
  app2.get("/api/admin/users", requireAdmin, async (_req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const usersWithoutPasswords = users2.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  app2.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const { email, name, password, isAdmin } = req.body;
      if (!email || !name || !password) {
        return res.status(400).json({ error: "Email, name, and password are required" });
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await storage.createUser({
        email,
        name,
        password: hashedPassword,
        isAdmin: isAdmin || false
      });
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });
  app2.patch(
    "/api/admin/users/:id/password",
    requireAdmin,
    async (req, res) => {
      try {
        const userId = req.params.id;
        const { password } = req.body;
        if (!password || password.length < MIN_PASSWORD_LENGTH) {
          return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
        }
        const existingUser = await storage.getUser(userId);
        if (!existingUser) {
          return res.status(404).json({ error: "User not found" });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const updatedUser = await storage.updateUser(userId, { password: hashedPassword });
        if (!updatedUser) {
          return res.status(500).json({ error: "Failed to update user password" });
        }
        const { password: _, ...userWithoutPassword } = updatedUser;
        res.json(userWithoutPassword);
      } catch (error) {
        res.status(500).json({ error: "Failed to update password" });
      }
    }
  );
  app2.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { password, ...safeUpdates } = req.body;
      const user = await storage.updateUser(req.params.id, safeUpdates);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  app2.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      const msg = error?.message || error?.detail || "";
      const isFk = error?.code === "23503" || error?.cause?.code === "23503" || msg.includes("foreign key") || msg.includes("violates");
      if (isFk) {
        return res.status(409).json({ error: "Cannot delete this user \u2014 they have existing trips, bookings, or other records. Remove those first." });
      }
      res.status(500).json({ error: "Failed to delete user" });
    }
  });
  app2.get("/api/admin/vehicles", requireAdmin, async (_req, res) => {
    try {
      const vehicles2 = await storage.getAllVehicles();
      res.json(vehicles2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });
  app2.post("/api/admin/vehicles", requireAdmin, async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to create vehicle" });
    }
  });
  app2.patch("/api/admin/vehicles/:id", requireAdmin, async (req, res) => {
    try {
      const vehicle = await storage.updateVehicle(req.params.id, req.body);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to update vehicle" });
    }
  });
  app2.delete("/api/admin/vehicles/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteVehicle(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });
  app2.get("/api/admin/trips", requireAdmin, async (_req, res) => {
    try {
      const trips2 = await storage.getAllTrips();
      res.json(trips2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  });
  app2.get("/api/admin/calendar", requireAdmin, async (_req, res) => {
    try {
      const [trips2, vehicles2, users2] = await Promise.all([
        storage.getAllTrips(),
        storage.getAllVehicles(),
        storage.getAllUsers()
      ]);
      const vehicleMap = new Map(vehicles2.map((v) => [v.id, v]));
      const userMap = new Map(users2.map((u) => [u.id, u]));
      const calendarData = trips2.map((trip) => {
        const vehicle = vehicleMap.get(trip.vehicleId);
        const user = userMap.get(trip.userId);
        return {
          id: trip.id,
          vehicleId: trip.vehicleId,
          vehicleName: vehicle?.name || "Unknown Vehicle",
          vehicleImage: vehicle?.imageUrl || "",
          userId: trip.userId,
          userName: user?.name || "Unknown User",
          userEmail: user?.email || "",
          startDate: trip.startDate,
          endDate: trip.endDate,
          status: trip.status,
          totalCost: trip.totalCost,
          pickupLocation: trip.pickupLocation
        };
      });
      res.json(calendarData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calendar data" });
    }
  });
  app2.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    try {
      const [users2, vehicles2, trips2] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllVehicles(),
        storage.getAllTrips()
      ]);
      const activeTrips = trips2.filter((t) => t.status === "active").length;
      const upcomingTrips = trips2.filter((t) => t.status === "upcoming").length;
      const completedTrips = trips2.filter((t) => t.status === "completed").length;
      const totalRevenue = trips2.reduce(
        (sum, t) => sum + parseFloat(t.totalCost || "0"),
        0
      );
      res.json({
        totalUsers: users2.length,
        totalVehicles: vehicles2.length,
        availableVehicles: vehicles2.filter((v) => v.isAvailable).length,
        totalTrips: trips2.length,
        activeTrips,
        upcomingTrips,
        completedTrips,
        totalRevenue: totalRevenue.toFixed(2)
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });
  app2.get("/api/admin/verifications", requireAdmin, async (_req, res) => {
    try {
      const verifications = await storage.getAllVerifications();
      const enrichedVerifications = await Promise.all(
        verifications.map(async (v) => {
          const vehicle = await storage.getVehicle(v.vehicleId);
          const ownerProfile = v.ownerId ? await db_getOwnerProfileById(v.ownerId) : null;
          const owner = ownerProfile ? await storage.getUser(ownerProfile.userId) : null;
          return {
            ...v,
            vehicle,
            ownerName: owner?.name || "Unknown",
            ownerEmail: owner?.email || "Unknown"
          };
        })
      );
      res.json(enrichedVerifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch verifications" });
    }
  });
  app2.get(
    "/api/admin/verifications/pending",
    requireAdmin,
    async (_req, res) => {
      try {
        const verifications = await storage.getPendingVerifications();
        const enrichedVerifications = await Promise.all(
          verifications.map(async (v) => {
            const vehicle = await storage.getVehicle(v.vehicleId);
            const ownerProfile = v.ownerId ? await db_getOwnerProfileById(v.ownerId) : null;
            const owner = ownerProfile ? await storage.getUser(ownerProfile.userId) : null;
            return {
              ...v,
              vehicle,
              ownerName: owner?.name || "Unknown",
              ownerEmail: owner?.email || "Unknown"
            };
          })
        );
        res.json(enrichedVerifications);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch pending verifications" });
      }
    }
  );
  app2.patch(
    "/api/admin/verifications/:id/decision",
    requireAdmin,
    async (req, res) => {
      try {
        const { status, reviewerId, reviewNotes, rejectionReason } = req.body;
        if (!["approved", "rejected"].includes(status)) {
          return res.status(400).json({ error: "Invalid status" });
        }
        const verification = await storage.updateVerification(req.params.id, {
          status,
          reviewerId,
          reviewNotes,
          rejectionReason: status === "rejected" ? rejectionReason : null,
          decidedAt: /* @__PURE__ */ new Date()
        });
        if (!verification) {
          return res.status(404).json({ error: "Verification not found" });
        }
        if (status === "approved") {
          await storage.updateVehicle(verification.vehicleId, { isAvailable: true });
          if (verification.ownerId) {
            const ownerVehicles2 = await storage.getOwnerVehicles(verification.ownerId);
            const ownerVehicle = ownerVehicles2.find(
              (ov) => ov.vehicleId === verification.vehicleId
            );
            if (ownerVehicle) {
              await storage.updateOwnerVehicle(ownerVehicle.id, { listingStatus: "active" });
            }
          }
        }
        try {
          const vehicle = await storage.getVehicle(verification.vehicleId);
          if (verification.ownerId && vehicle) {
            const ownerProfile = await db_getOwnerProfileById(verification.ownerId);
            if (ownerProfile) {
              const owner = await storage.getUser(ownerProfile.userId);
              if (owner && owner.email) {
                if (status === "approved") {
                  sendVehicleVerificationApprovedEmail(owner.email, owner.name, vehicle.name).catch(
                    (err) => console.error("Failed to send approval email:", err)
                  );
                } else {
                  sendVehicleVerificationRejectedEmail(owner.email, owner.name, vehicle.name, rejectionReason).catch(
                    (err) => console.error("Failed to send rejection email:", err)
                  );
                }
              }
            }
          }
        } catch (emailError) {
          console.error("Email notification error (non-blocking):", emailError);
        }
        res.json(verification);
      } catch (error) {
        res.status(500).json({ error: "Failed to update verification" });
      }
    }
  );
  app2.get("/api/admin/insurance", requireAdmin, async (_req, res) => {
    try {
      const policies = await storage.getInsurancePolicies();
      res.json(policies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch insurance policies" });
    }
  });
  app2.patch("/api/admin/insurance/:id", requireAdmin, async (req, res) => {
    try {
      const policy = await storage.updateInsurancePolicy(req.params.id, req.body);
      if (!policy) {
        return res.status(404).json({ error: "Policy not found" });
      }
      res.json(policy);
    } catch (error) {
      res.status(500).json({ error: "Failed to update insurance policy" });
    }
  });
  app2.get("/api/admin/analytics", requireAdmin, async (_req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/admin/payments", requireAdmin, async (_req, res) => {
    try {
      const payments2 = await storage.getAllPayments();
      res.json(payments2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });
  app2.post("/api/admin/payments/:id/refund", requireAdmin, async (req, res) => {
    try {
      const payment = await storage.updatePayment(req.params.id, { status: "refunded" });
      if (!payment) return res.status(404).json({ error: "Payment not found" });
      if (payment.tripId) {
        await storage.updateTrip(payment.tripId, { status: "cancelled" });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "Failed to process refund" });
    }
  });
  app2.post("/api/admin/trips/:id/send-confirmation", requireAdmin, async (req, res) => {
    try {
      const trip = await storage.getTrip(req.params.id);
      if (!trip) return res.status(404).json({ error: "Trip not found" });
      const [user, vehicle] = await Promise.all([storage.getUser(trip.userId), storage.getVehicle(trip.vehicleId)]);
      if (user && user.email && vehicle) {
        await sendBookingConfirmationEmail(user.email, user.name, vehicle.name, trip.startDate.toISOString(), trip.endDate.toISOString(), Number(trip.totalCost));
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to send email" });
    }
  });
  app2.get("/api/admin/payouts", requireAdmin, async (_req, res) => {
    try {
      const payouts2 = await storage.getAllPayouts();
      res.json(payouts2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payouts" });
    }
  });
  app2.get("/api/admin/user-documents", requireAdmin, async (req, res) => {
    try {
      const status = req.query.status;
      let docs;
      if (status === "pending") {
        docs = await storage.getPendingUserDocuments();
      } else {
        docs = await storage.getAllUserDocuments();
      }
      const docsWithUsers = await Promise.all(
        docs.map(async (doc) => {
          const user = await storage.getUser(doc.userId);
          return {
            ...doc,
            userName: user?.name || "Unknown User",
            userEmail: user?.email || ""
          };
        })
      );
      res.json(docsWithUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user documents" });
    }
  });
  app2.patch(
    "/api/admin/user-documents/:id",
    requireAdmin,
    async (req, res) => {
      try {
        const { verificationStatus, reviewNotes, reviewerId } = req.body;
        if (!verificationStatus || !["approved", "rejected"].includes(verificationStatus)) {
          return res.status(400).json({
            error: "verificationStatus must be 'approved' or 'rejected'"
          });
        }
        const doc = await storage.updateUserDocument(req.params.id, {
          verificationStatus,
          reviewNotes: reviewNotes || null,
          reviewerId: reviewerId || null,
          reviewedAt: /* @__PURE__ */ new Date()
        });
        if (!doc) {
          return res.status(404).json({ error: "Document not found" });
        }
        try {
          const notifTitle = verificationStatus === "approved" ? "Document approved" : "Document rejected";
          const docLabel = doc.documentType.replace(/_/g, " ");
          const notifBody = verificationStatus === "approved" ? "Your " + docLabel + " was approved." : "Your " + docLabel + " was rejected. Please re-upload a clearer copy.";
          await storage.createNotification({ userId: doc.userId, type: "document_" + verificationStatus, title: notifTitle, body: notifBody, link: "/profile" });
        } catch {
        }
        res.json(doc);
      } catch (error) {
        res.status(500).json({ error: "Failed to update document" });
      }
    }
  );
  const CONFIG_PATH2 = path2.join(process.cwd(), "platform-config.json");
  const AUDIT_PATH = path2.join(process.cwd(), "audit-log.json");
  function readConfig() {
    try {
      return JSON.parse(fs2.readFileSync(CONFIG_PATH2, "utf8"));
    } catch {
      return {};
    }
  }
  function writeConfig(cfg) {
    fs2.writeFileSync(CONFIG_PATH2, JSON.stringify(cfg, null, 2), "utf8");
  }
  function appendAudit(entry) {
    let log2 = [];
    try {
      log2 = JSON.parse(fs2.readFileSync(AUDIT_PATH, "utf8"));
    } catch {
      log2 = [];
    }
    log2.unshift({ ts: (/* @__PURE__ */ new Date()).toISOString(), ...entry });
    if (log2.length > 1e3) log2 = log2.slice(0, 1e3);
    fs2.writeFileSync(AUDIT_PATH, JSON.stringify(log2, null, 2), "utf8");
  }
  const AREAS_KEY = "serviceAreas";
  function readAreas() {
    return readConfig()[AREAS_KEY] || [];
  }
  app2.get("/api/service-areas", async (_req, res) => {
    res.json(readAreas().filter((a) => a.active));
  });
  app2.get("/api/admin/service-areas", requireAdmin, async (_req, res) => {
    res.json(readAreas());
  });
  app2.put("/api/admin/service-areas", requireAdmin, async (req, res) => {
    const { areas } = req.body;
    if (!Array.isArray(areas)) return res.status(400).json({ error: "areas must be an array" });
    const cfg = { ...readConfig(), [AREAS_KEY]: areas };
    writeConfig(cfg);
    appendAudit({ adminId: req.user.id, adminEmail: req.user.email, action: "service_areas_updated", detail: `Updated service areas: ${areas.map((a) => `${a.city}, ${a.stateCode}`).join(", ")}` });
    res.json(areas);
  });
  app2.get("/api/admin/config", requireAdmin, async (_req, res) => {
    res.json({ platformFeePercent: 12, insuranceRatePerDay: 15, minBookingHours: 2, ...readConfig() });
  });
  app2.put("/api/admin/config", requireAdmin, async (req, res) => {
    const cfg = { ...readConfig(), ...req.body };
    writeConfig(cfg);
    appendAudit({ adminId: req.user.id, adminEmail: req.user.email, action: "config_update", detail: `Updated platform config: ${Object.keys(req.body).join(", ")}` });
    res.json(cfg);
  });
  app2.get("/api/admin/audit-log", requireAdmin, async (_req, res) => {
    try {
      res.json(JSON.parse(fs2.readFileSync(AUDIT_PATH, "utf8")));
    } catch {
      res.json([]);
    }
  });
  app2.get("/api/admin/users/:id/documents", requireAdmin, async (req, res) => {
    try {
      const docs = await storage.getUserDocuments(req.params.id);
      const user = await storage.getUser(req.params.id);
      const enriched = docs.map((d) => ({ ...d, userName: user?.name || "Unknown", userEmail: user?.email || "" }));
      res.json(enriched);
    } catch {
      res.status(500).json({ error: "Failed to fetch user documents" });
    }
  });
  app2.post("/api/admin/user-documents", requireAdmin, async (req, res) => {
    try {
      const { userId, documentType, notes } = req.body;
      if (!userId || !documentType) return res.status(400).json({ error: "userId and documentType required" });
      const doc = await storage.createUserDocument({
        userId,
        documentType,
        documentData: null,
        fileName: null,
        mimeType: null,
        expiryDate: null,
        verificationStatus: "pending",
        submittedAt: /* @__PURE__ */ new Date(),
        reviewNotes: notes || null
      });
      appendAudit({ adminId: req.user.id, adminEmail: req.user.email, action: "document_created", detail: `Created ${documentType} record for user ${userId}` });
      res.status(201).json(doc);
    } catch {
      res.status(500).json({ error: "Failed to create document" });
    }
  });
  const MANUAL_PAYMENTS_PATH = path2.join(process.cwd(), "manual-payments.json");
  function readManualPayments() {
    try {
      return JSON.parse(fs2.readFileSync(MANUAL_PAYMENTS_PATH, "utf8"));
    } catch {
      return [];
    }
  }
  app2.post("/api/admin/payments/manual", requireAdmin, async (req, res) => {
    try {
      const { userId, amount, description } = req.body;
      if (!userId || !amount) return res.status(400).json({ error: "userId and amount required" });
      const amountStr = Number(amount).toFixed(2);
      const fee = (Number(amount) * 0.12).toFixed(2);
      const payout = (Number(amount) - Number(fee)).toFixed(2);
      const entry = {
        id: `MANUAL-${Date.now()}`,
        tripId: null,
        userId,
        paypalOrderId: `MANUAL-${Date.now()}`,
        amount: amountStr,
        platformFee: fee,
        ownerPayout: payout,
        status: "completed",
        description,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const ledger = readManualPayments();
      ledger.unshift(entry);
      fs2.writeFileSync(MANUAL_PAYMENTS_PATH, JSON.stringify(ledger, null, 2), "utf8");
      appendAudit({ adminId: req.user.id, adminEmail: req.user.email, action: "manual_charge", detail: `Manual charge $${amountStr} for user ${userId}: ${description}` });
      res.status(201).json(entry);
    } catch {
      res.status(500).json({ error: "Failed to create manual payment" });
    }
  });
  app2.get("/api/admin/payments/manual-ledger", requireAdmin, async (_req, res) => {
    res.json(readManualPayments());
  });
  const httpServer = createServer(app2);
  return httpServer;
}
async function db_getOwnerProfileById(id) {
  const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const { ownerProfiles: ownerProfiles2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { eq: eq2 } = await import("drizzle-orm");
  const [profile] = await db2.select().from(ownerProfiles2).where(eq2(ownerProfiles2.id, id));
  return profile || null;
}
async function getVehicleOwnerUser(vehicleId) {
  const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
  const { ownerVehicles: ownerVehicles2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { eq: eq2 } = await import("drizzle-orm");
  const [ownerVehicle] = await db2.select().from(ownerVehicles2).where(eq2(ownerVehicles2.vehicleId, vehicleId));
  if (!ownerVehicle) return null;
  const ownerProfile = await db_getOwnerProfileById(ownerVehicle.ownerId);
  if (!ownerProfile) return null;
  return storage.getUser(ownerProfile.userId);
}

// server/index.ts
import * as fs3 from "fs";
import * as path3 from "path";
var app = express();
var log = console.log;
function setupSecurity(app2) {
  app2.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", "https:"],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"],
          // Disabled until TLS fronts this server: with it on, browsers
          // upgrade same-origin fetches to https:// and they fail on the
          // plain-HTTP IP with "Failed to fetch".
          upgradeInsecureRequests: null
        }
      },
      crossOriginEmbedderPolicy: false
    })
  );
}
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }
    if (process.env.ALLOWED_ORIGINS) {
      process.env.ALLOWED_ORIGINS.split(",").forEach((d) => {
        origins.add(d.trim());
      });
    }
    const origin = req.header("origin");
    if (origin && origins.size > 0 && origins.has(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    express.json({
      limit: "5mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: false, limit: "5mb" }));
}
function setupRateLimiting(app2) {
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1e3,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many attempts, please try again later." }
  });
  const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1e3,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many password reset requests, please try again later." }
  });
  app2.use("/api/auth/login", authLimiter);
  app2.use("/api/auth/register", authLimiter);
  app2.use("/api/auth/social", authLimiter);
  app2.use("/api/auth/forgot-password", passwordResetLimiter);
  app2.use("/api/auth/reset-password", passwordResetLimiter);
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const reqPath = req.path;
    res.on("finish", () => {
      if (!reqPath.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function serveExpoManifest(platform, res) {
  const manifestPath = path3.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs3.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs3.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveHtmlFile(res, content) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.status(200).send(content);
}
function readTemplate(filename) {
  const filePath = path3.resolve(
    process.cwd(),
    "server",
    "templates",
    filename
  );
  return fs3.readFileSync(filePath, "utf-8");
}
function serveLandingPage({
  res,
  landingPageTemplate
}) {
  serveHtmlFile(res, landingPageTemplate);
}
function serveAdminDashboard(res) {
  serveHtmlFile(res, readTemplate("admin.html"));
}
function serveTermsPage(res) {
  serveHtmlFile(res, readTemplate("terms.html"));
}
function servePrivacyPage(res) {
  serveHtmlFile(res, readTemplate("privacy.html"));
}
function serveForgotPasswordPage(res) {
  serveHtmlFile(res, readTemplate("forgot-password.html"));
}
function serveResetPasswordPage(res) {
  serveHtmlFile(res, readTemplate("reset-password.html"));
}
function configureExpoAndLanding(app2) {
  const templatePath = path3.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs3.readFileSync(templatePath, "utf-8");
  log("Serving static Expo files with dynamic manifest routing");
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path === "/admin") {
      return serveAdminDashboard(res);
    }
    if (req.path === "/terms") {
      return serveTermsPage(res);
    }
    if (req.path === "/privacy") {
      return servePrivacyPage(res);
    }
    if (req.path === "/forgot-password") {
      return serveForgotPasswordPage(res);
    }
    if (req.path === "/reset-password") {
      return serveResetPasswordPage(res);
    }
    if (req.path === "/status") {
      res.setHeader("Content-Type", "text/plain");
      return res.status(200).send("packager-status:running");
    }
    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    if (req.path === "/") {
      return serveLandingPage({
        res,
        landingPageTemplate
      });
    }
    next();
  });
  app2.use("/assets", express.static(path3.resolve(process.cwd(), "assets")));
  app2.use("/uploads", express.static(path3.resolve(process.cwd(), "uploads")));
  app2.use(express.static(path3.resolve(process.cwd(), "static-build")));
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, _next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    console.error("Unhandled error:", err);
    if (status >= 500) {
      return res.status(status).json({ message: "Internal Server Error" });
    }
    const message = error.message || "Request failed";
    res.status(status).json({ message });
  });
}
(async () => {
  app.set("trust proxy", 1);
  setupSecurity(app);
  setupCors(app);
  setupBodyParsing(app);
  setupRateLimiting(app);
  setupRequestLogging(app);
  configureExpoAndLanding(app);
  await seedIfEmpty();
  const server = await registerRoutes(app);
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`express server serving on port ${port}`);
    }
  );
})();
export {
  setupRateLimiting
};
