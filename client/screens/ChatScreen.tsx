import React, { useState, useCallback, useRef, useEffect } from "react";
import { StyleSheet, View, FlatList, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/hooks/useAuth";
import { useMessages, useSendMessage, Message } from "@/hooks/useMessages";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

type ChatRouteParams = {
  Chat: { conversationId: string };
};

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<ChatRouteParams, "Chat">>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const [messageText, setMessageText] = useState("");

  const conversationId = route.params?.conversationId;
  const { data: messages = [], isLoading, refetch } = useMessages(conversationId, user?.id);
  const sendMessage = useSendMessage();

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    if (!messageText.trim() || !user?.id || !conversationId) return;

    const text = messageText.trim();
    setMessageText("");

    try {
      await sendMessage.mutateAsync({
        conversationId,
        senderId: user.id,
        content: text,
      });
      refetch();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [messageText, user?.id, conversationId, sendMessage, refetch]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString();
  };

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isOwnMessage = item.senderId === user?.id;
      const showDate =
        index === 0 ||
        formatDate(messages[index - 1].createdAt) !== formatDate(item.createdAt);

      return (
        <View>
          {showDate ? (
            <View style={styles.dateHeader}>
              <ThemedText type="small" style={styles.dateText}>
                {formatDate(item.createdAt)}
              </ThemedText>
            </View>
          ) : null}
          <View
            style={[
              styles.messageContainer,
              isOwnMessage ? styles.ownMessage : styles.otherMessage,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                isOwnMessage
                  ? [styles.ownBubble, { backgroundColor: theme.primary }]
                  : [styles.otherBubble, { backgroundColor: theme.backgroundSecondary }],
              ]}
            >
              <ThemedText
                style={[
                  styles.messageText,
                  isOwnMessage && { color: "#FFFFFF" },
                ]}
              >
                {item.content}
              </ThemedText>
              <ThemedText
                type="small"
                style={[
                  styles.timeText,
                  isOwnMessage && { color: "rgba(255,255,255,0.7)" },
                ]}
              >
                {formatTime(item.createdAt)}
              </ThemedText>
            </View>
          </View>
        </View>
      );
    },
    [user?.id, theme, messages]
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.messagesList,
          { paddingBottom: Spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
      />
      <View
        style={[
          styles.inputContainer,
          {
            paddingBottom: insets.bottom + Spacing.sm,
            backgroundColor: theme.backgroundDefault,
            borderTopColor: theme.border,
          },
        ]}
      >
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: theme.backgroundSecondary,
              color: theme.text,
            },
          ]}
          placeholder="Type a message..."
          placeholderTextColor={theme.textSecondary}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
        />
        <Pressable
          style={[
            styles.sendButton,
            {
              backgroundColor: messageText.trim() ? theme.primary : theme.backgroundSecondary,
            },
          ]}
          onPress={handleSend}
          disabled={!messageText.trim() || sendMessage.isPending}
        >
          {sendMessage.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Feather
              name="send"
              size={20}
              color={messageText.trim() ? "#FFFFFF" : theme.textSecondary}
            />
          )}
        </Pressable>
      </View>
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
  messagesList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  dateHeader: {
    alignItems: "center",
    marginVertical: Spacing.md,
  },
  dateText: {
    opacity: 0.6,
  },
  messageContainer: {
    marginBottom: Spacing.sm,
  },
  ownMessage: {
    alignItems: "flex-end",
  },
  otherMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  ownBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timeText: {
    marginTop: 4,
    opacity: 0.7,
    fontSize: 11,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});
