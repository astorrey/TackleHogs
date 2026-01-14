import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { TackleBox } from '@/components/tackle/TackleBox';
import { AddTackleForm } from '@/components/tackle/AddTackleForm';
import { ScrapeLinkForm } from '@/components/tackle/ScrapeLinkForm';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PageHeader } from '@/components/ui/page-header';
import { useAuth } from '@/hooks/use-auth';
import { useTackle } from '@/hooks/use-tackle';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function TackleBoxScreen() {
  const { user } = useAuth();
  const { items, loading, refresh } = useTackle(user?.id || null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showScrapeForm, setShowScrapeForm] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const accentColor = useThemeColor({}, 'accent');
  const borderColor = useThemeColor({}, 'borderMedium');

  const handleAddComplete = () => {
    setShowAddForm(false);
    setShowScrapeForm(false);
    setScrapedData(null);
    refresh();
  };

  const handleScraped = (data: any) => {
    setScrapedData(data);
    setShowScrapeForm(false);
    setShowAddForm(true);
  };

  if (showScrapeForm) {
    return (
      <ThemedView style={styles.container}>
        <ScrapeLinkForm onScraped={handleScraped} onCancel={() => setShowScrapeForm(false)} />
      </ThemedView>
    );
  }

  if (showAddForm) {
    return (
      <ThemedView style={styles.container}>
        {user && (
          <AddTackleForm
            userId={user.id}
            onSubmit={handleAddComplete}
            onCancel={() => {
              setShowAddForm(false);
              setScrapedData(null);
            }}
          />
        )}
      </ThemedView>
    );
  }

  const actionButtons = (
    <View style={styles.actions}>
      <TouchableOpacity
        style={[styles.actionButton, styles.actionButtonOutline, { borderColor }]}
        onPress={() => setShowScrapeForm(true)}
        activeOpacity={0.7}
      >
        <IconSymbol name="link" size={18} color={accentColor} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.actionButtonPrimary, { backgroundColor: accentColor }]}
        onPress={() => setShowAddForm(true)}
        activeOpacity={0.7}
      >
        <IconSymbol name="plus" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <PageHeader 
        title="Tackle Box" 
        icon="tray.fill"
        rightContent={actionButtons}
      />
      <TackleBox 
        items={items} 
        loading={loading} 
        onItemPress={(item) => {
          router.push(`/modal?type=tackle&id=${item.id}`);
        }} 
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonOutline: {
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  actionButtonPrimary: {
    ...Shadows.sm,
  },
});
