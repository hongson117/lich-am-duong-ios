import React from 'react';
import { Platform, Text as NativeText, type TextProps } from 'react-native';

export const systemFontFamily = Platform.select({
  ios: 'System',
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif',
  default: 'sans-serif',
});

/** Uses the iPhone's installed San Francisco font; no Apple font is redistributed. */
export function Text({ style, ...props }: TextProps) {
  return <NativeText {...props} style={[{ fontFamily: systemFontFamily }, style]} />;
}
