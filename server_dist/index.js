var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
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
var users, usersRelations, vehicles, vehiclesRelations, trips, tripsRelations, favorites, favoritesRelations, reviews, reviewsRelations, pushTokens, pushTokensRelations, availabilitySlots, availabilitySlotsRelations, ownerProfiles, ownerProfilesRelations, ownerVehicles, ownerVehiclesRelations, vehicleVerifications, vehicleVerificationsRelations, insurancePolicies, insurancePoliciesRelations, payments, paymentsRelations, payouts, payoutsRelations, userDocuments, userDocumentsRelations, insertUserSchema, insertVehicleSchema, insertTripSchema, insertFavoriteSchema, insertReviewSchema, insertPushTokenSchema, insertAvailabilitySlotSchema, insertOwnerProfileSchema, insertOwnerVehicleSchema, insertVehicleVerificationSchema, insertInsurancePolicySchema, insertPaymentSchema, insertPayoutSchema, insertUserDocumentSchema, conversations, conversationsRelations, messages, messagesRelations, insertConversationSchema, insertMessageSchema, passwordResetTokens, passwordResetTokensRelations, insertPasswordResetTokenSchema;
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
      rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
      tripsCompleted: integer("trips_completed").default(0),
      isAdmin: boolean("is_admin").default(false),
      isOwner: boolean("is_owner").default(false),
      notificationPrefs: jsonb("notification_prefs").$type().default({ push: true, email: true, sms: false }),
      defaultLocation: jsonb("default_location").$type(),
      stripeCustomerId: text("stripe_customer_id"),
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
      stripePaymentIntentId: text("stripe_payment_intent_id"),
      stripeCustomerId: text("stripe_customer_id"),
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
      stripeTransferId: text("stripe_transfer_id"),
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

// server/routes.ts
import { createServer } from "node:http";
import * as crypto from "node:crypto";

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
    console.log(`[STORAGE] updateUser called with id: ${id}`);
    console.log(`[STORAGE] Updates:`, JSON.stringify(updates, (key, value) => key === "password" ? value?.substring(0, 20) + "..." : value));
    try {
      const result = await db.update(users).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
      console.log(`[STORAGE] Update result count: ${result.length}`);
      if (result.length > 0) {
        console.log(`[STORAGE] Updated user email: ${result[0].email}`);
        console.log(`[STORAGE] Updated password hash: ${result[0].password?.substring(0, 20)}...`);
      } else {
        console.log(`[STORAGE] No user found with id: ${id}`);
      }
      return result[0] || void 0;
    } catch (error) {
      console.error(`[STORAGE] Update error:`, error);
      throw error;
    }
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
};
var storage = new DatabaseStorage();

// server/routes.ts
init_schema();
import * as bcrypt from "bcryptjs";

// server/stripeClient.ts
import Stripe from "stripe";
var connectionSettings;
async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }
  const connectorName = "stripe";
  const isProduction = process.env.REPLIT_DEPLOYMENT === "1";
  const targetEnvironment = isProduction ? "production" : "development";
  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set("include_secrets", "true");
  url.searchParams.set("connector_names", connectorName);
  url.searchParams.set("environment", targetEnvironment);
  const response = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json",
      "X_REPLIT_TOKEN": xReplitToken
    }
  });
  const data = await response.json();
  connectionSettings = data.items?.[0];
  if (!connectionSettings || (!connectionSettings.settings.publishable || !connectionSettings.settings.secret)) {
    throw new Error(`Stripe ${targetEnvironment} connection not found`);
  }
  return {
    publishableKey: connectionSettings.settings.publishable,
    secretKey: connectionSettings.settings.secret
  };
}
async function getUncachableStripeClient() {
  const { secretKey } = await getCredentials();
  return new Stripe(secretKey);
}
async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}

// server/email.ts
import sgMail from "@sendgrid/mail";
var RUSH_CONFIG = {
  appName: "Rush",
  domain: "rush-enterprise.com",
  supportEmail: "support@rush-enterprise.com",
  contactEmail: "contact@rush-enterprise.com"
};
var connectionSettings2;
async function getCredentials2() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }
  connectionSettings2 = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=sendgrid",
    {
      headers: {
        "Accept": "application/json",
        "X_REPLIT_TOKEN": xReplitToken
      }
    }
  ).then((res) => res.json()).then((data) => data.items?.[0]);
  if (!connectionSettings2 || (!connectionSettings2.settings.api_key || !connectionSettings2.settings.from_email)) {
    throw new Error("SendGrid not connected");
  }
  return { apiKey: connectionSettings2.settings.api_key, email: connectionSettings2.settings.from_email };
}
async function getUncachableSendGridClient() {
  const { apiKey, email } = await getCredentials2();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}
