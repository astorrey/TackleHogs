import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/hooks/use-auth';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'border');
  const errorColor = useThemeColor({}, 'error');

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        {user?.user_metadata?.avatar_url ? (
          <Image source={{ uri: user.user_metadata.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: accentColor }]}>
            <ThemedText style={styles.avatarText}>
              {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
            </ThemedText>
          </View>
        )}
        <ThemedText type="title" style={styles.name}>
          {user?.user_metadata?.full_name || user?.email || 'User'}
        </ThemedText>
        {user?.user_metadata?.state && (
          <ThemedText type="subtitle" style={styles.state}>
            {user.user_metadata.state}
          </ThemedText>
        )}
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={[styles.menuItem, { borderColor }]}>
          <ThemedText>Settings</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, { borderColor }]}>
          <ThemedText>Year-End Review</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, { borderColor }]} onPress={handleLogout}>
          <ThemedText style={{ color: errorColor }}>Sign Out</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '600',
  },
  name: {
    marginTop: 8,
  },
  state: {
    opacity: 0.7,
  },
  menu: {
    padding: 16,
    gap: 8,
  },
  menuItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
});
