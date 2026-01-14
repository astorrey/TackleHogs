import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TackleBox } from '@/components/tackle/TackleBox';
import { AddTackleForm } from '@/components/tackle/AddTackleForm';
import { ScrapeLinkForm } from '@/components/tackle/ScrapeLinkForm';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/hooks/use-auth';
import { useTackle } from '@/hooks/use-tackle';
import { router } from 'expo-router';

export default function TackleBoxScreen() {
  const { user } = useAuth();
  const { items, loading, refresh } = useTackle(user?.id || null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showScrapeForm, setShowScrapeForm] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);

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

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">My Tackle Box</ThemedText>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowScrapeForm(true)}
          >
            <IconSymbol name="link" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowAddForm(true)}
          >
            <IconSymbol name="plus" size={20} />
          </TouchableOpacity>
        </View>
      </View>
      <TackleBox items={items} loading={loading} onItemPress={(item) => {
        // Navigate to tackle detail
        router.push(`/modal?type=tackle&id=${item.id}`);
      }} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
});
