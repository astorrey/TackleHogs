import { useState } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  Platform,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';

type AuthMode = 'signin' | 'signup';
type LoadingState = 'email' | 'google' | 'apple' | null;

export default function LoginScreen() {
  const { signIn, signInWithEmail, signUpWithEmail, resendConfirmationEmail } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState<LoadingState>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');

  const insets = useSafeAreaInsets();
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');
  const errorColor = useThemeColor({}, 'error');
  const successColor = useThemeColor({}, 'success');

  const showError = (message: string) => {
    if (Platform.OS === 'web') {
      alert(message);
    } else {
      Alert.alert('Error', message);
    }
  };

  const handleEmailAuth = async () => {
    // Basic validation
    if (!email.trim()) {
      showError('Please enter your email address');
      return;
    }
    if (!password.trim()) {
      showError('Please enter your password');
      return;
    }
    if (password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }
    if (mode === 'signup' && !username.trim()) {
      showError('Please enter a username');
      return;
    }

    try {
      setLoading('email');

      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        const result = await signUpWithEmail(email, password, username.trim());
        if (result.needsEmailConfirmation) {
          setConfirmationEmail(email);
          setShowConfirmation(true);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const message = error?.message || 'An error occurred';
      showError(message);
    } finally {
      setLoading(null);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    try {
      setLoading(provider);
      await signIn(provider);
    } catch (error: any) {
      console.error('Sign in error:', error);
      const message = error?.message || 'An error occurred during sign in';
      showError(message);
    } finally {
      setLoading(null);
    }
  };

  const handleResendConfirmation = async () => {
    try {
      setLoading('email');
      await resendConfirmationEmail(confirmationEmail);
      if (Platform.OS === 'web') {
        alert('Confirmation email sent!');
      } else {
        Alert.alert('Success', 'Confirmation email sent!');
      }
    } catch (error: any) {
      showError(error?.message || 'Failed to resend confirmation email');
    } finally {
      setLoading(null);
    }
  };

  const resetToSignIn = () => {
    setShowConfirmation(false);
    setMode('signin');
    setEmail(confirmationEmail);
    setPassword('');
  };

  // Show confirmation message after sign up
  if (showConfirmation) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.content, { paddingTop: insets.top }]}>
          <View style={styles.confirmationContainer}>
            <View style={[styles.iconContainer, { backgroundColor: `${successColor}15` }]}>
              <ThemedText style={styles.confirmationIcon}>✉️</ThemedText>
            </View>
            <ThemedText type="title" style={styles.confirmationTitle}>
              Check Your Email
            </ThemedText>
            <ThemedText type="body" style={[styles.confirmationText, { color: textSecondaryColor }]}>
              We've sent a confirmation link to{'\n'}
              <ThemedText type="body" style={{ fontWeight: '600' }}>{confirmationEmail}</ThemedText>
            </ThemedText>
            <ThemedText type="body" style={[styles.confirmationSubtext, { color: textSecondaryColor }]}>
              Click the link in the email to activate your account, then come back here to sign in.
            </ThemedText>

            <View style={styles.confirmationButtons}>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={resetToSignIn}
              >
                Back to Sign In
              </Button>
              <Button
                variant="ghost"
                size="md"
                fullWidth
                loading={loading === 'email'}
                onPress={handleResendConfirmation}
              >
                Resend Confirmation Email
              </Button>
            </View>
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo/Brand */}
          <View style={styles.brandContainer}>
            <View style={[styles.logoContainer, { backgroundColor: `${accentColor}15` }]}>
              <ThemedText style={styles.logoEmoji}>🐗</ThemedText>
            </View>
            <ThemedText type="title" style={styles.title}>
              TackleHogs
            </ThemedText>
            <ThemedText type="body" style={[styles.subtitle, { color: textSecondaryColor }]}>
              Your digital tackle box and fishing companion
            </ThemedText>
          </View>

          {/* Tab Selector */}
          <View style={[styles.tabContainer, { backgroundColor: surfaceColor, borderColor }]}>
            <Pressable
              style={[
                styles.tab,
                mode === 'signin' && { backgroundColor: accentColor },
              ]}
              onPress={() => setMode('signin')}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: mode === 'signin' ? '#FFFFFF' : textSecondaryColor },
                ]}
              >
                Sign In
              </ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.tab,
                mode === 'signup' && { backgroundColor: accentColor },
              ]}
              onPress={() => setMode('signup')}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: mode === 'signup' ? '#FFFFFF' : textSecondaryColor },
                ]}
              >
                Sign Up
              </ThemedText>
            </Pressable>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'signup' && (
              <View style={styles.inputContainer}>
                <ThemedText type="caption" style={[styles.inputLabel, { color: textSecondaryColor }]}>
                  Username
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: surfaceColor,
                      borderColor,
                      color: textColor,
                    },
                  ]}
                  placeholder="Choose a username"
                  placeholderTextColor={textSecondaryColor}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <ThemedText type="caption" style={[styles.inputLabel, { color: textSecondaryColor }]}>
                Email
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: surfaceColor,
                    borderColor,
                    color: textColor,
                  },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={textSecondaryColor}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText type="caption" style={[styles.inputLabel, { color: textSecondaryColor }]}>
                Password
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: surfaceColor,
                    borderColor,
                    color: textColor,
                  },
                ]}
                placeholder={mode === 'signup' ? 'Create a password (min 6 characters)' : 'Enter your password'}
                placeholderTextColor={textSecondaryColor}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </View>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={loading === 'email'}
              disabled={loading !== null}
              onPress={handleEmailAuth}
            >
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
            <ThemedText type="caption" style={[styles.dividerText, { color: textSecondaryColor }]}>
              or continue with
            </ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
          </View>

          {/* OAuth Buttons */}
          <View style={styles.oauthButtons}>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              icon="logo.google"
              loading={loading === 'google'}
              disabled={loading !== null}
              onPress={() => handleOAuthSignIn('google')}
              style={styles.googleButton}
            >
              Google
            </Button>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon="logo.apple"
              loading={loading === 'apple'}
              disabled={loading !== null}
              onPress={() => handleOAuthSignIn('apple')}
              style={styles.appleButton}
            >
              Apple
            </Button>
          </View>

          {/* Terms */}
          <ThemedText type="caption" style={[styles.terms, { color: textSecondaryColor }]}>
            By continuing, you agree to our Terms of Service{'\n'}and Privacy Policy
          </ThemedText>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing['2xl'],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  brandContainer: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
    borderWidth: 1,
    width: '100%',
    maxWidth: 340,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  tabText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  form: {
    width: '100%',
    maxWidth: 340,
    gap: Spacing.lg,
  },
  inputContainer: {
    gap: Spacing.xs,
  },
  inputLabel: {
    marginLeft: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    minHeight: 48,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    textTransform: 'lowercase',
  },
  oauthButtons: {
    width: '100%',
    maxWidth: 340,
    gap: Spacing.md,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  terms: {
    textAlign: 'center',
    lineHeight: 18,
  },
  // Confirmation screen styles
  confirmationContainer: {
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  confirmationIcon: {
    fontSize: 48,
  },
  confirmationTitle: {
    textAlign: 'center',
  },
  confirmationText: {
    textAlign: 'center',
    lineHeight: 24,
  },
  confirmationSubtext: {
    textAlign: 'center',
    lineHeight: 22,
    marginTop: Spacing.sm,
  },
  confirmationButtons: {
    width: '100%',
    maxWidth: 340,
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
});
