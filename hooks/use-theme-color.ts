/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

// Hook to get multiple theme colors at once
export function useThemeColors<T extends (keyof typeof Colors.light & keyof typeof Colors.dark)[]>(
  colorNames: [...T]
): { [K in T[number]]: string } {
  const theme = useColorScheme() ?? 'light';
  const result = {} as { [K in T[number]]: string };
  
  for (const name of colorNames) {
    (result as any)[name] = Colors[theme][name];
  }
  
  return result;
}
