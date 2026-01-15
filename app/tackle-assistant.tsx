import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import * as Location from 'expo-location';

import { TackleChat } from '@/components/chat';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function TackleAssistantScreen() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const headerBackground = useThemeColor({}, 'headerBackground');

  useEffect(() => {
    async function getLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    }
    getLocation();
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Tackle Assistant',
          headerStyle: { backgroundColor: headerBackground },
          headerShadowVisible: false,
        }}
      />
      <ThemedView style={styles.container}>
        <TackleChat
          latitude={location?.latitude}
          longitude={location?.longitude}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
