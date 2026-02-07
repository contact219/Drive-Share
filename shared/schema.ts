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
  stripeCustomerId: text("stripe_customer_id"),
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

export const vehicleVerifications = pgTable("vehicle_verifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  ownerId: varchar("owner_id").notNull().references(() => ownerProfiles.id),
  status: text("status").notNull().default("pending"),
  reviewerId: varchar("reviewer_id").references(() => users.id),
  reviewNotes: text("review_notes"),
  submittedDocuments: jsonb("submitted_documents").$type<{ registration?: string; insurance?: string; photos?: string[] }>(),
  submittedAt: timestamp("submitted_at").defaultNow(),
  decidedAt: timestamp("decided_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vehicleVerificationsRelations = relations(vehicleVerifications, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehicleVerifications.vehicleId],
    references: [vehicles.id],
  }),
  owner: one(ownerProfiles, {
    fields: [vehicleVerifications.ownerId],
    references: [ownerProfiles.id],
  }),
  reviewer: one(users, {
    fields: [vehicleVerifications.reviewerId],
    references: [users.id],
  }),
}));

export const insurancePolicies = pgTable("insurance_policies", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insurancePoliciesRelations = relations(insurancePolicies, ({ one }) => ({
  owner: one(ownerProfiles, {
    fields: [insurancePolicies.ownerId],
    references: [ownerProfiles.id],
  }),
  user: one(users, {
    fields: [insurancePolicies.userId],
    references: [users.id],
  }),
}));

export const payments = pgTable("payments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  trip: one(trips, {
    fields: [payments.tripId],
    references: [trips.id],
  }),
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const payouts = pgTable("payouts", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => ownerProfiles.id),
  paymentId: varchar("payment_id").references(() => payments.id),
  stripeTransferId: text("stripe_transfer_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payoutsRelations = relations(payouts, ({ one }) => ({
  owner: one(ownerProfiles, {
    fields: [payouts.ownerId],
    references: [ownerProfiles.id],
  }),
  payment: one(payments, {
    fields: [payouts.paymentId],
    references: [payments.id],
  }),
}));

export const userDocuments = pgTable("user_documents", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userDocumentsRelations = relations(userDocuments, ({ one }) => ({
  user: one(users, {
    fields: [userDocuments.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [userDocuments.reviewerId],
    references: [users.id],
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

export const insertVehicleVerificationSchema = createInsertSchema(vehicleVerifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInsurancePolicySchema = createInsertSchema(insurancePolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPayoutSchema = createInsertSchema(payouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserDocumentSchema = createInsertSchema(userDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Conversations between users (renter <-> owner)
export const conversations = pgTable("conversations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  participant1Id: varchar("participant1_id").notNull().references(() => users.id),
  participant2Id: varchar("participant2_id").notNull().references(() => users.id),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id),
  tripId: varchar("trip_id").references(() => trips.id),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  lastMessagePreview: text("last_message_preview"),
  participant1Unread: integer("participant1_unread").default(0),
  participant2Unread: integer("participant2_unread").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  participant1: one(users, {
    fields: [conversations.participant1Id],
    references: [users.id],
    relationName: "participant1",
  }),
  participant2: one(users, {
    fields: [conversations.participant2Id],
    references: [users.id],
    relationName: "participant2",
  }),
  vehicle: one(vehicles, {
    fields: [conversations.vehicleId],
    references: [vehicles.id],
  }),
  trip: one(trips, {
    fields: [conversations.tripId],
    references: [trips.id],
  }),
  messages: many(messages),
}));

// Individual messages within a conversation
export const messages = pgTable("messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  messageType: text("message_type").default("text"), // text, image, system
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
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
export type InsertVehicleVerification = z.infer<typeof insertVehicleVerificationSchema>;
export type VehicleVerification = typeof vehicleVerifications.$inferSelect;
export type InsertInsurancePolicy = z.infer<typeof insertInsurancePolicySchema>;
export type InsurancePolicy = typeof insurancePolicies.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayout = z.infer<typeof insertPayoutSchema>;
export type Payout = typeof payouts.$inferSelect;
export type InsertUserDocument = z.infer<typeof insertUserDocumentSchema>;
export type UserDocument = typeof userDocuments.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