async function sendEmail(options) {
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    await client.send({
      to: options.to,
      from: fromEmail,
      subject: options.subject,
      text: options.text,
      html: options.html
    });
    console.log(`Email sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
async function sendBookingConfirmationEmail(renterEmail, renterName, vehicleName, startDate, endDate, totalCost) {
  const subject = `Booking Confirmed - ${vehicleName}`;
  const formattedStart = new Date(startDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  const formattedEnd = new Date(endDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF6B35 0%, #F7B801 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Rush</h1>
        <p style="color: white; margin: 10px 0 0 0;">Your ride is confirmed!</p>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">Hi ${renterName},</h2>
        <p style="color: #666;">Great news! Your booking has been confirmed.</p>
        
        <div style="background: white; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #FF6B35; margin-top: 0;">${vehicleName}</h3>
          <p style="margin: 10px 0;"><strong>Pick-up:</strong> ${formattedStart}</p>
          <p style="margin: 10px 0;"><strong>Return:</strong> ${formattedEnd}</p>
          <p style="margin: 10px 0; font-size: 18px;"><strong>Total:</strong> $${totalCost.toFixed(2)}</p>
        </div>
        
        <p style="color: #666;">Open the Rush app to view your trip details and contact the vehicle owner.</p>
      </div>
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 12px;">${RUSH_CONFIG.appName} Vehicle Rental | ${RUSH_CONFIG.domain}</p>
        <p style="color: #999; margin: 5px 0 0 0; font-size: 11px;">Support: ${RUSH_CONFIG.supportEmail} | Contact: ${RUSH_CONFIG.contactEmail}</p>
      </div>
    </div>
  `;
  const text2 = `Hi ${renterName},

Your booking for ${vehicleName} has been confirmed.

Pick-up: ${formattedStart}
Return: ${formattedEnd}
Total: $${totalCost.toFixed(2)}

Open the Rush app to view your trip details.

Support: ${RUSH_CONFIG.supportEmail}

- ${RUSH_CONFIG.appName} Team`;
  return sendEmail({ to: renterEmail, subject, text: text2, html });
}
async function sendNewBookingNotificationToOwner(ownerEmail, ownerName, renterName, vehicleName, startDate, endDate, totalCost) {
  const subject = `New Booking Request - ${vehicleName}`;
  const formattedStart = new Date(startDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  const formattedEnd = new Date(endDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #004E89 0%, #FF6B35 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Rush</h1>
        <p style="color: white; margin: 10px 0 0 0;">You have a new booking!</p>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">Hi ${ownerName},</h2>
        <p style="color: #666;">${renterName} has booked your vehicle.</p>
        
        <div style="background: white; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #004E89; margin-top: 0;">${vehicleName}</h3>
          <p style="margin: 10px 0;"><strong>Renter:</strong> ${renterName}</p>
          <p style="margin: 10px 0;"><strong>Pick-up:</strong> ${formattedStart}</p>
          <p style="margin: 10px 0;"><strong>Return:</strong> ${formattedEnd}</p>
          <p style="margin: 10px 0; font-size: 18px;"><strong>Your Earnings:</strong> $${(totalCost * 0.9).toFixed(2)}</p>
        </div>
        
        <p style="color: #666;">Open the Rush app to view the booking details and message the renter.</p>
      </div>
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 12px;">${RUSH_CONFIG.appName} Vehicle Rental | ${RUSH_CONFIG.domain}</p>
        <p style="color: #999; margin: 5px 0 0 0; font-size: 11px;">Support: ${RUSH_CONFIG.supportEmail} | Contact: ${RUSH_CONFIG.contactEmail}</p>
      </div>
    </div>
  `;
  const text2 = `Hi ${ownerName},

${renterName} has booked your vehicle ${vehicleName}.

Pick-up: ${formattedStart}
Return: ${formattedEnd}
Your Earnings: $${(totalCost * 0.9).toFixed(2)}

Open the Rush app to view the booking details.

Support: ${RUSH_CONFIG.supportEmail}

- ${RUSH_CONFIG.appName} Team`;
  return sendEmail({ to: ownerEmail, subject, text: text2, html });
}
async function sendVehicleVerificationApprovedEmail(ownerEmail, ownerName, vehicleName) {
  const subject = `Vehicle Approved - ${vehicleName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Rush</h1>
        <p style="color: white; margin: 10px 0 0 0;">Your vehicle is approved!</p>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">Congratulations ${ownerName}!</h2>
        <p style="color: #666;">Your vehicle has been verified and approved.</p>
        
        <div style="background: white; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 10px;">&#10003;</div>
          <h3 style="color: #28a745; margin: 0;">${vehicleName}</h3>
          <p style="color: #666; margin-top: 10px;">Now available for bookings</p>
        </div>
        
        <p style="color: #666;">Your vehicle is now live on Rush and can be booked by renters. Make sure your availability calendar is up to date!</p>
      </div>
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 12px;">${RUSH_CONFIG.appName} Vehicle Rental | ${RUSH_CONFIG.domain}</p>
        <p style="color: #999; margin: 5px 0 0 0; font-size: 11px;">Support: ${RUSH_CONFIG.supportEmail} | Contact: ${RUSH_CONFIG.contactEmail}</p>
      </div>
    </div>
  `;
  const text2 = `Congratulations ${ownerName}!

Your vehicle ${vehicleName} has been verified and approved. It's now live on Rush and available for bookings.

Make sure your availability calendar is up to date!

Support: ${RUSH_CONFIG.supportEmail}

- ${RUSH_CONFIG.appName} Team`;
  return sendEmail({ to: ownerEmail, subject, text: text2, html });
}
async function sendVehicleVerificationRejectedEmail(ownerEmail, ownerName, vehicleName, reason) {
  const subject = `Vehicle Verification Update - ${vehicleName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Rush</h1>
        <p style="color: white; margin: 10px 0 0 0;">Verification Update</p>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">Hi ${ownerName},</h2>
        <p style="color: #666;">We were unable to approve your vehicle at this time.</p>
        
        <div style="background: white; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #dc3545; margin-top: 0;">${vehicleName}</h3>
          ${reason ? `<p style="margin: 10px 0;"><strong>Reason:</strong> ${reason}</p>` : ""}
        </div>
        
        <p style="color: #666;">Please review the feedback and update your vehicle listing. You can resubmit for verification through the Rush app.</p>
        <p style="color: #666;">If you have questions, please contact our support team at ${RUSH_CONFIG.supportEmail}.</p>
      </div>
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 12px;">${RUSH_CONFIG.appName} Vehicle Rental | ${RUSH_CONFIG.domain}</p>
        <p style="color: #999; margin: 5px 0 0 0; font-size: 11px;">Support: ${RUSH_CONFIG.supportEmail} | Contact: ${RUSH_CONFIG.contactEmail}</p>
      </div>
    </div>
  `;
  const text2 = `Hi ${ownerName},

We were unable to approve your vehicle ${vehicleName} at this time.

${reason ? `Reason: ${reason}

` : ""}Please review the feedback and update your vehicle listing. You can resubmit for verification through the Rush app.

Support: ${RUSH_CONFIG.supportEmail}

- ${RUSH_CONFIG.appName} Team`;
  return sendEmail({ to: ownerEmail, subject, text: text2, html });
}
async function sendTripCompletedEmail(renterEmail, renterName, vehicleName, ownerName) {
  const subject = `Trip Completed - Rate Your Experience`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF6B35 0%, #F7B801 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Rush</h1>
        <p style="color: white; margin: 10px 0 0 0;">Thanks for riding with us!</p>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">Hi ${renterName},</h2>
        <p style="color: #666;">Your trip with ${vehicleName} has been completed.</p>
        
        <div style="background: white; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;">
          <h3 style="color: #FF6B35; margin-top: 0;">How was your trip?</h3>
          <p style="color: #666;">Let ${ownerName} know how your experience was by leaving a review in the Rush app.</p>
        </div>
        
        <p style="color: #666;">Your feedback helps other renters make informed decisions and helps vehicle owners improve their service.</p>
      </div>
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 12px;">${RUSH_CONFIG.appName} Vehicle Rental | ${RUSH_CONFIG.domain}</p>
        <p style="color: #999; margin: 5px 0 0 0; font-size: 11px;">Support: ${RUSH_CONFIG.supportEmail} | Contact: ${RUSH_CONFIG.contactEmail}</p>
      </div>
    </div>
  `;
  const text2 = `Hi ${renterName},

Your trip with ${vehicleName} has been completed.

We'd love to hear about your experience! Leave a review in the Rush app to help ${ownerName} and other renters.

Support: ${RUSH_CONFIG.supportEmail}

- ${RUSH_CONFIG.appName} Team`;
  return sendEmail({ to: renterEmail, subject, text: text2, html });
}
async function sendPasswordResetEmail(email, name, resetLink, resetCode) {
  const subject = `Reset Your Password - ${RUSH_CONFIG.appName}`;
  const codeSection = resetCode ? `
        <p style="color: #666; margin-top: 20px;">Or enter this code in the ${RUSH_CONFIG.appName} app:</p>
        <div style="text-align: center; margin: 15px 0;">
          <div style="background: #fff; border: 2px dashed #FF6B35; padding: 16px 24px; border-radius: 8px; display: inline-block;">
            <code style="font-size: 14px; font-weight: 700; color: #333; letter-spacing: 1px; word-break: break-all;">${resetCode}</code>
          </div>
        </div>
  ` : "";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF6B35 0%, #F7B801 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Rush</h1>
        <p style="color: white; margin: 10px 0 0 0;">Password Reset Request</p>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #333; margin-top: 0;">Hi ${name},</h2>
        <p style="color: #666;">We received a request to reset your password. Click the button below to create a new password.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background: #FF6B35; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">Reset Your Password</a>
        </div>
        ${codeSection}
        <p style="color: #666; font-size: 14px;">This code and link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.</p>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">If the button doesn't work, copy and paste this link into your browser:<br>${resetLink}</p>
      </div>
      <div style="background: #333; padding: 20px; text-align: center;">
        <p style="color: #999; margin: 0; font-size: 12px;">${RUSH_CONFIG.appName} Vehicle Rental | ${RUSH_CONFIG.domain}</p>
        <p style="color: #999; margin: 5px 0 0 0; font-size: 11px;">Support: ${RUSH_CONFIG.supportEmail} | Contact: ${RUSH_CONFIG.contactEmail}</p>
      </div>
    </div>
  `;
  const codeText = resetCode ? `

Or enter this code in the app: ${resetCode}` : "";
  const text2 = `Hi ${name},

We received a request to reset your password. Visit the following link to create a new password:

${resetLink}${codeText}

This code and link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.

Support: ${RUSH_CONFIG.supportEmail}

- ${RUSH_CONFIG.appName} Team`;
  return sendEmail({ to: email, subject, text: text2, html });
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/vehicles", async (req, res) => {
    try {
      const { fuelType, transmission, minPrice, maxPrice, type, minSeats, features, lat, lng, radius } = req.query;
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
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, name, password } = req.body;
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        name,
        password: hashedPassword
      });
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to register user" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
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
        const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!googleRes.ok) {
          return res.status(401).json({ error: "Invalid Google token" });
        }
        const googleUser = await googleRes.json();
        verifiedEmail = googleUser.email || null;
        verifiedName = verifiedName || googleUser.name || null;
      } else if (provider === "apple") {
        try {
          const parts = token.split(".");
          if (parts.length !== 3) {
            return res.status(401).json({ error: "Invalid Apple token format" });
          }
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
          if (!payload.email || payload.iss !== "https://appleid.apple.com") {
            return res.status(401).json({ error: "Invalid Apple token" });
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
          __require("crypto").randomBytes(32).toString("hex"),
          10
        );
        user = await storage.createUser({
          email: verifiedEmail,
          name: verifiedName || verifiedEmail.split("@")[0],
          password: randomPassword
        });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Social auth error:", error);
      res.status(500).json({ error: "Social authentication failed" });
    }
  });
  app2.get("/api/users/:id/trips", async (req, res) => {
    try {
      const trips2 = await storage.getTripsByUser(req.params.id);
      res.json(trips2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  });
  app2.post("/api/trips", async (req, res) => {
    try {
      const tripData = insertTripSchema.parse(req.body);
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
            trip.totalCost
          ).catch((err) => console.error("Failed to send renter confirmation email:", err));
          if (vehicle.ownerId) {
            const owner = await storage.getUser(vehicle.ownerId);
            if (owner && owner.email) {
              sendNewBookingNotificationToOwner(
                owner.email,
                owner.name,
                renter.name,
                vehicle.name,
                trip.startDate.toISOString(),
                trip.endDate.toISOString(),
                trip.totalCost
              ).catch((err) => console.error("Failed to send owner notification email:", err));
            }
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
  app2.patch("/api/trips/:id", async (req, res) => {
    try {
      const trip = await storage.updateTrip(req.params.id, req.body);
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      if (req.body.status === "completed") {
        try {
          const renter = await storage.getUser(trip.userId);
          const vehicle = await storage.getVehicle(trip.vehicleId);
          if (renter && vehicle && renter.email) {
            let ownerName = "the host";
            if (vehicle.ownerId) {
              const owner = await storage.getUser(vehicle.ownerId);
              if (owner) {
                ownerName = owner.name;
              }
            }
            sendTripCompletedEmail(
              renter.email,
              renter.name,
              vehicle.name,
              ownerName
            ).catch((err) => console.error("Failed to send trip completed email:", err));
          }
        } catch (emailError) {
          console.error("Email notification error (non-blocking):", emailError);
        }
      }
      res.json(trip);
    } catch (error) {
      res.status(500).json({ error: "Failed to update trip" });
    }
  });
  app2.get("/api/users/:id/favorites", async (req, res) => {
    try {
      const favorites2 = await storage.getFavoritesByUser(req.params.id);
      res.json(favorites2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });
  app2.post("/api/favorites", async (req, res) => {
    try {
      const { userId, vehicleId } = req.body;
      const favorite = await storage.addFavorite({ userId, vehicleId });
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });
  app2.delete("/api/favorites/:userId/:vehicleId", async (req, res) => {
    try {
      await storage.removeFavorite(req.params.userId, req.params.vehicleId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });
  app2.get("/api/admin/users", async (_req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const usersWithoutPasswords = users2.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  app2.post("/api/admin/users", async (req, res) => {
    try {
      const { email, name, password, isAdmin } = req.body;
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
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
  app2.patch("/api/admin/users/:id/password", async (req, res) => {
    try {
      const userId = req.params.id;
      const { password } = req.body;
      console.log(`[PASSWORD UPDATE] User ID: ${userId}, Password length: ${password?.length || 0}`);
      if (!password || password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      const existingUser = await storage.getUser(userId);
      console.log(`[PASSWORD UPDATE] User exists: ${existingUser ? existingUser.email : "NOT FOUND"}`);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(`[PASSWORD UPDATE] Hashed password: ${hashedPassword.substring(0, 20)}...`);
      const updatedUser = await storage.updateUser(userId, { password: hashedPassword });
      console.log(`[PASSWORD UPDATE] Update result: ${updatedUser ? updatedUser.email : "NULL"}`);
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user password" });
      }
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Password update error:", error);
      res.status(500).json({ error: "Failed to update password" });
    }
  });
  app2.post("/api/auth/change-password", async (req, res) => {
    try {
      const { email, currentPassword, newPassword } = req.body;
      if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({ error: "Email, current password, and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(user.id, { password: hashedPassword });
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to change password" });
    }
  });
  app2.get("/api/admin/vehicles", async (_req, res) => {
    try {
      const vehicles2 = await storage.getAllVehicles();
      res.json(vehicles2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });
  app2.post("/api/admin/vehicles", async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      console.error("Create vehicle error:", error);
      res.status(500).json({ error: "Failed to create vehicle" });
    }
  });
  app2.patch("/api/admin/vehicles/:id", async (req, res) => {
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
  app2.delete("/api/admin/vehicles/:id", async (req, res) => {
    try {
      await storage.deleteVehicle(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });
  app2.get("/api/admin/trips", async (_req, res) => {
    try {
      const trips2 = await storage.getAllTrips();
      res.json(trips2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  });
  app2.get("/api/admin/calendar", async (_req, res) => {
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
      console.error("Calendar data error:", error);
      res.status(500).json({ error: "Failed to fetch calendar data" });
    }
  });
  app2.patch("/api/admin/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  app2.delete("/api/admin/users/:id", async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });
  app2.get("/api/admin/stats", async (_req, res) => {
    try {
      const [users2, vehicles2, trips2] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllVehicles(),
        storage.getAllTrips()
      ]);
      const activeTrips = trips2.filter((t) => t.status === "active").length;
      const upcomingTrips = trips2.filter((t) => t.status === "upcoming").length;
      const completedTrips = trips2.filter((t) => t.status === "completed").length;
      const totalRevenue = trips2.reduce((sum, t) => sum + parseFloat(t.totalCost || "0"), 0);
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
  app2.get("/api/vehicles/:id/reviews", async (req, res) => {
    try {
      const reviews2 = await storage.getReviewsByVehicle(req.params.id);
      res.json(reviews2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });
  app2.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });
  app2.get("/api/users/:id/reviews", async (req, res) => {
    try {
      const reviews2 = await storage.getReviewsByUser(req.params.id);
      res.json(reviews2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });
  app2.get("/api/vehicles/:id/availability", async (req, res) => {
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
  });
  app2.post("/api/vehicles/:id/availability/check", async (req, res) => {
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
  });
  app2.post("/api/trips/quote", async (req, res) => {
    try {
      const { vehicleId, startDate, endDate, includeInsurance } = req.body;
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      const hours = Math.ceil((end.getTime() - start.getTime()) / (1e3 * 60 * 60));
      const days = Math.ceil(hours / 24);
      const pricePerHour = parseFloat(vehicle.pricePerHour);
      const baseCost = hours <= 24 ? hours * pricePerHour : days * pricePerHour * 20;
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
        pricePerHour: pricePerHour.toFixed(2),
        vehicle: {
          id: vehicle.id,
          name: vehicle.name,
          imageUrl: vehicle.imageUrl
        }
      });
    } catch (error) {
      console.error("Quote error:", error);
      res.status(500).json({ error: "Failed to generate quote" });
    }
  });
  app2.post("/api/notifications/register", async (req, res) => {
    try {
      const tokenData = insertPushTokenSchema.parse(req.body);
      const token = await storage.registerPushToken(tokenData);
      res.status(201).json(token);
    } catch (error) {
      console.error("Register token error:", error);
      res.status(500).json({ error: "Failed to register push token" });
    }
  });
  app2.post("/api/notifications/deactivate", async (req, res) => {
    try {
      const { token } = req.body;
      await storage.deactivatePushToken(token);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to deactivate token" });
    }
  });
  app2.get("/api/owner/profile", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      const profile = await storage.getOwnerProfile(userId);
      res.json(profile || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch owner profile" });
    }
  });
  app2.post("/api/owner/profile", async (req, res) => {
    try {
      const { userId, bio } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      const existingProfile = await storage.getOwnerProfile(userId);
      if (existingProfile) {
        return res.status(400).json({ error: "Owner profile already exists" });
      }
      const profile = await storage.createOwnerProfile({ userId, bio });
      res.status(201).json(profile);
    } catch (error) {
      console.error("Create owner profile error:", error);
      res.status(500).json({ error: "Failed to create owner profile" });
    }
  });
  app2.patch("/api/owner/profile/:id", async (req, res) => {
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
  app2.get("/api/owner/:ownerId/vehicles", async (req, res) => {
    try {
      const ownerVehicleList = await storage.getOwnerVehicles(req.params.ownerId);
      const enriched = await Promise.all(
        ownerVehicleList.map(async (ov) => {
          const vehicle = await storage.getVehicle(ov.vehicleId);
          const verifications = await storage.getAllVerifications();
          const verification = verifications.find((v) => v.vehicleId === ov.vehicleId);
          return {
            ...ov,
            vehicle: vehicle || null,
            verificationStatus: verification?.status || null,
            verificationNotes: verification?.reviewerNotes || null
          };
        })
      );
      res.json(enriched);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch owner vehicles" });
    }
  });
  app2.post("/api/owner/vehicles", async (req, res) => {
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
      console.error("Create owner vehicle error:", error);
      res.status(500).json({ error: "Failed to create vehicle listing" });
    }
  });
  app2.patch("/api/owner/vehicles/:id", async (req, res) => {
    try {
      const ownerVehicle = await storage.updateOwnerVehicle(req.params.id, req.body);
      if (!ownerVehicle) {
        return res.status(404).json({ error: "Owner vehicle not found" });
      }
      if (req.body.listingStatus === "active") {
        await storage.updateVehicle(ownerVehicle.vehicleId, { isAvailable: true });
      } else if (req.body.listingStatus === "paused" || req.body.listingStatus === "pending") {
        await storage.updateVehicle(ownerVehicle.vehicleId, { isAvailable: false });
      }
      res.json(ownerVehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to update owner vehicle" });
    }
  });
  app2.delete("/api/owner/vehicles/:id", async (req, res) => {
    try {
      await storage.deleteOwnerVehicle(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete owner vehicle" });
    }
  });
  app2.post("/api/owner/vehicles/:vehicleId/availability", async (req, res) => {
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
  });
  app2.delete("/api/owner/availability/:id", async (req, res) => {
    try {
      await storage.deleteAvailabilitySlot(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete availability slot" });
    }
  });
  app2.get("/api/admin/verifications", async (_req, res) => {
    try {
      const verifications = await storage.getAllVerifications();
      const enrichedVerifications = await Promise.all(verifications.map(async (v) => {
        const vehicle = await storage.getVehicle(v.vehicleId);
        const ownerProfile = v.ownerId ? await db_getOwnerProfileById(v.ownerId) : null;
        const owner = ownerProfile ? await storage.getUser(ownerProfile.userId) : null;
        return {
          ...v,
          vehicle,
          ownerName: owner?.name || "Unknown",
          ownerEmail: owner?.email || "Unknown"
        };
      }));
      res.json(enrichedVerifications);
    } catch (error) {
      console.error("Fetch verifications error:", error);
      res.status(500).json({ error: "Failed to fetch verifications" });
    }
  });
  app2.get("/api/admin/verifications/pending", async (_req, res) => {
    try {
      const verifications = await storage.getPendingVerifications();
      const enrichedVerifications = await Promise.all(verifications.map(async (v) => {
        const vehicle = await storage.getVehicle(v.vehicleId);
        const ownerProfile = v.ownerId ? await db_getOwnerProfileById(v.ownerId) : null;
        const owner = ownerProfile ? await storage.getUser(ownerProfile.userId) : null;
        return {
          ...v,
          vehicle,
          ownerName: owner?.name || "Unknown",
          ownerEmail: owner?.email || "Unknown"
        };
      }));
      res.json(enrichedVerifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending verifications" });
    }
  });
  app2.patch("/api/admin/verifications/:id/decision", async (req, res) => {
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
          const ownerVehicle = ownerVehicles2.find((ov) => ov.vehicleId === verification.vehicleId);
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
                sendVehicleVerificationApprovedEmail(
                  owner.email,
                  owner.name,
                  vehicle.name
                ).catch((err) => console.error("Failed to send approval email:", err));
              } else {
                sendVehicleVerificationRejectedEmail(
                  owner.email,
                  owner.name,
                  vehicle.name,
                  rejectionReason
                ).catch((err) => console.error("Failed to send rejection email:", err));
              }
            }
          }
        }
      } catch (emailError) {
        console.error("Email notification error (non-blocking):", emailError);
      }
      res.json(verification);
    } catch (error) {
      console.error("Verification decision error:", error);
      res.status(500).json({ error: "Failed to update verification" });
    }
  });
  app2.get("/api/admin/insurance", async (_req, res) => {
    try {
      const policies = await storage.getInsurancePolicies();
      res.json(policies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch insurance policies" });
    }
  });
  app2.post("/api/insurance", async (req, res) => {
    try {
      const { ownerId, vehicleId, providerType } = req.body;
      if (!ownerId || !vehicleId || !providerType) {
        return res.status(400).json({ error: "Missing required fields: ownerId, vehicleId, providerType" });
      }
      if (!["platform", "owner"].includes(providerType)) {
        return res.status(400).json({ error: "providerType must be 'platform' or 'owner'" });
      }
      const policy = await storage.createInsurancePolicy(req.body);
      res.status(201).json(policy);
    } catch (error) {
      console.error("Create insurance error:", error);
      res.status(500).json({ error: "Failed to create insurance policy" });
    }
  });
  app2.patch("/api/admin/insurance/:id", async (req, res) => {
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
  app2.get("/api/admin/analytics", async (_req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/admin/payments", async (_req, res) => {
    try {
      const payments2 = await storage.getAllPayments();
      res.json(payments2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });
  app2.get("/api/admin/payouts", async (_req, res) => {
    try {
      const payouts2 = await storage.getAllPayouts();
      res.json(payouts2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payouts" });
    }
  });
  app2.get("/api/stripe/publishable-key", async (_req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Stripe key error:", error);
      res.status(500).json({ error: "Failed to get Stripe key" });
    }
  });
  app2.post("/api/stripe/create-payment-intent", async (req, res) => {
    try {
      const { tripId, userId, amount } = req.body;
      if (!tripId || !userId || typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ error: "Invalid payment parameters" });
      }
      const stripe = await getUncachableStripeClient();
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: { userId: user.id }
        });
        customerId = customer.id;
        await storage.updateUser(userId, { stripeCustomerId: customerId });
      }
      const amountCents = Math.round(amount * 100);
      const platformFeeCents = Math.round(amountCents * 0.1);
      const ownerPayoutCents = amountCents - platformFeeCents;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: "usd",
        customer: customerId,
        metadata: {
          tripId,
          userId
        }
      });
      const payment = await storage.createPayment({
        tripId,
        userId,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: customerId,
        amount: (amountCents / 100).toFixed(2),
        platformFee: (platformFeeCents / 100).toFixed(2),
        ownerPayout: (ownerPayoutCents / 100).toFixed(2),
        status: "pending"
      });
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id
      });
    } catch (error) {
      console.error("Payment intent error:", error);
      if (error.type === "StripeCardError" || error.type === "StripeInvalidRequestError") {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });
  app2.post("/api/stripe/confirm-payment", async (req, res) => {
    try {
      const { paymentId, tripId } = req.body;
      if (!paymentId || !tripId) {
        return res.status(400).json({ error: "Missing paymentId or tripId" });
      }
      const payment = await storage.getPayment(paymentId);
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }
      await storage.updatePayment(paymentId, { status: "completed" });
      await storage.updateTrip(tripId, { status: "upcoming" });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to confirm payment" });
    }
  });
  app2.get("/api/user/:userId/documents", async (req, res) => {
    try {
      const docs = await storage.getUserDocuments(req.params.userId);
      res.json(docs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user documents" });
    }
  });
  app2.post("/api/user/documents", async (req, res) => {
    try {
      const { userId, documentType, documentData, fileName, mimeType, expiryDate } = req.body;
      if (!userId || !documentType) {
        return res.status(400).json({ error: "Missing required fields: userId, documentType" });
      }
      if (!["drivers_license", "insurance_card", "proof_of_identity"].includes(documentType)) {
        return res.status(400).json({ error: "Invalid documentType. Must be: drivers_license, insurance_card, or proof_of_identity" });
      }
      const doc = await storage.createUserDocument({
        userId,
        documentType,
        documentData: documentData || null,
        fileName: fileName || null,
        mimeType: mimeType || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        verificationStatus: "pending",
        submittedAt: /* @__PURE__ */ new Date()
      });
      res.status(201).json(doc);
    } catch (error) {
      console.error("Create user document error:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });
  app2.get("/api/admin/user-documents", async (req, res) => {
    try {
      const status = req.query.status;
      let docs;
      if (status === "pending") {
        docs = await storage.getPendingUserDocuments();
      } else {
        docs = await storage.getAllUserDocuments();
      }
      const docsWithUsers = await Promise.all(docs.map(async (doc) => {
        const user = await storage.getUser(doc.userId);
        return {
          ...doc,
          userName: user?.name || "Unknown User",
          userEmail: user?.email || ""
        };
      }));
      res.json(docsWithUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user documents" });
    }
  });
  app2.patch("/api/admin/user-documents/:id", async (req, res) => {
    try {
      const { verificationStatus, reviewNotes, reviewerId } = req.body;
      if (!verificationStatus || !["approved", "rejected"].includes(verificationStatus)) {
        return res.status(400).json({ error: "verificationStatus must be 'approved' or 'rejected'" });
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
      res.json(doc);
    } catch (error) {
      res.status(500).json({ error: "Failed to update document" });
    }
  });
  app2.delete("/api/user/documents/:id", async (req, res) => {
    try {
      await storage.deleteUserDocument(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  });
  app2.get("/api/conversations/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const convs = await storage.getConversationsByUser(userId);
      const enrichedConvs = await Promise.all(convs.map(async (conv) => {
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
      }));
      res.json(enrichedConvs);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });
  app2.post("/api/conversations", async (req, res) => {
    try {
      const { participant1Id, participant2Id, vehicleId, tripId } = req.body;
      if (!participant1Id || !participant2Id) {
        return res.status(400).json({ error: "Both participant IDs are required" });
      }
      if (participant1Id === participant2Id) {
        return res.status(400).json({ error: "Cannot create a conversation with yourself" });
      }
      const existingConv = await storage.findExistingConversation(participant1Id, participant2Id, vehicleId);
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
      console.error("Create conversation error:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });
  app2.get("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { userId } = req.query;
      const messages2 = await storage.getMessagesByConversation(conversationId);
      const enrichedMessages = await Promise.all(messages2.map(async (msg) => {
        const sender = await storage.getUser(msg.senderId);
        return {
          ...msg,
          senderName: sender?.name || "Unknown",
          senderAvatar: sender?.avatarIndex || 0
        };
      }));
      if (userId && typeof userId === "string") {
        await storage.markMessagesAsRead(conversationId, userId);
        const conv = await storage.getConversation(conversationId);
        if (conv) {
          const updates = {};
          if (conv.participant1Id === userId) {
            updates.participant1Unread = 0;
          } else if (conv.participant2Id === userId) {
            updates.participant2Unread = 0;
          }
          await storage.updateConversation(conversationId, updates);
        }
      }
      res.json(enrichedMessages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });
  app2.post("/api/conversations/:conversationId/messages", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { senderId, content, messageType } = req.body;
      if (!senderId || !content) {
        return res.status(400).json({ error: "senderId and content are required" });
      }
      const msg = await storage.createMessage({
        conversationId,
        senderId,
        content,
        messageType: messageType || "text"
      });
      const conv = await storage.getConversation(conversationId);
      if (conv) {
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
      }
      const sender = await storage.getUser(senderId);
      res.status(201).json({
        ...msg,
        senderName: sender?.name || "Unknown",
        senderAvatar: sender?.avatarIndex || 0
      });
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });
  app2.get("/api/messages/unread/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const count = await storage.getUnreadMessageCount(userId);
      res.json({ unreadCount: count });
    } catch (error) {
      res.status(500).json({ error: "Failed to get unread count" });
    }
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      if (user) {
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
        await storage.createPasswordResetToken(user.id, token, expiresAt);
        const resetLink = `https://${req.get("host")}/reset-password?token=${token}`;
        await sendPasswordResetEmail(user.email, user.name, resetLink, token);
      }
      res.json({ message: "If an account exists with that email, a password reset link has been sent." });
    } catch (error) {
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(resetToken.userId, { password: hashedPassword });
      await storage.markTokenUsed(token);
      res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to reset password" });
    }
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

// server/index.ts
import * as fs from "fs";
import * as path from "path";

// server/seedIfEmpty.ts
init_db();
init_schema();
import * as bcrypt2 from "bcryptjs";
var SEED_VEHICLES = [
  {
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
  }
];
async function seedIfEmpty() {
  console.log("Checking if database needs seeding...");
  try {
    const existingVehicles = await db.select().from(vehicles);
    if (existingVehicles.length === 0) {
      console.log("Inserting seed vehicles...");
      await db.insert(vehicles).values(SEED_VEHICLES);
      console.log(`Inserted ${SEED_VEHICLES.length} vehicles`);
    }
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      console.log("Creating admin user...");
      const hashedPassword = await bcrypt2.hash("admin123", 10);
      await db.insert(users).values({
        email: "admin@rush.com",
        name: "Admin User",
        password: hashedPassword,
        isAdmin: true
      });
      console.log("Created admin user: admin@rush.com / admin123");
    }
    console.log("Database seeding check complete");
  } catch (error) {
    console.error("Error during database seeding:", error);
  }
}

// server/index.ts
var app = express();
var log = console.log;
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
    const origin = req.header("origin");
    if (origin && origins.has(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
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
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: false }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path2 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path2.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs.readFileSync(manifestPath, "utf-8");
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
  const filePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    filename
  );
  return fs.readFileSync(filePath, "utf-8");
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
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();
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
  app2.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app2.use(express.static(path.resolve(process.cwd(), "static-build")));
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, _next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
}
(async () => {
  setupCors(app);
  setupBodyParsing(app);
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
