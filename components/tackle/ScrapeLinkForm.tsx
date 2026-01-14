import { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import * as scrapingApi from '@/lib/api/scraping';
import { validateUrl } from '@/lib/utils/validation';

interface ScrapeLinkFormProps {
  onScraped: (data: { name?: string; brand?: string; model?: string; description?: string; image?: string }) => void;
  onCancel: () => void;
}

export function ScrapeLinkForm({ onScraped, onCancel }: ScrapeLinkFormProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScrape = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    if (!validateUrl(url)) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    setLoading(true);
    try {
      const data = await scrapingApi.scrapeTackleUrl(url);
      onScraped(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to scrape URL. Please try manual entry.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Scrape from URL
      </ThemedText>
      <ThemedText type="subtitle" style={styles.subtitle}>
        Paste a link to a tackle product page to automatically fill in details
      </ThemedText>

      <View style={styles.field}>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="https://example.com/product"
          placeholderTextColor="#999"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.scrapeButton, loading && styles.scrapeButtonDisabled]}
          onPress={handleScrape}
          disabled={loading}
        >
          <ThemedText style={styles.scrapeButtonText}>
            {loading ? 'Scraping...' : 'Scrape'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 8,
  },
  field: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 44,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
  },
  scrapeButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
  },
  scrapeButtonDisabled: {
    opacity: 0.5,
  },
  scrapeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
