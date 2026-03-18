import { db } from "./db";
import { vehicles, users, ownerProfiles, ownerVehicles, vehicleVerifications } from "@shared/schema";
import { sql } from "drizzle-orm";
import * as bcrypt from "bcryptjs";

const DEV_VEHICLES = [
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: true,
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
    isAvailable: false,
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
    isAvailable: false,
  },
];

const DEV_USERS = [
  {
    id: "7a5dffab-1f02-4c3d-9311-13671c1ef7a1",
    email: "admin@rush.com",
    name: "Admin User",
    password: "$2b$10$JyzHXCF266eKGg9rXuyvl..jHZNRIGbRbjOYUYDyUmux7Jl/zN/Ae",
    isAdmin: true,
    isOwner: false,
    rating: "5.0",
    tripsCompleted: 0,
    avatarIndex: 0,
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
    avatarIndex: 0,
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
    avatarIndex: 0,
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
    avatarIndex: 0,
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
    avatarIndex: 0,
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
    avatarIndex: 0,
  },
];

const DEV_OWNER_PROFILES = [
  {
    id: "d0335301-4aab-433c-acba-da858ba24754",
    userId: "539ca065-9345-4e4b-929d-73111052fb60",
    verificationStatus: "pending",
    responseRate: "100.00",
    totalEarnings: "0.00",
  },
  {
    id: "244c44e0-e12b-4aea-a538-0a8aca996b2b",
    userId: "055775e6-f39e-43f7-aa05-e9d7ec949752",
    verificationStatus: "pending",
    responseRate: "100.00",
    totalEarnings: "0.00",
  },
  {
    id: "90f90df2-5400-43e4-9f9d-295a68d2d808",
    userId: "6971cbcb-1a17-4fc3-bf20-1a4929ad16c8",
    verificationStatus: "pending",
    responseRate: "100.00",
    totalEarnings: "0.00",
  },
  {
    id: "cb9a148f-fade-464d-979b-e3839622f957",
    userId: "50589ef2-300f-4e36-810e-5e0d36d43bbf",
    verificationStatus: "pending",
    responseRate: "100.00",
    totalEarnings: "0.00",
  },
];

const DEV_OWNER_VEHICLES = [
  {
    id: "60291809-3e1f-47ba-ad7d-9838d68d2890",
    ownerId: "244c44e0-e12b-4aea-a538-0a8aca996b2b",
    vehicleId: "504999d1-4ebd-4884-a966-c16d6c7cc2c0",
    listingStatus: "pending",
    instantBook: false,
    minTripDuration: 1,
    maxTripDuration: 30,
  },
  {
    id: "3e66cb90-1d7a-43ff-84db-aeba2482c317",
    ownerId: "cb9a148f-fade-464d-979b-e3839622f957",
    vehicleId: "b11c5568-9fee-497c-be69-248baeff135c",
    listingStatus: "pending",
    instantBook: false,
    minTripDuration: 1,
    maxTripDuration: 30,
  },
];

const DEV_VEHICLE_VERIFICATIONS = [
  {
    id: "c0715e81-76af-4857-9a03-a764d33b5b42",
    vehicleId: "b11c5568-9fee-497c-be69-248baeff135c",
    ownerId: "cb9a148f-fade-464d-979b-e3839622f957",
    status: "pending" as const,
  },
];

export async function seedIfEmpty(): Promise<void> {
  console.log("Checking if database needs seeding...");

  try {
    await db
      .insert(vehicles)
      .values(DEV_VEHICLES as any)
      .onConflictDoNothing();
    console.log("Vehicles seeded (skipped existing)");

    await db
      .insert(users)
      .values(DEV_USERS as any)
      .onConflictDoNothing();
    console.log("Users seeded (skipped existing)");

    await db
      .insert(ownerProfiles)
      .values(DEV_OWNER_PROFILES as any)
      .onConflictDoNothing();
    console.log("Owner profiles seeded (skipped existing)");

    await db
      .insert(ownerVehicles)
      .values(DEV_OWNER_VEHICLES as any)
      .onConflictDoNothing();
    console.log("Owner vehicles seeded (skipped existing)");

    await db
      .insert(vehicleVerifications)
      .values(DEV_VEHICLE_VERIFICATIONS as any)
      .onConflictDoNothing();
    console.log("Vehicle verifications seeded (skipped existing)");

    console.log("Database seeding check complete");
  } catch (error) {
    console.error("Error during database seeding:", error);
  }
}

export async function migrateToDevState(): Promise<{ success: boolean; message: string }> {
  try {
    console.log("Starting full migration from dev state...");

    await db.execute(sql`TRUNCATE TABLE vehicle_verifications CASCADE`);
    await db.execute(sql`TRUNCATE TABLE owner_vehicles CASCADE`);
    await db.execute(sql`TRUNCATE TABLE owner_profiles CASCADE`);
    await db.execute(sql`TRUNCATE TABLE reviews CASCADE`);
    await db.execute(sql`TRUNCATE TABLE push_tokens CASCADE`);
    await db.execute(sql`TRUNCATE TABLE messages CASCADE`);
    await db.execute(sql`TRUNCATE TABLE conversations CASCADE`);
    await db.execute(sql`TRUNCATE TABLE availability_slots CASCADE`);
    await db.execute(sql`TRUNCATE TABLE trips CASCADE`);
    await db.execute(sql`TRUNCATE TABLE favorites CASCADE`);
    await db.execute(sql`TRUNCATE TABLE vehicles CASCADE`);
    await db.execute(sql`TRUNCATE TABLE users CASCADE`);
    console.log("All tables cleared");

    await db.insert(users).values(DEV_USERS as any);
    console.log(`Inserted ${DEV_USERS.length} users`);

    await db.insert(vehicles).values(DEV_VEHICLES as any);
    console.log(`Inserted ${DEV_VEHICLES.length} vehicles`);

    await db.insert(ownerProfiles).values(DEV_OWNER_PROFILES as any);
    console.log(`Inserted ${DEV_OWNER_PROFILES.length} owner profiles`);

    await db.insert(ownerVehicles).values(DEV_OWNER_VEHICLES as any);
    console.log(`Inserted ${DEV_OWNER_VEHICLES.length} owner vehicles`);

    await db.insert(vehicleVerifications).values(DEV_VEHICLE_VERIFICATIONS as any);
    console.log(`Inserted ${DEV_VEHICLE_VERIFICATIONS.length} vehicle verifications`);

    console.log("Migration complete!");
    return { success: true, message: "Migration completed successfully. All dev data has been copied to this environment." };
  } catch (error: any) {
    console.error("Migration error:", error);
    return { success: false, message: `Migration failed: ${error.message}` };
  }
}
