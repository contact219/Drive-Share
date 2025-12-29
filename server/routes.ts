import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { insertUserSchema, insertVehicleSchema, insertTripSchema } from "@shared/schema";
import * as bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.get("/api/vehicles", async (_req: Request, res: Response) => {
    try {
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

  const httpServer = createServer(app);
  return httpServer;
}
