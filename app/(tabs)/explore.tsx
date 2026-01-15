import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';

import { FishingMap } from '@/components/map';
import { WeatherWidget } from '@/components/weather';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BorderRadius, Spacing, Shadows, Typography } from '@/constants/theme';
import type { Database } from '@/lib/supabase/types';

type LocationData = Database['public']['Tables']['locations']['Row'];

export default function ExploreScreen() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const secondaryText = useThemeColor({}, 'textSecondary');

  useEffect(() => {
    async function getLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');

      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    }

    getLocation();
  }, []);

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    // Could navigate to a location detail screen
    // router.push(`/location/${location.id}`);
  };

  const initialRegion = userLocation
    ? {
        ...userLocation,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }
    : {
        latitude: 39.8283,
        longitude: -98.5795,
        latitudeDelta: 30,
        longitudeDelta: 30,
      };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Weather Widget Overlay */}
      {userLocation && (
        <View style={styles.weatherOverlay}>
          <WeatherWidget
            latitude={userLocation.latitude}
            longitude={userLocation.longitude}
            variant="compact"
          />
        </View>
      )}

      {/* Map */}
      <FishingMap
        initialRegion={initialRegion}
        onLocationSelect={handleLocationSelect}
        showUserLocation={locationPermission === true}
        userLocation={userLocation}
      />

      {/* Permission denied message */}
      {locationPermission === false && (
        <ThemedView style={[styles.permissionBanner, Shadows.md]}>
          <IconSymbol name="location.slash" size={20} color={secondaryText} />
          <ThemedText style={[styles.permissionText, { color: secondaryText }]}>
            Enable location access to see fishing spots near you
          </ThemedText>
        </ThemedView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  weatherOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 10,
  },
  permissionBanner: {
    position: 'absolute',
    bottom: 100,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  permissionText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
  },
});
