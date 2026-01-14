import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { TackleItemType } from '@/lib/supabase/types';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase/client';

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

  const types: TackleItemType[] = ['rod', 'reel', 'lure', 'line', 'hook', 'other'];

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.form}>
        <ThemedText type="title" style={styles.title}>
          Add Tackle Item
        </ThemedText>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Name *</ThemedText>
          <TextInput
            style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
            value={name}
            onChangeText={setName}
            placeholder="Enter item name"
            placeholderTextColor={textSecondaryColor}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Type</ThemedText>
          <View style={styles.typeContainer}>
            {types.map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typeButton,
                  { borderColor },
                  type === t && { backgroundColor: accentColor, borderColor: accentColor }
                ]}
                onPress={() => setType(t)}
              >
                <ThemedText style={type === t ? styles.typeButtonTextActive : styles.typeButtonText}>
                  {t}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Brand</ThemedText>
          <TextInput
            style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
            value={brand}
            onChangeText={setBrand}
            placeholder="Enter brand"
            placeholderTextColor={textSecondaryColor}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Model</ThemedText>
          <TextInput
            style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
            value={model}
            onChangeText={setModel}
            placeholder="Enter model"
            placeholderTextColor={textSecondaryColor}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Description</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            placeholderTextColor={textSecondaryColor}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Image</ThemedText>
          <TouchableOpacity style={[styles.imageButton, { borderColor }]} onPress={pickImage}>
            <IconSymbol name="photo" size={24} />
            <ThemedText>{imageUri ? 'Change Image' : 'Select Image'}</ThemedText>
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
              {loading ? 'Adding...' : 'Add Item'}
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
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
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
