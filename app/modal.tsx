import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CatchDetail } from '@/components/catches/CatchDetail';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ModalScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { type, id } = params;

  const handleClose = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">
          {type === 'catch' ? 'Catch Details' : type === 'tackle' ? 'Tackle Details' : 'Details'}
        </ThemedText>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <IconSymbol name="xmark" size={24} />
        </TouchableOpacity>
      </View>
      {type === 'catch' && id && <CatchDetail catchId={id as string} />}
      {type === 'tackle' && id && (
        <ThemedView style={styles.content}>
          <ThemedText>Tackle detail view coming soon</ThemedText>
        </ThemedView>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
