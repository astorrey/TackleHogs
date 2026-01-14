import { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase/client';
import { calculatePointsLocal } from '@/lib/services/points';
import { getWeatherData } from '@/lib/services/weather';
import { useCurrentLocation } from '@/hooks/use-location';

interface CatchFormProps {
  userId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export function CatchForm({ userId, onSubmit, onCancel }: CatchFormProps) {
  const { location: currentLocation } = useCurrentLocation();
  const [fishSpeciesId, setFishSpeciesId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [tackleItemId, setTackleItemId] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const accentColor = useThemeColor({}, 'accent');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `${userId}/${Date.now()}.jpg`;

      const { data, error } = await supabase.storage
        .from('catch-photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('catch-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!fishSpeciesId) {
      Alert.alert('Error', 'Please select a fish species');
      return;
    }

    setLoading(true);
    try {
      let photoUrl = null;
      if (photoUri) {
        photoUrl = await uploadPhoto(photoUri);
      }

      const caughtAt = new Date().toISOString();
      let weatherData = null;
      if (currentLocation) {
        weatherData = await getWeatherData(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
      }

      const points = calculatePointsLocal(
        weight ? parseFloat(weight) : undefined,
        length ? parseFloat(length) : undefined,
        caughtAt
      );

      const { error } = await supabase.from('catches').insert({
        user_id: userId,
        fish_species_id: fishSpeciesId,
        location_id: locationId || null,
        tackle_item_id: tackleItemId || null,
        weight: weight ? parseFloat(weight) : null,
        length: length ? parseFloat(length) : null,
        photo_url: photoUrl,
        notes: notes.trim() || null,
        caught_at: caughtAt,
        latitude: currentLocation?.coords.latitude || null,
        longitude: currentLocation?.coords.longitude || null,
        weather_data: weatherData,
        points: points.points,
      });

      if (error) throw error;
      onSubmit();
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.form}>
        <ThemedText type="title" style={styles.title}>
          Log Catch
        </ThemedText>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Fish Species *</ThemedText>
          <TextInput
            style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
            value={fishSpeciesId}
            onChangeText={setFishSpeciesId}
            placeholder="Search for fish species"
            placeholderTextColor={textSecondaryColor}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Location</ThemedText>
          <TextInput
            style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
            value={locationId}
            onChangeText={setLocationId}
            placeholder="Select or create location"
            placeholderTextColor={textSecondaryColor}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Tackle Used</ThemedText>
          <TextInput
            style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
            value={tackleItemId}
            onChangeText={setTackleItemId}
            placeholder="Select tackle item"
            placeholderTextColor={textSecondaryColor}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.half]}>
            <ThemedText type="defaultSemiBold">Weight (lbs)</ThemedText>
            <TextInput
              style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
              value={weight}
              onChangeText={setWeight}
              placeholder="0.00"
              placeholderTextColor={textSecondaryColor}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[styles.field, styles.half]}>
            <ThemedText type="defaultSemiBold">Length (in)</ThemedText>
            <TextInput
              style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
              value={length}
              onChangeText={setLength}
              placeholder="0.0"
              placeholderTextColor={textSecondaryColor}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Notes</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes about your catch"
            placeholderTextColor={textSecondaryColor}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Photo</ThemedText>
          <TouchableOpacity style={[styles.imageButton, { borderColor }]} onPress={pickImage}>
            <ThemedText>{photoUri ? 'Change Photo' : 'Take Photo'}</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.cancelButton, { borderColor }]} onPress={onCancel}>
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: accentColor }, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <ThemedText style={styles.submitButtonText}>
              {loading ? 'Logging...' : 'Log Catch'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 20,
    gap: 20,
  },
  title: {
    marginBottom: 10,
  },
  field: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 44,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imageButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
