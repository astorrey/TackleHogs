import { useState, useEffect } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import * as commentsApi from '@/lib/api/comments';
import { formatRelativeTime } from '@/lib/utils/formatting';

interface CommentsSectionProps {
  catchId: string;
  userId: string;
}

export function CommentsSection({ catchId, userId }: CommentsSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [catchId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await commentsApi.getComments(catchId);
      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const comment = await commentsApi.createComment({
        catch_id: catchId,
        user_id: userId,
        content: newComment.trim(),
      });
      setComments((prev) => [...prev, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading comments...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Comments ({comments.length})
      </ThemedText>

      <FlatList
        data={comments}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            {item.user?.avatar_url && (
              <Image source={{ uri: item.user.avatar_url }} style={styles.avatar} />
            )}
            <View style={styles.commentContent}>
              <View style={styles.commentHeader}>
                <ThemedText type="defaultSemiBold">
                  {item.user?.display_name || item.user?.username || 'Unknown'}
                </ThemedText>
                <ThemedText type="caption" style={styles.time}>
                  {formatRelativeTime(item.created_at)}
                </ThemedText>
              </View>
              <ThemedText>{item.content}</ThemedText>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        style={styles.commentsList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Add a comment..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting || !newComment.trim()}
        >
          <ThemedText style={styles.submitButtonText}>Post</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    marginBottom: 8,
  },
  commentsList: {
    maxHeight: 300,
  },
  comment: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentContent: {
    flex: 1,
    gap: 4,
  },
  commentHeader: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  time: {
    opacity: 0.6,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#0a7ea4',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
