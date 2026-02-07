export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  brand: string;
  model: string;
  year: number;
  pricePerHour: number;
  imageUrl: string;
  images: string[];
  rating: number;
  reviewCount: number;
  seats: number;
  transmission: "automatic" | "manual";
  fuelType: "gas" | "electric" | "hybrid";
  features: string[];
  distance: number;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  available: boolean;
  ownerId?: string;
}

export type VehicleType = "sedan" | "suv" | "electric" | "luxury" | "compact" | "truck" | "van";

export interface Trip {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  startDate: string;
  endDate: string;
  status: TripStatus;
  totalCost: number;
  pickupLocation: string;
  createdAt: string;
}

export type TripStatus = "upcoming" | "active" | "completed" | "cancelled";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarIndex: number;
  rating: number;
  tripsCompleted: number;
  memberSince: string;
}

export interface FilterOptions {
  vehicleTypes: VehicleType[];
  priceRange: [number, number];
  maxDistance: number;
  features: string[];
  fuelTypes: ("gas" | "electric" | "hybrid")[];
  transmission: ("automatic" | "manual")[];
}

export const VEHICLE_FEATURES = [
  "Bluetooth",
  "GPS Navigation",
  "Baby Seat",
  "Sunroof",
  "Leather Seats",
  "Backup Camera",
  "Apple CarPlay",
  "Android Auto",
  "Heated Seats",
  "Cruise Control",
];

export const VEHICLE_TYPES: { label: string; value: VehicleType }[] = [
  { label: "Sedan", value: "sedan" },
  { label: "SUV", value: "suv" },
  { label: "Electric", value: "electric" },
  { label: "Luxury", value: "luxury" },
  { label: "Compact", value: "compact" },
  { label: "Truck", value: "truck" },
  { label: "Van", value: "van" },
];
