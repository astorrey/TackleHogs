import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CatchForm } from '@/components/catches/CatchForm';
import { useAuth } from '@/hooks/use-auth';
import { router } from 'expo-router';

export default function CatchScreen() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      router.back();
    }, 1500);
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Please sign in to log catches</ThemedText>
      </ThemedView>
    );
  }

  if (submitted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Catch logged successfully!</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <CatchForm userId={user.id} onSubmit={handleSubmit} onCancel={() => router.back()} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
