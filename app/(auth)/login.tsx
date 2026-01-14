import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ActivityIndicator, Alert, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);

  const handleSignIn = async (provider: 'google' | 'apple') => {
    try {
      setLoading(provider);
      await signIn(provider);
      // Navigation is handled by the auth state change in _layout.tsx
    } catch (error: any) {
      console.error('Sign in error:', error);
      const message = error?.message || 'An error occurred during sign in';
      if (Platform.OS === 'web') {
        alert(message);
      } else {
        Alert.alert('Sign In Error', message);
      }
    } finally {
      setLoading(null);
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
            style={[styles.button, styles.googleButton, loading !== null && styles.buttonDisabled]}
            onPress={() => handleSignIn('google')}
            disabled={loading !== null}
          >
            {loading === 'google' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <ThemedText style={styles.buttonText}>Sign in with Google</ThemedText>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.appleButton, loading !== null && styles.buttonDisabled]}
            onPress={() => handleSignIn('apple')}
            disabled={loading !== null}
          >
            {loading === 'apple' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.buttonContent}>
                <ThemedText style={styles.buttonText}>Sign in with Apple</ThemedText>
              </View>
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
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
