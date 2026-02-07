import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import * as crypto from "node:crypto";
import { storage } from "./storage";
import { insertUserSchema, insertVehicleSchema, insertTripSchema, insertReviewSchema, insertPushTokenSchema } from "@shared/schema";
import * as bcrypt from "bcryptjs";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { 
  sendBookingConfirmationEmail, 
  sendNewBookingNotificationToOwner,
  sendVehicleVerificationApprovedEmail,
  sendVehicleVerificationRejectedEmail,
  sendTripCompletedEmail,
  sendPasswordResetEmail
} from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/vehicles", async (req: Request, res: Response) => {
    try {
      const { fuelType, transmission, minPrice, maxPrice, type, minSeats, features, lat, lng, radius } = req.query;
      
      if (fuelType || transmission || minPrice || maxPrice || type || minSeats || features || (lat && lng)) {
        const filters: any = {};
        if (fuelType) filters.fuelType = fuelType as string;
        if (transmission) filters.transmission = transmission as string;
        if (minPrice) filters.minPrice = parseFloat(minPrice as string);
        if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
        if (type) filters.type = type as string;
        if (minSeats) filters.minSeats = parseInt(minSeats as string);
        if (features) filters.features = (features as string).split(',');
        if (lat && lng) {
          filters.lat = parseFloat(lat as string);
          filters.lng = parseFloat(lng as string);
          filters.radius = radius ? parseFloat(radius as string) : 50;
        }
        
        const vehicles = await storage.getFilteredVehicles(filters);
        return res.json(vehicles);
      }
      
      const vehicles = await storage.getAvailableVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req: Request, res: Response) => {
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

  app.post("/api/auth/register", async (req: Request, res: Response) => {
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
        password: hashedPassword,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
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

  app.get("/api/users/:id/trips", async (req: Request, res: Response) => {
    try {
      const trips = await storage.getTripsByUser(req.params.id);
      res.json(trips);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  });

  app.post("/api/trips", async (req: Request, res: Response) => {
    try {
      const tripData = insertTripSchema.parse(req.body);
      const trip = await storage.createTrip(tripData);
      
      // Send email notifications for the booking
      try {
        const renter = await storage.getUser(trip.userId);
        const vehicle = await storage.getVehicle(trip.vehicleId);
        
        if (renter && vehicle && renter.email) {
          // Send confirmation to renter
          sendBookingConfirmationEmail(
            renter.email,
            renter.name,
            vehicle.name,
            trip.startDate.toISOString(),
            trip.endDate.toISOString(),
            trip.totalCost
          ).catch(err => console.error("Failed to send renter confirmation email:", err));
          
          // Send notification to vehicle owner if they exist
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
              ).catch(err => console.error("Failed to send owner notification email:", err));
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

  app.patch("/api/trips/:id", async (req: Request, res: Response) => {
    try {
      const trip = await storage.updateTrip(req.params.id, req.body);
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      
      // Send email when trip is completed
      if (req.body.status === "completed") {
        try {
          const renter = await storage.getUser(trip.userId);
          const vehicle = await storage.getVehicle(trip.vehicleId);
          
          if (renter && vehicle && renter.email) {
            // Get owner name for the review prompt
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
            ).catch(err => console.error("Failed to send trip completed email:", err));
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

  app.get("/api/users/:id/favorites", async (req: Request, res: Response) => {
    try {
      const favorites = await storage.getFavoritesByUser(req.params.id);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req: Request, res: Response) => {
    try {
      const { userId, vehicleId } = req.body;
      const favorite = await storage.addFavorite({ userId, vehicleId });
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites/:userId/:vehicleId", async (req: Request, res: Response) => {
    try {
      await storage.removeFavorite(req.params.userId, req.params.vehicleId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  app.get("/api/admin/users", async (_req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", async (req: Request, res: Response) => {
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
        isAdmin: isAdmin || false,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.patch("/api/admin/users/:id/password", async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const { password } = req.body;
      
      console.log(`[PASSWORD UPDATE] User ID: ${userId}, Password length: ${password?.length || 0}`);
      
      if (!password || password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      
      // Verify user exists before updating
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

  app.post("/api/auth/change-password", async (req: Request, res: Response) => {
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

  app.get("/api/admin/vehicles", async (_req: Request, res: Response) => {
    try {
      const vehicles = await storage.getAllVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.post("/api/admin/vehicles", async (req: Request, res: Response) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      console.error("Create vehicle error:", error);
      res.status(500).json({ error: "Failed to create vehicle" });
    }
  });

  app.patch("/api/admin/vehicles/:id", async (req: Request, res: Response) => {
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

  app.delete("/api/admin/vehicles/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteVehicle(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  app.get("/api/admin/trips", async (_req: Request, res: Response) => {
    try {
      const trips = await storage.getAllTrips();
      res.json(trips);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  });

  app.get("/api/admin/calendar", async (_req: Request, res: Response) => {
    try {
      const [trips, vehicles, users] = await Promise.all([
        storage.getAllTrips(),
        storage.getAllVehicles(),
        storage.getAllUsers(),
      ]);
      
      const vehicleMap = new Map(vehicles.map(v => [v.id, v]));
      const userMap = new Map(users.map(u => [u.id, u]));
      
      const calendarData = trips.map(trip => {
        const vehicle = vehicleMap.get(trip.vehicleId);
        const user = userMap.get(trip.userId);
        return {
          id: trip.id,
          vehicleId: trip.vehicleId,
          vehicleName: vehicle?.name || 'Unknown Vehicle',
          vehicleImage: vehicle?.imageUrl || '',
          userId: trip.userId,
          userName: user?.name || 'Unknown User',
          userEmail: user?.email || '',
          startDate: trip.startDate,
          endDate: trip.endDate,
          status: trip.status,
          totalCost: trip.totalCost,
          pickupLocation: trip.pickupLocation,
        };
      });
      
      res.json(calendarData);
    } catch (error) {
      console.error("Calendar data error:", error);
      res.status(500).json({ error: "Failed to fetch calendar data" });
    }
  });

  app.patch("/api/admin/users/:id", async (req: Request, res: Response) => {
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

  app.delete("/api/admin/users/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  app.get("/api/admin/stats", async (_req: Request, res: Response) => {
    try {
      const [users, vehicles, trips] = await Promise.all([
        storage.getAllUsers(),
        storage.getAllVehicles(),
        storage.getAllTrips(),
      ]);

      const activeTrips = trips.filter(t => t.status === "active").length;
      const upcomingTrips = trips.filter(t => t.status === "upcoming").length;
      const completedTrips = trips.filter(t => t.status === "completed").length;
      const totalRevenue = trips.reduce((sum, t) => sum + parseFloat(t.totalCost || "0"), 0);

      res.json({
        totalUsers: users.length,
        totalVehicles: vehicles.length,
        availableVehicles: vehicles.filter(v => v.isAvailable).length,
        totalTrips: trips.length,
        activeTrips,
        upcomingTrips,
        completedTrips,
        totalRevenue: totalRevenue.toFixed(2),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Reviews endpoints
  app.get("/api/vehicles/:id/reviews", async (req: Request, res: Response) => {
    try {
      const reviews = await storage.getReviewsByVehicle(req.params.id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req: Request, res: Response) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.get("/api/users/:id/reviews", async (req: Request, res: Response) => {
    try {
      const reviews = await storage.getReviewsByUser(req.params.id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Availability endpoints
  app.get("/api/vehicles/:id/availability", async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start and end dates are required" });
      }
      const slots = await storage.getAvailabilitySlots(
        req.params.id,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(slots);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch availability" });
    }
  });

  app.post("/api/vehicles/:id/availability/check", async (req: Request, res: Response) => {
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

  // Trip cost estimation
  app.post("/api/trips/quote", async (req: Request, res: Response) => {
    try {
      const { vehicleId, startDate, endDate, includeInsurance } = req.body;
      
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
      const days = Math.ceil(hours / 24);
      
      const pricePerHour = parseFloat(vehicle.pricePerHour);
      const baseCost = hours <= 24 ? hours * pricePerHour : days * pricePerHour * 20;
      const insuranceCost = includeInsurance ? days * 15 : 0;
      const serviceFee = baseCost * 0.10;
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
          imageUrl: vehicle.imageUrl,
        },
      });
    } catch (error) {
      console.error("Quote error:", error);
      res.status(500).json({ error: "Failed to generate quote" });
    }
  });

  // Push notification endpoints
  app.post("/api/notifications/register", async (req: Request, res: Response) => {
    try {
      const tokenData = insertPushTokenSchema.parse(req.body);
      const token = await storage.registerPushToken(tokenData);
      res.status(201).json(token);
    } catch (error) {
      console.error("Register token error:", error);
      res.status(500).json({ error: "Failed to register push token" });
    }
  });

  app.post("/api/notifications/deactivate", async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      await storage.deactivatePushToken(token);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to deactivate token" });
    }
  });

  // Owner mode endpoints
  app.get("/api/owner/profile", async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      const profile = await storage.getOwnerProfile(userId as string);
      res.json(profile || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch owner profile" });
    }
  });

  app.post("/api/owner/profile", async (req: Request, res: Response) => {
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

  app.patch("/api/owner/profile/:id", async (req: Request, res: Response) => {
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

  app.get("/api/owner/:ownerId/vehicles", async (req: Request, res: Response) => {
    try {
      const ownerVehicles = await storage.getOwnerVehicles(req.params.ownerId);
      res.json(ownerVehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch owner vehicles" });
    }
  });

  app.post("/api/owner/vehicles", async (req: Request, res: Response) => {
    try {
      const { ownerId, vehicleData } = req.body;
      
      const vehicle = await storage.createVehicle({
        ...vehicleData,
        isAvailable: false,
      });
      
      const ownerVehicle = await storage.createOwnerVehicle({
        ownerId,
        vehicleId: vehicle.id,
        listingStatus: "pending",
      });
      
      res.status(201).json({ vehicle, ownerVehicle });
    } catch (error) {
      console.error("Create owner vehicle error:", error);
      res.status(500).json({ error: "Failed to create vehicle listing" });
    }
  });

  app.patch("/api/owner/vehicles/:id", async (req: Request, res: Response) => {
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

  app.delete("/api/owner/vehicles/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteOwnerVehicle(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete owner vehicle" });
    }
  });

  // Availability slot management for owners
  app.post("/api/owner/vehicles/:vehicleId/availability", async (req: Request, res: Response) => {
    try {
      const { startTime, endTime, isBlocked } = req.body;
      const slot = await storage.createAvailabilitySlot({
        vehicleId: req.params.vehicleId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isBlocked: isBlocked || false,
        source: "owner",
      });
      res.status(201).json(slot);
    } catch (error) {
      res.status(500).json({ error: "Failed to create availability slot" });
    }
  });

  app.delete("/api/owner/availability/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteAvailabilitySlot(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete availability slot" });
    }
  });

  app.get("/api/admin/verifications", async (_req: Request, res: Response) => {
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
          ownerEmail: owner?.email || "Unknown",
        };
      }));
      res.json(enrichedVerifications);
    } catch (error) {
      console.error("Fetch verifications error:", error);
      res.status(500).json({ error: "Failed to fetch verifications" });
    }
  });

  app.get("/api/admin/verifications/pending", async (_req: Request, res: Response) => {
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
          ownerEmail: owner?.email || "Unknown",
        };
      }));
      res.json(enrichedVerifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending verifications" });
    }
  });

  app.patch("/api/admin/verifications/:id/decision", async (req: Request, res: Response) => {
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
        decidedAt: new Date(),
      });

      if (!verification) {
        return res.status(404).json({ error: "Verification not found" });
      }

      if (status === "approved") {
        await storage.updateVehicle(verification.vehicleId, { isAvailable: true });
        if (verification.ownerId) {
          const ownerVehicles = await storage.getOwnerVehicles(verification.ownerId);
          const ownerVehicle = ownerVehicles.find(ov => ov.vehicleId === verification.vehicleId);
          if (ownerVehicle) {
            await storage.updateOwnerVehicle(ownerVehicle.id, { listingStatus: "active" });
          }
        }
      }

      // Send email notification to owner about verification decision
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
                ).catch(err => console.error("Failed to send approval email:", err));
              } else {
                sendVehicleVerificationRejectedEmail(
                  owner.email,
                  owner.name,
                  vehicle.name,
                  rejectionReason
                ).catch(err => console.error("Failed to send rejection email:", err));
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

  app.get("/api/admin/insurance", async (_req: Request, res: Response) => {
    try {
      const policies = await storage.getInsurancePolicies();
      res.json(policies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch insurance policies" });
    }
  });

  app.post("/api/insurance", async (req: Request, res: Response) => {
    try {
      const { ownerId, vehicleId, providerType } = req.body;
      
      if (!ownerId || !vehicleId || !providerType) {
        return res.status(400).json({ error: "Missing required fields: ownerId, vehicleId, providerType" });
      }
      
      if (!['platform', 'owner'].includes(providerType)) {
        return res.status(400).json({ error: "providerType must be 'platform' or 'owner'" });
      }
      
      const policy = await storage.createInsurancePolicy(req.body);
      res.status(201).json(policy);
    } catch (error) {
      console.error("Create insurance error:", error);
      res.status(500).json({ error: "Failed to create insurance policy" });
    }
  });

  app.patch("/api/admin/insurance/:id", async (req: Request, res: Response) => {
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

  app.get("/api/admin/analytics", async (_req: Request, res: Response) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/admin/payments", async (_req: Request, res: Response) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payments" });
    }
  });

  app.get("/api/admin/payouts", async (_req: Request, res: Response) => {
    try {
      const payouts = await storage.getAllPayouts();
      res.json(payouts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payouts" });
    }
  });

  app.get("/api/stripe/publishable-key", async (_req: Request, res: Response) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Stripe key error:", error);
      res.status(500).json({ error: "Failed to get Stripe key" });
    }
  });

  app.post("/api/stripe/create-payment-intent", async (req: Request, res: Response) => {
    try {
      const { tripId, userId, amount } = req.body;
      
      if (!tripId || !userId || typeof amount !== 'number' || amount <= 0) {
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
          metadata: { userId: user.id },
        });
        customerId = customer.id;
        await storage.updateUser(userId, { stripeCustomerId: customerId } as any);
      }

      const amountCents = Math.round(amount * 100);
      const platformFeeCents = Math.round(amountCents * 0.10);
      const ownerPayoutCents = amountCents - platformFeeCents;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: "usd",
        customer: customerId,
        metadata: {
          tripId,
          userId,
        },
      });

      const payment = await storage.createPayment({
        tripId,
        userId,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: customerId,
        amount: (amountCents / 100).toFixed(2),
        platformFee: (platformFeeCents / 100).toFixed(2),
        ownerPayout: (ownerPayoutCents / 100).toFixed(2),
        status: "pending",
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id,
      });
    } catch (error: any) {
      console.error("Payment intent error:", error);
      if (error.type === 'StripeCardError' || error.type === 'StripeInvalidRequestError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  app.post("/api/stripe/confirm-payment", async (req: Request, res: Response) => {
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

  app.get("/api/user/:userId/documents", async (req: Request, res: Response) => {
    try {
      const docs = await storage.getUserDocuments(req.params.userId);
      res.json(docs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user documents" });
    }
  });

  app.post("/api/user/documents", async (req: Request, res: Response) => {
    try {
      const { userId, documentType, documentData, fileName, mimeType, expiryDate } = req.body;
      
      if (!userId || !documentType) {
        return res.status(400).json({ error: "Missing required fields: userId, documentType" });
      }
      
      if (!['drivers_license', 'insurance_card', 'proof_of_identity'].includes(documentType)) {
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
        submittedAt: new Date(),
      });
      
      res.status(201).json(doc);
    } catch (error) {
      console.error("Create user document error:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  app.get("/api/admin/user-documents", async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string;
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
          userEmail: user?.email || "",
        };
      }));
      
      res.json(docsWithUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user documents" });
    }
  });

  app.patch("/api/admin/user-documents/:id", async (req: Request, res: Response) => {
    try {
      const { verificationStatus, reviewNotes, reviewerId } = req.body;
      
      if (!verificationStatus || !['approved', 'rejected'].includes(verificationStatus)) {
        return res.status(400).json({ error: "verificationStatus must be 'approved' or 'rejected'" });
      }
      
      const doc = await storage.updateUserDocument(req.params.id, {
        verificationStatus,
        reviewNotes: reviewNotes || null,
        reviewerId: reviewerId || null,
        reviewedAt: new Date(),
      });
      
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      res.json(doc);
    } catch (error) {
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  app.delete("/api/user/documents/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteUserDocument(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // ==================== MESSAGING ROUTES ====================

  // Get all conversations for a user
  app.get("/api/conversations/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const convs = await storage.getConversationsByUser(userId);
      
      // Enrich with participant info and vehicle info
      const enrichedConvs = await Promise.all(convs.map(async (conv) => {
        const participant1 = await storage.getUser(conv.participant1Id);
        const participant2 = await storage.getUser(conv.participant2Id);
        const vehicle = conv.vehicleId ? await storage.getVehicle(conv.vehicleId) : null;
        
        // Determine the "other" participant from current user's perspective
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
          unreadCount: unreadCount || 0,
        };
      }));
      
      res.json(enrichedConvs);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get or create a conversation
  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { participant1Id, participant2Id, vehicleId, tripId } = req.body;
      
      if (!participant1Id || !participant2Id) {
        return res.status(400).json({ error: "Both participant IDs are required" });
      }
      
      if (participant1Id === participant2Id) {
        return res.status(400).json({ error: "Cannot create a conversation with yourself" });
      }
      
      // Check if conversation already exists
      const existingConv = await storage.findExistingConversation(participant1Id, participant2Id, vehicleId);
      if (existingConv) {
        return res.json(existingConv);
      }
      
      // Create new conversation
      const conv = await storage.createConversation({
        participant1Id,
        participant2Id,
        vehicleId: vehicleId || null,
        tripId: tripId || null,
        lastMessageAt: new Date(),
      });
      
      res.status(201).json(conv);
    } catch (error) {
      console.error("Create conversation error:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:conversationId/messages", async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;
      const { userId } = req.query;
      
      const messages = await storage.getMessagesByConversation(conversationId);
      
      // Enrich with sender info
      const enrichedMessages = await Promise.all(messages.map(async (msg) => {
        const sender = await storage.getUser(msg.senderId);
        return {
          ...msg,
          senderName: sender?.name || "Unknown",
          senderAvatar: sender?.avatarIndex || 0,
        };
      }));
      
      // Mark messages as read if userId provided
      if (userId && typeof userId === 'string') {
        await storage.markMessagesAsRead(conversationId, userId);
        
        // Update unread count in conversation
        const conv = await storage.getConversation(conversationId);
        if (conv) {
          const updates: any = {};
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

  // Send a message
  app.post("/api/conversations/:conversationId/messages", async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;
      const { senderId, content, messageType } = req.body;
      
      if (!senderId || !content) {
        return res.status(400).json({ error: "senderId and content are required" });
      }
      
      // Create the message
      const msg = await storage.createMessage({
        conversationId,
        senderId,
        content,
        messageType: messageType || "text",
      });
      
      // Update conversation with last message info and increment unread count
      const conv = await storage.getConversation(conversationId);
      if (conv) {
        const preview = content.length > 50 ? content.substring(0, 50) + "..." : content;
        const updates: any = {
          lastMessageAt: new Date(),
          lastMessagePreview: preview,
        };
        
        // Increment unread for the other participant
        if (conv.participant1Id === senderId) {
          updates.participant2Unread = (conv.participant2Unread || 0) + 1;
        } else {
          updates.participant1Unread = (conv.participant1Unread || 0) + 1;
        }
        
        await storage.updateConversation(conversationId, updates);
      }
      
      // Get sender info for response
      const sender = await storage.getUser(senderId);
      
      res.status(201).json({
        ...msg,
        senderName: sender?.name || "Unknown",
        senderAvatar: sender?.avatarIndex || 0,
      });
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Get unread message count for a user
  app.get("/api/messages/unread/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const count = await storage.getUnreadMessageCount(userId);
      res.json({ unreadCount: count });
    } catch (error) {
      res.status(500).json({ error: "Failed to get unread count" });
    }
  });

  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      if (user) {
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await storage.createPasswordResetToken(user.id, token, expiresAt);
        const resetLink = `https://${req.get('host')}/reset-password?token=${token}`;
        await sendPasswordResetEmail(user.email, user.name, resetLink, token);
      }
      res.json({ message: "If an account exists with that email, a password reset link has been sent." });
    } catch (error) {
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
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

  const httpServer = createServer(app);
  return httpServer;
}

async function db_getOwnerProfileById(id: string) {
  const { db } = await import("./db");
  const { ownerProfiles } = await import("@shared/schema");
  const { eq } = await import("drizzle-orm");
  const [profile] = await db.select().from(ownerProfiles).where(eq(ownerProfiles.id, id));
  return profile || null;
}
