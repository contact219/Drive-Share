import { useQuery } from "@tanstack/react-query";
import { Vehicle } from "@/types";

interface ApiVehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  pricePerHour: string;
  imageUrl: string;
  rating: string;
  reviewCount: number;
  seats: number;
  fuelType: string;
  transmission: string;
  features: string[];
  locationAddress: string;
  locationLat: string;
  locationLng: string;
  isAvailable: boolean;
}

function transformVehicle(apiVehicle: ApiVehicle): Vehicle {
  return {
    id: apiVehicle.id,
    name: apiVehicle.name,
    type: apiVehicle.type as Vehicle["type"],
    brand: apiVehicle.brand,
    model: apiVehicle.model,
    year: apiVehicle.year,
    pricePerHour: parseFloat(apiVehicle.pricePerHour),
    imageUrl: apiVehicle.imageUrl,
    images: [apiVehicle.imageUrl],
    rating: parseFloat(apiVehicle.rating),
    reviewCount: apiVehicle.reviewCount,
    seats: apiVehicle.seats,
    transmission: apiVehicle.transmission as Vehicle["transmission"],
    fuelType: apiVehicle.fuelType as Vehicle["fuelType"],
    features: apiVehicle.features || [],
    distance: Math.random() * 5,
    location: {
      address: apiVehicle.locationAddress,
      latitude: parseFloat(apiVehicle.locationLat),
      longitude: parseFloat(apiVehicle.locationLng),
    },
    available: apiVehicle.isAvailable,
  };
}

export function useVehicles() {
  return useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    select: (data: unknown) => {
      const apiVehicles = data as ApiVehicle[];
      return apiVehicles.map(transformVehicle);
    },
  });
}

export function useVehicle(id: string | undefined) {
  return useQuery<Vehicle>({
    queryKey: ["/api/vehicles", id],
    enabled: !!id,
    select: (data: unknown) => transformVehicle(data as ApiVehicle),
  });
}
