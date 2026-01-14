import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import * as locationsApi from '@/lib/api/locations';

export function useCurrentLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return {
    location,
    loading,
    error,
    refresh: requestLocation,
  };
}

export function useLocations(filters?: { state?: string; type?: string }) {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadLocations();
  }, [filters?.state, filters?.type]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await locationsApi.getLocations(filters);
      setLocations(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const findNearest = async (latitude: number, longitude: number) => {
    try {
      const location = await locationsApi.findNearestLocation(latitude, longitude);
      return location;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const addLocation = async (location: Parameters<typeof locationsApi.createLocation>[0]) => {
    try {
      const newLocation = await locationsApi.createLocation(location);
      setLocations((prev) => [...prev, newLocation]);
      return newLocation;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    locations,
    loading,
    error,
    findNearest,
    addLocation,
    refresh: loadLocations,
  };
}
