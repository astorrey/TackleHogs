import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Region, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LocationCallout } from './LocationCallout';
import { getLocationsInBounds, getLocationTypeColor } from '@/lib/api/locations';
import { Spacing } from '@/constants/theme';
import type { Database } from '@/lib/supabase/types';

type Location = Database['public']['Tables']['locations']['Row'];

interface FishingMapProps {
  initialRegion?: Region;
  onLocationSelect?: (location: Location) => void;
  showUserLocation?: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
}

const DEFAULT_REGION: Region = {
  latitude: 39.8283,
  longitude: -98.5795,
  latitudeDelta: 30,
  longitudeDelta: 30,
};

export function FishingMap({
  initialRegion = DEFAULT_REGION,
  onLocationSelect,
  showUserLocation = true,
  userLocation,
}: FishingMapProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const mapRef = useRef<MapView>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const accentColor = useThemeColor({}, 'accent');

  const fetchLocations = useCallback(async (region: Region) => {
    setLoading(true);
    try {
      const northEast = {
        latitude: region.latitude + region.latitudeDelta / 2,
        longitude: region.longitude + region.longitudeDelta / 2,
      };
      const southWest = {
        latitude: region.latitude - region.latitudeDelta / 2,
        longitude: region.longitude - region.longitudeDelta / 2,
      };

      const data = await getLocationsInBounds(northEast, southWest, 50);
      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations(initialRegion);
  }, []);

  const handleRegionChangeComplete = useCallback((region: Region) => {
    // Only fetch if zoomed in enough (avoid too many pins)
    if (region.latitudeDelta < 5) {
      fetchLocations(region);
    }
  }, [fetchLocations]);

  const handleMarkerPress = useCallback((location: Location) => {
    setSelectedLocation(location);
    onLocationSelect?.(location);
  }, [onLocationSelect]);

  const centerOnUser = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }, 500);
    }
  }, [userLocation]);

  const getMarkerColor = (locationType: string) => {
    return getLocationTypeColor(locationType);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        onRegionChangeComplete={handleRegionChangeComplete}
        mapType="standard"
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={location.name}
            description={`${location.type} · ${location.state}`}
            pinColor={getMarkerColor(location.type)}
            onPress={() => handleMarkerPress(location)}
          />
        ))}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={accentColor} />
        </View>
      )}

      {selectedLocation && (
        <LocationCallout
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onViewDetails={() => {
            onLocationSelect?.(selectedLocation);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: Spacing.sm,
    borderRadius: 20,
  },
});
