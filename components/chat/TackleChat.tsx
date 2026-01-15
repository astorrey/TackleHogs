import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase/client';
import { BorderRadius, Spacing, Shadows, Typography } from '@/constants/theme';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  recommendedItems?: {
    id: string;
    name: string;
    type: string;
  }[];
}

interface TackleChatProps {
  latitude?: number;
  longitude?: number;
  locationName?: string;
}

const QUICK_PROMPTS = [
  "What should I use for bass fishing today?",
  "Best lure for murky water?",
  "What's good for early morning?",
  "Top water or deep diving?",
];

export function TackleChat({ latitude, longitude, locationName }: TackleChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hey there! I'm your fishing buddy. Tell me where you're fishing and what you're targeting, and I'll help you pick the best tackle from your box! 🎣",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryText = useThemeColor({}, 'textSecondary');
  const placeholderColor = useThemeColor({}, 'textTertiary');
  const accentColor = useThemeColor({}, 'accent');
  const surfaceSecondary = useThemeColor({}, 'surfaceSecondary');

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !user?.id || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const { data, error } = await supabase.functions.invoke('ai-tackle-chat', {
        body: {
          message: text.trim(),
          user_id: user.id,
          latitude,
          longitude,
          location_name: locationName,
        },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        recommendedItems: data.recommended_items,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment!",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, latitude, longitude, locationName, loading]);

  const handleQuickPrompt = useCallback((prompt: string) => {
    sendMessage(prompt);
  }, [sendMessage]);

  const renderMessage = useCallback(({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={[styles.avatarContainer, { backgroundColor: accentColor + '20' }]}>
            <IconSymbol name="fish.fill" size={16} color={accentColor} />
          </View>
        )}
        
        <View
          style={[
            styles.messageBubble,
            isUser
              ? [styles.userBubble, { backgroundColor: accentColor }]
              : [styles.assistantBubble, { backgroundColor: surfaceSecondary, borderColor }],
          ]}
        >
          <ThemedText
            style={[
              styles.messageText,
              isUser && { color: '#fff' },
            ]}
          >
            {item.content}
          </ThemedText>

          {/* Recommended items */}
          {item.recommendedItems && item.recommendedItems.length > 0 && (
            <View style={styles.recommendedContainer}>
              <ThemedText style={[styles.recommendedTitle, { color: secondaryText }]}>
                Recommended from your tackle box:
              </ThemedText>
              {item.recommendedItems.map((tackleItem) => (
                <View key={tackleItem.id} style={[styles.tackleItem, { borderColor }]}>
                  <IconSymbol name="checkmark.circle.fill" size={14} color={accentColor} />
                  <ThemedText style={styles.tackleItemText}>
                    {tackleItem.name}
                  </ThemedText>
                  <ThemedText style={[styles.tackleItemType, { color: secondaryText }]}>
                    {tackleItem.type}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }, [accentColor, surfaceSecondary, borderColor, secondaryText]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Quick prompts */}
      {messages.length <= 2 && (
        <View style={styles.quickPrompts}>
          <ThemedText style={[styles.quickPromptsTitle, { color: secondaryText }]}>
            Quick questions:
          </ThemedText>
          <View style={styles.quickPromptsRow}>
            {QUICK_PROMPTS.map((prompt, index) => (
              <Pressable
                key={index}
                style={[styles.quickPromptButton, { borderColor }]}
                onPress={() => handleQuickPrompt(prompt)}
              >
                <ThemedText style={styles.quickPromptText} numberOfLines={1}>
                  {prompt}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={accentColor} />
          <ThemedText style={[styles.loadingText, { color: secondaryText }]}>
            Thinking...
          </ThemedText>
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: surfaceColor, borderColor }]}>
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="Ask about tackle recommendations..."
          placeholderTextColor={placeholderColor}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!loading}
        />
        <Pressable
          style={[
            styles.sendButton,
            { backgroundColor: inputText.trim() && !loading ? accentColor : borderColor },
          ]}
          onPress={() => sendMessage(inputText)}
          disabled={!inputText.trim() || loading}
        >
          <IconSymbol
            name="arrow.up"
            size={18}
            color={inputText.trim() && !loading ? '#fff' : secondaryText}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  messageContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  assistantMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  userBubble: {
    borderBottomRightRadius: BorderRadius.xs,
  },
  assistantBubble: {
    borderTopLeftRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  messageText: {
    fontSize: Typography.fontSize.base,
    lineHeight: Typography.lineHeight.md,
  },
  recommendedContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: Spacing.sm,
  },
  recommendedTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  tackleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  tackleItemText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
  },
  tackleItemType: {
    fontSize: Typography.fontSize.xs,
  },
  quickPrompts: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  quickPromptsTitle: {
    fontSize: Typography.fontSize.sm,
  },
  quickPromptsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickPromptButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  quickPromptText: {
    fontSize: Typography.fontSize.sm,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: Typography.fontSize.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    maxHeight: 100,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
