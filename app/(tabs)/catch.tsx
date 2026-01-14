import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CatchForm } from '@/components/catches/CatchForm';
import { useAuth } from '@/hooks/use-auth';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { Spacing, BorderRadius } from '@/constants/theme';

export default function CatchScreen() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const insets = useSafeAreaInsets();
  const accentColor = useThemeColor({}, 'accent');
  const successColor = useThemeColor({}, 'success');

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      router.back();
    }, 1500);
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.centeredContent, { paddingTop: insets.top }]}>
          <View style={[styles.iconContainer, { backgroundColor: `${accentColor}15` }]}>
            <ThemedText style={styles.icon}>🔒</ThemedText>
          </View>
          <ThemedText type="subtitle" style={styles.title}>Sign In Required</ThemedText>
          <ThemedText type="caption" style={styles.subtitle}>
            Please sign in to log your catches
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (submitted) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.centeredContent, { paddingTop: insets.top }]}>
          <View style={[styles.iconContainer, { backgroundColor: `${successColor}15` }]}>
            <ThemedText style={styles.icon}>🎉</ThemedText>
          </View>
          <ThemedText type="title" style={styles.successTitle}>
            Catch Logged!
          </ThemedText>
          <ThemedText type="caption" style={styles.subtitle}>
            Your catch has been saved successfully
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <CatchForm userId={user.id} onSubmit={handleSubmit} onCancel={() => router.back()} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['3xl'],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  successTitle: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
