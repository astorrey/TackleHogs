import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { BorderRadius, Spacing, Typography, Shadows } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconSymbolName;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'borderMedium');
  const borderLightColor = useThemeColor({}, 'border');
  const errorColor = useThemeColor({}, 'error');
  const surfacePressedColor = useThemeColor({}, 'surfacePressed');

  const getBackgroundColor = (pressed: boolean) => {
    if (disabled) {
      switch (variant) {
        case 'primary':
        case 'destructive':
          return pressed ? surfacePressedColor : surfaceColor;
        default:
          return 'transparent';
      }
    }

    switch (variant) {
      case 'primary':
        return pressed ? adjustColor(accentColor, -15) : accentColor;
      case 'secondary':
        return pressed ? surfacePressedColor : surfaceColor;
      case 'outline':
        return pressed ? surfacePressedColor : 'transparent';
      case 'ghost':
        return pressed ? surfacePressedColor : 'transparent';
      case 'destructive':
        return pressed ? adjustColor(errorColor, -15) : errorColor;
      default:
        return accentColor;
    }
  };

  const getBorderColor = () => {
    if (disabled) return borderLightColor;
    switch (variant) {
      case 'outline':
        return borderColor;
      case 'secondary':
        return borderColor;
      case 'primary':
        return accentColor;
      case 'destructive':
        return errorColor;
      default:
        return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) return borderLightColor;
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return textColor;
      case 'outline':
        return textColor;
      case 'ghost':
        return accentColor;
      case 'destructive':
        return '#FFFFFF';
      default:
        return '#FFFFFF';
    }
  };

  const getIconColor = () => {
    if (disabled) return borderLightColor;
    switch (variant) {
      case 'primary':
      case 'destructive':
        return '#FFFFFF';
      case 'ghost':
        return accentColor;
      default:
        return textColor;
    }
  };

  const sizeStyles = getSizeStyles(size);

  const getBorderWidth = () => {
    switch (variant) {
      case 'outline':
      case 'secondary':
        return 1.5;
      case 'ghost':
        return 0;
      default:
        return 0;
    }
  };

  const getShadow = () => {
    if (disabled) return Shadows.none;
    switch (variant) {
      case 'primary':
        return Shadows.md;
      case 'destructive':
        return Shadows.sm;
      case 'secondary':
        return Shadows.sm;
      default:
        return Shadows.none;
    }
  };

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        sizeStyles.button,
        {
          backgroundColor: getBackgroundColor(pressed),
          borderColor: getBorderColor(),
          borderWidth: getBorderWidth(),
        },
        getShadow(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <IconSymbol
              name={icon}
              size={sizeStyles.iconSize}
              color={getIconColor()}
              style={styles.iconLeft}
            />
          )}
          <ThemedText
            style={[
              styles.text,
              sizeStyles.text,
              { color: getTextColor() },
            ]}
          >
            {children}
          </ThemedText>
          {icon && iconPosition === 'right' && (
            <IconSymbol
              name={icon}
              size={sizeStyles.iconSize}
              color={getIconColor()}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </Pressable>
  );
}

function getSizeStyles(size: ButtonSize): {
  button: ViewStyle;
  text: TextStyle;
  iconSize: number;
} {
  switch (size) {
    case 'sm':
      return {
        button: {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          borderRadius: BorderRadius.sm,
          minHeight: 36,
        },
        text: {
          fontSize: Typography.fontSize.sm,
          fontWeight: Typography.fontWeight.semibold,
        },
        iconSize: 16,
      };
    case 'lg':
      return {
        button: {
          paddingVertical: Spacing.lg,
          paddingHorizontal: Spacing.xl,
          borderRadius: BorderRadius.md,
          minHeight: 56,
        },
        text: {
          fontSize: Typography.fontSize.md,
          fontWeight: Typography.fontWeight.semibold,
        },
        iconSize: 22,
      };
    case 'md':
    default:
      return {
        button: {
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
          borderRadius: BorderRadius.md,
          minHeight: 48,
        },
        text: {
          fontSize: Typography.fontSize.base,
          fontWeight: Typography.fontWeight.semibold,
        },
        iconSize: 18,
      };
  }
}

// Helper to darken/lighten colors
function adjustColor(color: string, amount: number): string {
  const clamp = (num: number) => Math.min(255, Math.max(0, num));
  
  // Remove # if present
  const hex = color.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust values
  const newR = clamp(r + amount);
  const newG = clamp(g + amount);
  const newB = clamp(b + amount);
  
  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
});
