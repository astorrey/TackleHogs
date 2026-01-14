import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { router } from 'expo-router';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (provider: 'google' | 'apple') => {
    try {
      setLoading(true);
      await signIn(provider);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          TackleHogs
        </ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Your digital tackle box and fishing companion
        </ThemedText>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.googleButton, loading && styles.buttonDisabled]}
            onPress={() => handleSignIn('google')}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Sign in with Google</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.appleButton, loading && styles.buttonDisabled]}
            onPress={() => handleSignIn('apple')}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Sign in with Apple</ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    gap: 24,
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  buttons: {
    gap: 12,
    marginTop: 32,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
