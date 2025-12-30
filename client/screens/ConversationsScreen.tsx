import React, { useCallback } from "react";
import { StyleSheet, View, FlatList, ActivityIndicator, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { EmptyState } from "@/components/EmptyState";
import { Card } from "@/components/Card";
import { useAuth } from "@/hooks/useAuth";
import { useConversations, Conversation } from "@/hooks/useMessages";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

export default function ConversationsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { data: conversations = [], isLoading, refetch } = useConversations(user?.id || null);
  const { theme } = useTheme();

  const handleConversationPress = useCallback(
    (conversation: Conversation) => {
      navigation.navigate("Chat" as any, { conversationId: conversation.id });
    },
    [navigation]
  );

  const handleBrowse = useCallback(() => {
    navigation.getParent()?.navigate("Browse");
  }, [navigation]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      const minutes = Math.floor(diffMs / (1000 * 60));
      return minutes <= 1 ? "Just now" : `${minutes}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderConversation = useCallback(
    ({ item }: { item: Conversation }) => {
      const hasUnread = (item.unreadCount || 0) > 0;
      const initials = (item.otherParticipantName || "U").substring(0, 1).toUpperCase();

      return (
        <Pressable onPress={() => handleConversationPress(item)}>
          <Card style={styles.conversationCard}>
            <View style={styles.conversationContent}>
              <View style={[styles.avatar, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText style={styles.avatarText}>{initials}</ThemedText>
              </View>
              <View style={styles.conversationDetails}>
                <View style={styles.headerRow}>
                  <ThemedText type="h4" style={[hasUnread && styles.unreadName]}>
                    {item.otherParticipantName || "Unknown"}
                  </ThemedText>
                  <ThemedText type="small" style={styles.timeText}>
                    {formatTime(item.lastMessageAt)}
                  </ThemedText>
                </View>
                {item.vehicleName ? (
                  <ThemedText type="small" style={styles.vehicleText}>
                    {item.vehicleName}
                  </ThemedText>
                ) : null}
                <View style={styles.previewRow}>
                  <ThemedText
                    type="small"
                    style={[styles.previewText, hasUnread && styles.unreadPreview]}
                    numberOfLines={1}
                  >
                    {item.lastMessagePreview || "No messages yet"}
                  </ThemedText>
                  {hasUnread ? (
                    <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                      <ThemedText style={styles.unreadCount}>{item.unreadCount}</ThemedText>
                    </View>
                  ) : null}
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </View>
          </Card>
        </Pressable>
      );
    },
    [handleConversationPress, theme]
  );

  const keyExtractor = useCallback((item: Conversation) => item.id, []);

  const ListEmpty = (
    <EmptyState
      icon="message-circle"
      title="No Conversations Yet"
      message="Start a conversation by messaging a vehicle owner or renter."
      actionLabel="Browse Vehicles"
      onAction={handleBrowse}
    />
  );

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <ThemedText style={{ marginTop: Spacing.md }}>Loading conversations...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + Spacing.xl },
        ]}
      >
        <ThemedText type="h1">Messages</ThemedText>
        {conversations.length > 0 ? (
          <ThemedText type="small" style={styles.count}>
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </ThemedText>
        ) : null}
      </View>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={keyExtractor}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        refreshing={isLoading}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  count: {
    marginTop: Spacing.xs,
    opacity: 0.7,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  conversationCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  conversationContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
  },
  conversationDetails: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timeText: {
    opacity: 0.6,
  },
  vehicleText: {
    opacity: 0.7,
    marginTop: 2,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: Spacing.sm,
  },
  previewText: {
    flex: 1,
    opacity: 0.6,
  },
  unreadName: {
    fontWeight: "700",
  },
  unreadPreview: {
    opacity: 1,
    fontWeight: "600",
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
