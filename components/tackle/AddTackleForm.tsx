import { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import type { TackleItemType } from '@/lib/supabase/types';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase/client';

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 64;

interface AddTackleFormProps {
  userId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export function AddTackleForm({ userId, onSubmit, onCancel }: AddTackleFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<TackleItemType>('lure');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const accentColor = useThemeColor({}, 'accent');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `${userId}/${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('tackle-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('tackle-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      if (imageUri) {
        imageUrl = await uploadImage(imageUri);
      }

      const { error } = await supabase.from('tackle_items').insert({
        user_id: userId,
        name: name.trim(),
        type,
        brand: brand.trim() || null,
        model: model.trim() || null,
        description: description.trim() || null,
        image_url: imageUrl,
      });

      if (error) throw error;
      onSubmit();
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const types: { value: TackleItemType; label: string; emoji: string }[] = [
    { value: 'rod', label: 'Rod', emoji: '🎣' },
    { value: 'reel', label: 'Reel', emoji: '🔄' },
    { value: 'lure', label: 'Lure', emoji: '🪱' },
    { value: 'line', label: 'Line', emoji: '🧵' },
    { value: 'hook', label: 'Hook', emoji: '🪝' },
    { value: 'other', label: 'Other', emoji: '📦' },
  ];

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + TAB_BAR_HEIGHT }
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={styles.form}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Add Tackle Item
          </ThemedText>
          <ThemedText type="caption" style={styles.subtitle}>
            Add gear to your digital tackle box
          </ThemedText>
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold" style={styles.label}>
            Name <ThemedText style={styles.required}>*</ThemedText>
          </ThemedText>
          <TextInput
            style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter item name"
            placeholderTextColor={textSecondaryColor}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Type</ThemedText>
          <View style={styles.typeContainer}>
            {types.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[
                  styles.typeButton,
                  { borderColor },
                  type === t.value && { backgroundColor: accentColor, borderColor: accentColor }
                ]}
                onPress={() => setType(t.value)}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.typeEmoji}>{t.emoji}</ThemedText>
                <ThemedText 
                  style={[
                    styles.typeButtonText, 
                    type === t.value && styles.typeButtonTextActive
                  ]}
                >
                  {t.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Brand</ThemedText>
          <TextInput
            style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
            value={brand}
            onChangeText={setBrand}
            placeholder="Enter brand"
            placeholderTextColor={textSecondaryColor}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Model</ThemedText>
          <TextInput
            style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
            value={model}
            onChangeText={setModel}
            placeholder="Enter model"
            placeholderTextColor={textSecondaryColor}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Description</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            placeholderTextColor={textSecondaryColor}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Image</ThemedText>
          <Button
            variant="outline"
            icon="photo"
            onPress={pickImage}
          >
            {imageUri ? 'Change Image' : 'Select Image'}
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
            Add Item
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
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  typeEmoji: {
    fontSize: 14,
  },
  typeButtonText: {
    fontSize: Typography.fontSize.sm,
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
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
