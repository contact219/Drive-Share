import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getApiUrl } from "@/lib/query-client";

export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  vehicleId?: string;
  tripId?: string;
  lastMessageAt: string;
  lastMessagePreview?: string;
  participant1Unread: number;
  participant2Unread: number;
  createdAt: string;
  participant1Name?: string;
  participant2Name?: string;
  otherParticipantName?: string;
  otherParticipantId?: string;
  otherParticipantAvatar?: number;
  vehicleName?: string;
  vehicleImage?: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  senderName?: string;
  senderAvatar?: number;
}

export function useConversations(userId: string | null) {
  return useQuery<Conversation[]>({
    queryKey: ["/api/conversations", userId],
    enabled: !!userId,
  });
}

export function useMessages(conversationId: string | null, userId?: string | null) {
  const url = userId 
    ? `/api/conversations/${conversationId}/messages?userId=${userId}`
    : `/api/conversations/${conversationId}/messages`;
  
  return useQuery<Message[]>({
    queryKey: ["/api/conversations", conversationId, "messages"],
    enabled: !!conversationId,
  });
}

export function useUnreadCount(userId: string | null) {
  return useQuery<{ unreadCount: number }>({
    queryKey: ["/api/messages/unread", userId],
    enabled: !!userId,
    refetchInterval: 30000,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      renterId: string;
      ownerId: string;
      vehicleId?: string;
      tripId?: string;
    }): Promise<Conversation> => {
      const response = await apiRequest("POST", "/api/conversations", {
        participant1Id: data.renterId,
        participant2Id: data.ownerId,
        vehicleId: data.vehicleId,
        tripId: data.tripId,
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", variables.renterId] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      conversationId: string;
      senderId: string;
      content: string;
      messageType?: string;
    }) => {
      return apiRequest("POST", `/api/conversations/${data.conversationId}/messages`, {
        senderId: data.senderId,
        content: data.content,
        messageType: data.messageType || "text",
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", variables.conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });
}
