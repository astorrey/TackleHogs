import { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';
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
  const backgroundColor = useThemeColor({}, 'background');

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
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={styles.form}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Log Catch
          </ThemedText>
          <ThemedText type="caption" style={styles.subtitle}>
            Record your latest catch with details
          </ThemedText>
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Fish Species <ThemedText style={styles.required}>*</ThemedText>
          </ThemedText>
          <TextInput
            style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
            value={fishSpeciesId}
            onChangeText={setFishSpeciesId}
            placeholder="Search for fish species"
            placeholderTextColor={textSecondaryColor}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Location</ThemedText>
          <TextInput
            style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
            value={locationId}
            onChangeText={setLocationId}
            placeholder="Select or create location"
            placeholderTextColor={textSecondaryColor}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Tackle Used</ThemedText>
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
            <ThemedText type="defaultSemiBold" style={styles.label}>Weight (lbs)</ThemedText>
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
            <ThemedText type="defaultSemiBold" style={styles.label}>Length (in)</ThemedText>
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
          <ThemedText type="defaultSemiBold" style={styles.label}>Notes</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes about your catch"
            placeholderTextColor={textSecondaryColor}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Photo</ThemedText>
          <Button
            variant="outline"
            icon="camera"
            onPress={pickImage}
          >
            {photoUri ? 'Change Photo' : 'Take Photo'}
          </Button>
        </View>

        <View style={styles.actions}>
          <Button variant="outline" onPress={onCancel} style={styles.actionButton}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onPress={handleSubmit} 
            loading={loading}
            style={styles.actionButton}
          >
            Log Catch
          </Button>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  form: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  field: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.sm,
  },
  required: {
    color: '#DC2626',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  half: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    minHeight: 48,
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});
