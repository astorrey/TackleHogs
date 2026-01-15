import React from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FriendsList } from '@/components/friends';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function FriendsScreen() {
  const insets = useSafeAreaInsets();
  const headerBackground = useThemeColor({}, 'headerBackground');

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Friends',
          headerStyle: { backgroundColor: headerBackground },
          headerShadowVisible: false,
        }}
      />
      <ThemedView style={styles.container}>
        <FriendsList />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
