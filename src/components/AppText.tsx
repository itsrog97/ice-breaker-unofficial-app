import React from 'react';
import { Text, type TextProps } from 'react-native';

import { typography, useTheme, type Palette } from '@/theme';

type Variant = keyof typeof typography;
type Tone = 'primary' | 'secondary' | 'tertiary' | 'brand' | 'error' | 'success' | 'onBrand';

const toneKey: Record<Tone, keyof Palette> = {
  primary: 'textPrimary',
  secondary: 'textSecondary',
  tertiary: 'textTertiary',
  brand: 'brandBlue',
  error: 'error',
  success: 'success',
  onBrand: 'onBrand',
};

export interface AppTextProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
  color?: string;
  align?: 'left' | 'center' | 'right';
  italic?: boolean;
}

export function AppText({ variant = 'body', tone = 'primary', color, align, italic, style, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  return (
    <Text
      maxFontSizeMultiplier={1.6}
      {...rest}
      style={[
        typography[variant],
        { color: color ?? colors[toneKey[tone]] },
        align && { textAlign: align },
        italic && { fontStyle: 'italic' },
        style,
      ]}
    />
  );
}
