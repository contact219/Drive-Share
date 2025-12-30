import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getApiUrl } from "@/lib/query-client";

export interface Review {
  id: string;
  userId: string;
  vehicleId: string;
  tripId?: string;
  rating: number;
  title?: string;
  comment?: string;
  ownerResponse?: string;
  helpfulCount: number;
  createdAt: string;
  userName?: string;
  userAvatar?: number;
}

export function useVehicleReviews(vehicleId: string) {
  return useQuery<Review[]>({
    queryKey: ["/api/vehicles", vehicleId, "reviews"],
    enabled: !!vehicleId,
  });
}

export function useUserReviews(userId: string) {
  return useQuery<Review[]>({
    queryKey: ["/api/users", userId, "reviews"],
    enabled: !!userId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      userId: string;
      vehicleId: string;
      tripId?: string;
      rating: number;
      title?: string;
      comment?: string;
    }) => {
      return apiRequest("POST", "/api/reviews", data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles", variables.vehicleId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles", variables.vehicleId] });
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });
    },
  });
}
