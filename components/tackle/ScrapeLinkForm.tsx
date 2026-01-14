import { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import * as scrapingApi from '@/lib/api/scraping';
import { validateUrl } from '@/lib/utils/validation';

interface ScrapeLinkFormProps {
  onScraped: (data: { name?: string; brand?: string; model?: string; description?: string; image?: string }) => void;
  onCancel: () => void;
}

export function ScrapeLinkForm({ onScraped, onCancel }: ScrapeLinkFormProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const surfaceColor = useThemeColor({}, 'surface');
  const accentColor = useThemeColor({}, 'accent');

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
      <ThemedText type="caption" style={styles.subtitle}>
        Paste a link to a tackle product page to automatically fill in details
      </ThemedText>

      <View style={styles.field}>
        <TextInput
          style={[styles.input, { borderColor, color: textColor, backgroundColor: surfaceColor }]}
          value={url}
          onChangeText={setUrl}
          placeholder="https://example.com/product"
          placeholderTextColor={textSecondaryColor}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.cancelButton, { borderColor }]} onPress={onCancel}>
          <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.scrapeButton, { backgroundColor: accentColor }, loading && styles.scrapeButtonDisabled]}
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
    padding: Spacing.xl,
    gap: Spacing.lg,
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
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    minHeight: 48,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.base,
  },
  scrapeButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  scrapeButtonDisabled: {
    opacity: 0.5,
  },
  scrapeButtonText: {
    color: '#fff',
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
});
