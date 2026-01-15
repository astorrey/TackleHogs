import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Button } from '@/components/ui/button';
import { BorderRadius, Spacing, Typography } from '@/constants/theme';

export type CelebrationVariant = 'catch' | 'new_species' | 'personal_record';

interface CatchCelebrationProps {
  visible: boolean;
  variant: CelebrationVariant;
  speciesName?: string;
  recordType?: 'weight' | 'length';
  recordValue?: number;
  onDismiss: () => void;
}

// Inline Lottie animation data for each celebration type
// In production, these would be separate .json files
const CELEBRATION_CONFIG: Record<CelebrationVariant, {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}> = {
  catch: {
    title: 'Nice Catch!',
    subtitle: 'Keep reeling them in!',
    icon: 'fish.fill',
    color: '#3B82F6',
  },
  new_species: {
    title: 'New Species!',
    subtitle: 'Added to your collection',
    icon: 'star.fill',
    color: '#F59E0B',
  },
  personal_record: {
    title: 'Personal Record!',
    subtitle: 'Your biggest catch yet!',
    icon: 'trophy.fill',
    color: '#10B981',
  },
};

export function CatchCelebration({
  visible,
  variant,
  speciesName,
  recordType,
  recordValue,
  onDismiss,
}: CatchCelebrationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<LottieView>(null);
  
  const config = CELEBRATION_CONFIG[variant];
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryText = useThemeColor({}, 'textSecondary');

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      
      // Entrance animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Play confetti animation
      confettiRef.current?.play();
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  const getSubtitle = () => {
    if (variant === 'new_species' && speciesName) {
      return `${speciesName} added to your collection!`;
    }
    if (variant === 'personal_record' && recordType && recordValue) {
      const unit = recordType === 'weight' ? 'lbs' : 'in';
      return `New ${recordType} record: ${recordValue} ${unit}!`;
    }
    return config.subtitle;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <Pressable style={styles.overlay} onPress={handleDismiss}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: opacityAnim,
            },
          ]}
        />
        
        <Animated.View
          style={[
            styles.content,
            {
              backgroundColor,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Confetti/particles animation background */}
          <View style={styles.animationContainer}>
            <LottieView
              ref={confettiRef}
              style={styles.confettiAnimation}
              source={getConfettiAnimation()}
              autoPlay={false}
              loop={false}
            />
          </View>

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['-45deg', '0deg'],
                    }),
                  },
                ],
              }}
            >
              <IconSymbol name={config.icon as any} size={48} color={config.color} />
            </Animated.View>
          </View>

          {/* Title */}
          <ThemedText style={[styles.title, { color: config.color }]}>
            {config.title}
          </ThemedText>

          {/* Subtitle */}
          <ThemedText style={[styles.subtitle, { color: secondaryText }]}>
            {getSubtitle()}
          </ThemedText>

          {/* Points badge */}
          {variant !== 'catch' && (
            <View style={[styles.bonusBadge, { backgroundColor: config.color + '15' }]}>
              <IconSymbol name="plus.circle.fill" size={16} color={config.color} />
              <ThemedText style={[styles.bonusText, { color: config.color }]}>
                {variant === 'new_species' ? '+25 bonus points!' : '+50 bonus points!'}
              </ThemedText>
            </View>
          )}

          {/* Dismiss button */}
          <Button onPress={handleDismiss} variant="ghost" fullWidth>
            Continue
          </Button>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// Simple confetti animation data
function getConfettiAnimation() {
  // This is a simplified confetti animation
  // In production, you would use a proper .json file from LottieFiles
  return {
    v: '5.5.7',
    fr: 60,
    ip: 0,
    op: 120,
    w: 400,
    h: 400,
    nm: 'Confetti',
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: 'Confetti',
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: {
            a: 1,
            k: [
              { t: 0, s: [0], e: [360] },
              { t: 120, s: [360] },
            ],
          },
          p: {
            a: 1,
            k: [
              { t: 0, s: [200, 50], e: [200, 350] },
              { t: 120, s: [200, 350] },
            ],
          },
          s: {
            a: 1,
            k: [
              { t: 0, s: [100, 100], e: [50, 50] },
              { t: 120, s: [50, 50] },
            ],
          },
        },
        ao: 0,
        shapes: [
          {
            ty: 'rc',
            d: 1,
            s: { a: 0, k: [20, 20] },
            p: { a: 0, k: [0, 0] },
            r: { a: 0, k: 4 },
            nm: 'Rectangle',
          },
          {
            ty: 'fl',
            c: { a: 0, k: [0.98, 0.62, 0.19, 1] },
            o: { a: 0, k: 100 },
            r: 1,
            nm: 'Fill',
          },
        ],
      },
    ],
  };
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  content: {
    width: width * 0.85,
    maxWidth: 340,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    alignItems: 'center',
    gap: Spacing.lg,
    overflow: 'hidden',
  },
  animationContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  confettiAnimation: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
  bonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  bonusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
});
