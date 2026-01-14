// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;

export type IconSymbolName = SymbolViewProps['name'];

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  // Navigation & Tab icons
  'house.fill': 'home',
  'tray.fill': 'inventory-2',
  'plus.circle.fill': 'add-circle',
  'trophy.fill': 'emoji-events',
  'person.fill': 'person',
  
  // Action icons
  'plus': 'add',
  'link': 'link',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'xmark': 'close',
  'checkmark': 'check',
  
  // Media icons
  'camera': 'camera-alt',
  'photo': 'photo',
  'photo.fill': 'photo',
  
  // Settings & Profile icons
  'gearshape': 'settings',
  'gearshape.fill': 'settings',
  'star': 'star',
  'star.fill': 'star',
  'rectangle.portrait.and.arrow.right': 'logout',
  'mappin': 'place',
  'mappin.circle.fill': 'place',
  
  // Auth/Brand icons (using closest alternatives)
  'logo.google': 'login',
  'logo.apple': 'apple',
  
  // Misc icons
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'magnifyingglass': 'search',
  'ellipsis': 'more-horiz',
  'heart.fill': 'favorite',
  'heart': 'favorite-border',
  'bubble.left.fill': 'chat-bubble',
  'share': 'share',
  'bookmark': 'bookmark-border',
  'bookmark.fill': 'bookmark',
  'trash': 'delete',
  'trash.fill': 'delete',
  'pencil': 'edit',
  'info.circle': 'info',
  'info.circle.fill': 'info',
  'exclamationmark.triangle': 'warning',
  'exclamationmark.triangle.fill': 'warning',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const mappedName = MAPPING[name as string];
  
  // Fallback to 'help' if icon not found in mapping
  const iconName = mappedName || 'help';
  
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
