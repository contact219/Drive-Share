import { Vehicle, Trip, User } from "@/types";

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "v1",
    name: "Tesla Model 3",
    type: "electric",
    brand: "Tesla",
    model: "Model 3",
    year: 2024,
    pricePerHour: 25,
    imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
    images: [
      "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800",
      "https://images.unsplash.com/photo-1617704548623-340376564e68?w=800",
    ],
    rating: 4.9,
    reviewCount: 128,
    seats: 5,
    transmission: "automatic",
    fuelType: "electric",
    features: ["Autopilot", "Apple CarPlay", "Heated Seats", "GPS Navigation", "Bluetooth"],
    distance: 0.5,
    location: {
      address: "123 Main Street, Downtown",
      latitude: 37.7749,
      longitude: -122.4194,
    },
    available: true,
  },
  {
    id: "v2",
    name: "BMW X5",
    type: "suv",
    brand: "BMW",
    model: "X5",
    year: 2023,
    pricePerHour: 35,
    imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
    ],
    rating: 4.7,
    reviewCount: 89,
    seats: 7,
    transmission: "automatic",
    fuelType: "gas",
    features: ["Leather Seats", "Sunroof", "Backup Camera", "GPS Navigation", "Bluetooth", "Android Auto"],
    distance: 1.2,
    location: {
      address: "456 Oak Avenue, Midtown",
      latitude: 37.7849,
      longitude: -122.4094,
    },
    available: true,
  },
  {
    id: "v3",
    name: "Mercedes-Benz C-Class",
    type: "luxury",
    brand: "Mercedes-Benz",
    model: "C-Class",
    year: 2024,
    pricePerHour: 40,
    imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
    ],
    rating: 4.8,
    reviewCount: 156,
    seats: 5,
    transmission: "automatic",
    fuelType: "gas",
    features: ["Leather Seats", "Heated Seats", "Sunroof", "GPS Navigation", "Bluetooth", "Cruise Control"],
    distance: 0.8,
    location: {
      address: "789 Pine Street, Financial District",
      latitude: 37.7949,
      longitude: -122.3994,
    },
    available: true,
  },
  {
    id: "v4",
    name: "Honda Civic",
    type: "sedan",
    brand: "Honda",
    model: "Civic",
    year: 2023,
    pricePerHour: 15,
    imageUrl: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800",
    images: [
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800",
    ],
    rating: 4.5,
    reviewCount: 234,
    seats: 5,
    transmission: "automatic",
    fuelType: "gas",
    features: ["Bluetooth", "Backup Camera", "Apple CarPlay", "Android Auto"],
    distance: 2.1,
    location: {
      address: "321 Elm Street, Soma",
      latitude: 37.7649,
      longitude: -122.4294,
    },
    available: true,
  },
  {
    id: "v5",
    name: "Toyota RAV4 Hybrid",
    type: "suv",
    brand: "Toyota",
    model: "RAV4 Hybrid",
    year: 2024,
    pricePerHour: 28,
    imageUrl: "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800",
    images: [
      "https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800",
    ],
    rating: 4.6,
    reviewCount: 178,
    seats: 5,
    transmission: "automatic",
    fuelType: "hybrid",
    features: ["GPS Navigation", "Bluetooth", "Backup Camera", "Apple CarPlay", "Cruise Control"],
    distance: 1.5,
    location: {
      address: "654 Market Street, Union Square",
      latitude: 37.7849,
      longitude: -122.4094,
    },
    available: true,
  },
  {
    id: "v6",
    name: "Ford F-150",
    type: "truck",
    brand: "Ford",
    model: "F-150",
    year: 2023,
    pricePerHour: 32,
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
    ],
    rating: 4.4,
    reviewCount: 67,
    seats: 5,
    transmission: "automatic",
    fuelType: "gas",
    features: ["Bluetooth", "Backup Camera", "GPS Navigation", "Tow Package"],
    distance: 3.2,
    location: {
      address: "987 Industrial Way, South of Market",
      latitude: 37.7549,
      longitude: -122.4394,
    },
    available: true,
  },
  {
    id: "v7",
    name: "Volkswagen Golf",
    type: "compact",
    brand: "Volkswagen",
    model: "Golf",
    year: 2023,
    pricePerHour: 12,
    imageUrl: "https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?w=800",
    images: [
      "https://images.unsplash.com/photo-1471444928139-48c5bf5173f8?w=800",
    ],
    rating: 4.3,
    reviewCount: 145,
    seats: 5,
    transmission: "manual",
    fuelType: "gas",
    features: ["Bluetooth", "Apple CarPlay", "Android Auto"],
    distance: 0.9,
    location: {
      address: "159 Castro Street, Castro",
      latitude: 37.7609,
      longitude: -122.4350,
    },
    available: true,
  },
  {
    id: "v8",
    name: "Porsche Taycan",
    type: "electric",
    brand: "Porsche",
    model: "Taycan",
    year: 2024,
    pricePerHour: 65,
    imageUrl: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800",
    images: [
      "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800",
    ],
    rating: 5.0,
    reviewCount: 42,
    seats: 4,
    transmission: "automatic",
    fuelType: "electric",
    features: ["Leather Seats", "Heated Seats", "Sunroof", "GPS Navigation", "Bluetooth", "Performance Mode"],
    distance: 1.8,
    location: {
      address: "753 Marina Boulevard, Marina",
      latitude: 37.8049,
      longitude: -122.4394,
    },
    available: true,
  },
];

