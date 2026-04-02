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

function normalizeType(type: string): Vehicle["type"] {
  const t = type.toLowerCase();
  const valid = ["sedan", "suv", "electric", "luxury", "compact", "truck", "van", "sports"];
  return (valid.includes(t) ? t : "sedan") as Vehicle["type"];
}

function normalizeFuelType(fuelType: string): Vehicle["fuelType"] {
  const f = fuelType.toLowerCase();
  if (f === "gasoline" || f === "gas") return "gas";
  if (f === "electric") return "electric";
  if (f === "hybrid") return "hybrid";
  return "gas";
}

function normalizeTransmission(transmission: string): Vehicle["transmission"] {
  const t = transmission.toLowerCase();
  return (t === "manual" ? "manual" : "automatic") as Vehicle["transmission"];
}

function transformVehicle(apiVehicle: ApiVehicle): Vehicle {
  return {
    id: apiVehicle.id,
    name: apiVehicle.name,
    type: normalizeType(apiVehicle.type),
    brand: apiVehicle.brand,
    model: apiVehicle.model,
    year: apiVehicle.year,
    pricePerHour: parseFloat(apiVehicle.pricePerHour),
    imageUrl: apiVehicle.imageUrl,
    images: [apiVehicle.imageUrl],
    rating: parseFloat(apiVehicle.rating),
    reviewCount: apiVehicle.reviewCount,
    seats: apiVehicle.seats,
    transmission: normalizeTransmission(apiVehicle.transmission),
    fuelType: normalizeFuelType(apiVehicle.fuelType),
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
