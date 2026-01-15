import React from 'react';
import { StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { CreateCompetitionForm } from '@/components/competitions';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function CreateCompetitionScreen() {
  const router = useRouter();
  const headerBackground = useThemeColor({}, 'headerBackground');

  const handleSuccess = (competitionId: string) => {
    router.replace(`/competitions/${competitionId}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'New Competition',
          headerStyle: { backgroundColor: headerBackground },
          headerShadowVisible: false,
        }}
      />
      <ThemedView style={styles.container}>
        <CreateCompetitionForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
