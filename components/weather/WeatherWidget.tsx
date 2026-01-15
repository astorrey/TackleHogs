import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getWeatherData, getWeatherConditionScore, type WeatherData } from '@/lib/services/weather';
import { BorderRadius, Spacing, Shadows, Typography } from '@/constants/theme';

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
  variant?: 'compact' | 'full' | 'inline';
  onWeatherLoaded?: (weather: WeatherData | null) => void;
}

export function WeatherWidget({
  latitude,
  longitude,
  variant = 'compact',
  onWeatherLoaded,
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const borderColor = useThemeColor({}, 'border');
  const secondaryText = useThemeColor({}, 'textSecondary');
  const surfaceSecondary = useThemeColor({}, 'surfaceSecondary');
  const accentColor = useThemeColor({}, 'accent');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');

  useEffect(() => {
    let mounted = true;

    async function fetchWeather() {
      setLoading(true);
      setError(null);
      try {
        const data = await getWeatherData(latitude, longitude);
        if (mounted) {
          setWeather(data);
          onWeatherLoaded?.(data);
        }
      } catch (err) {
        if (mounted) {
          setError('Unable to load weather');
          onWeatherLoaded?.(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    if (latitude && longitude) {
      fetchWeather();
    }

    return () => {
      mounted = false;
    };
  }, [latitude, longitude, onWeatherLoaded]);

  const getWeatherIconUrl = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  const getFishingScore = () => {
    if (!weather) return { score: 0, label: 'Unknown', color: secondaryText };
    const score = getWeatherConditionScore(weather);
    
    if (score >= 15) return { score, label: 'Excellent', color: successColor };
    if (score >= 10) return { score, label: 'Good', color: accentColor };
    if (score >= 5) return { score, label: 'Fair', color: warningColor };
    return { score, label: 'Poor', color: secondaryText };
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, variant === 'inline' && styles.inlineContainer]}>
        <ActivityIndicator size="small" color={accentColor} />
        {variant !== 'inline' && (
          <ThemedText style={[styles.loadingText, { color: secondaryText }]}>
            Loading weather...
          </ThemedText>
        )}
      </View>
    );
  }

  if (error || !weather) {
    return (
      <View style={[styles.errorContainer, variant === 'inline' && styles.inlineContainer]}>
        <IconSymbol name="cloud.slash" size={variant === 'inline' ? 16 : 24} color={secondaryText} />
        {variant !== 'inline' && (
          <ThemedText style={[styles.errorText, { color: secondaryText }]}>
            {error || 'Weather unavailable'}
          </ThemedText>
        )}
      </View>
    );
  }

  const fishingCondition = getFishingScore();

  // Inline variant - single line for lists
  if (variant === 'inline') {
    return (
      <View style={styles.inlineContainer}>
        <Image
          source={{ uri: getWeatherIconUrl(weather.icon) }}
          style={styles.inlineIcon}
        />
        <ThemedText style={styles.inlineTemp}>
          {Math.round(weather.temperature)}°F
        </ThemedText>
        <ThemedText style={[styles.inlineCondition, { color: secondaryText }]}>
          {weather.conditions}
        </ThemedText>
      </View>
    );
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <ThemedView style={[styles.compactContainer, Shadows.sm, { borderColor }]}>
        <View style={styles.compactMain}>
          <Image
            source={{ uri: getWeatherIconUrl(weather.icon) }}
            style={styles.compactIcon}
          />
          <View style={styles.compactInfo}>
            <ThemedText style={styles.compactTemp}>
              {Math.round(weather.temperature)}°F
            </ThemedText>
            <ThemedText style={[styles.compactCondition, { color: secondaryText }]}>
              {weather.description}
            </ThemedText>
          </View>
        </View>
        <View style={[styles.compactScore, { backgroundColor: fishingCondition.color + '20' }]}>
          <IconSymbol name="fish" size={14} color={fishingCondition.color} />
          <ThemedText style={[styles.compactScoreText, { color: fishingCondition.color }]}>
            {fishingCondition.label}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Full variant
  return (
    <ThemedView style={[styles.fullContainer, Shadows.md, { borderColor }]}>
      <View style={styles.fullHeader}>
        <View style={styles.fullMainWeather}>
          <Image
            source={{ uri: getWeatherIconUrl(weather.icon) }}
            style={styles.fullIcon}
          />
          <View>
            <ThemedText style={styles.fullTemp}>
              {Math.round(weather.temperature)}°F
            </ThemedText>
            <ThemedText style={[styles.fullCondition, { color: secondaryText }]}>
              {weather.description}
            </ThemedText>
          </View>
        </View>
        <View style={[styles.fishingScoreBadge, { backgroundColor: fishingCondition.color + '15' }]}>
          <IconSymbol name="fish.fill" size={20} color={fishingCondition.color} />
          <ThemedText style={[styles.fishingScoreLabel, { color: fishingCondition.color }]}>
            {fishingCondition.label}
          </ThemedText>
          <ThemedText style={[styles.fishingScoreValue, { color: fishingCondition.color }]}>
            Fishing
          </ThemedText>
        </View>
      </View>

      <View style={[styles.fullDetails, { backgroundColor: surfaceSecondary }]}>
        <View style={styles.detailItem}>
          <IconSymbol name="wind" size={18} color={secondaryText} />
          <View>
            <ThemedText style={[styles.detailValue]}>
              {Math.round(weather.windSpeed)} mph
            </ThemedText>
            <ThemedText style={[styles.detailLabel, { color: secondaryText }]}>
              {getWindDirection(weather.windDirection)} Wind
            </ThemedText>
          </View>
        </View>

        <View style={styles.detailDivider} />

        <View style={styles.detailItem}>
          <IconSymbol name="humidity" size={18} color={secondaryText} />
          <View>
            <ThemedText style={styles.detailValue}>
              {weather.humidity}%
            </ThemedText>
            <ThemedText style={[styles.detailLabel, { color: secondaryText }]}>
              Humidity
            </ThemedText>
          </View>
        </View>

        <View style={styles.detailDivider} />

        <View style={styles.detailItem}>
          <IconSymbol name="barometer" size={18} color={secondaryText} />
          <View>
            <ThemedText style={styles.detailValue}>
              {(weather.pressure * 0.02953).toFixed(2)}
            </ThemedText>
            <ThemedText style={[styles.detailLabel, { color: secondaryText }]}>
              Pressure (inHg)
            </ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // Loading & Error states
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: Typography.fontSize.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
  },

  // Inline variant
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  inlineIcon: {
    width: 24,
    height: 24,
  },
  inlineTemp: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  inlineCondition: {
    fontSize: Typography.fontSize.sm,
  },

  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  compactMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  compactIcon: {
    width: 48,
    height: 48,
  },
  compactInfo: {
    gap: Spacing.xxs,
  },
  compactTemp: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  compactCondition: {
    fontSize: Typography.fontSize.sm,
    textTransform: 'capitalize',
  },
  compactScore: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  compactScoreText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },

  // Full variant
  fullContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fullHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  fullMainWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  fullIcon: {
    width: 64,
    height: 64,
  },
  fullTemp: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  fullCondition: {
    fontSize: Typography.fontSize.base,
    textTransform: 'capitalize',
  },
  fishingScoreBadge: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xxs,
  },
  fishingScoreLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
  },
  fishingScoreValue: {
    fontSize: Typography.fontSize.xs,
  },
  fullDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.lg,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  detailLabel: {
    fontSize: Typography.fontSize.xs,
  },
  detailDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    opacity: 0.5,
  },
});
