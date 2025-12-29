import { db } from "./db";
import { vehicles, users } from "@shared/schema";
import * as bcrypt from "bcryptjs";

const SEED_VEHICLES = [
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
  },
];

async function seed() {
  console.log("Seeding database...");

  const existingVehicles = await db.select().from(vehicles);
  if (existingVehicles.length > 0) {
    console.log("Vehicles already seeded, skipping...");
  } else {
    console.log("Inserting vehicles...");
    await db.insert(vehicles).values(SEED_VEHICLES);
    console.log(`Inserted ${SEED_VEHICLES.length} vehicles`);
  }

  const existingAdmin = await db.select().from(users).limit(1);
  if (existingAdmin.length === 0) {
    console.log("Creating admin user...");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.insert(users).values({
      email: "admin@rush.com",
      name: "Admin User",
      password: hashedPassword,
      isAdmin: true,
    });
    console.log("Created admin user: admin@rush.com / admin123");
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