export const MOCK_USER: User = {
  id: "u1",
  name: "Alex Johnson",
  email: "alex.johnson@email.com",
  avatarIndex: 0,
  rating: 4.8,
  tripsCompleted: 12,
  memberSince: "2024-01-15",
};

export function generateMockTrips(vehicles: Vehicle[]): Trip[] {
  const now = new Date();
  
  return [
    {
      id: "t1",
      vehicleId: "v1",
      vehicle: vehicles.find(v => v.id === "v1") || vehicles[0],
      startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
      status: "upcoming",
      totalCost: 100,
      pickupLocation: "123 Main Street, Downtown",
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "t2",
      vehicleId: "v3",
      vehicle: vehicles.find(v => v.id === "v3") || vehicles[2],
      startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      totalCost: 120,
      pickupLocation: "789 Pine Street, Financial District",
      createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "t3",
      vehicleId: "v4",
      vehicle: vehicles.find(v => v.id === "v4") || vehicles[3],
      startDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      totalCost: 90,
      pickupLocation: "321 Elm Street, Soma",
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export function getVehicleById(id: string): Vehicle | undefined {
  return MOCK_VEHICLES.find((v) => v.id === id);
}

export function filterVehicles(
  vehicles: Vehicle[],
  filters: {
    search?: string;
    types?: string[];
    minPrice?: number;
    maxPrice?: number;
    maxDistance?: number;
    fuelTypes?: string[];
    features?: string[];
  }
): Vehicle[] {
  return vehicles.filter((vehicle) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        vehicle.name.toLowerCase().includes(searchLower) ||
        vehicle.brand.toLowerCase().includes(searchLower) ||
        vehicle.model.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(vehicle.type)) return false;
    }

    if (filters.minPrice !== undefined && vehicle.pricePerHour < filters.minPrice) {
      return false;
    }

    if (filters.maxPrice !== undefined && vehicle.pricePerHour > filters.maxPrice) {
      return false;
    }

    if (filters.maxDistance !== undefined && vehicle.distance > filters.maxDistance) {
      return false;
    }

    if (filters.fuelTypes && filters.fuelTypes.length > 0) {
      if (!filters.fuelTypes.includes(vehicle.fuelType)) return false;
    }

    if (filters.features && filters.features.length > 0) {
      const hasAllFeatures = filters.features.every((f) =>
        vehicle.features.some((vf) => vf.toLowerCase().includes(f.toLowerCase()))
      );
      if (!hasAllFeatures) return false;
    }

    return true;
  });
}
