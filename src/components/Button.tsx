import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, shadows, spacing, touchTarget, typography, useTheme } from '@/theme';
import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dangerOutline' | 'fire';

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  icon,
  fullWidth,
  style,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.brandBlue, fg: colors.onBrand },
    secondary: { bg: colors.surfaceTertiary, fg: colors.textPrimary },
    outline: { bg: 'transparent', fg: colors.brandBlue, border: colors.brandBlue },
    ghost: { bg: 'transparent', fg: colors.brandBlue },
    danger: { bg: colors.error, fg: '#fff' },
    dangerOutline: { bg: 'transparent', fg: colors.error, border: colors.error },
    fire: { bg: FIRE_GRADIENT[1], fg: '#ffffff' },
  };
  const p = palette[variant];

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      onPress={onPress}
      hitSlop={size === 'sm' ? 6 : 0}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.sm : styles.md,
        { backgroundColor: p.bg, borderColor: p.border ?? 'transparent' },
        (variant === 'primary' || variant === 'fire') && shadows.medium,
        variant === 'fire' && styles.fire,
        fullWidth && { alignSelf: 'stretch' },
        pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        isDisabled && { opacity: 0.5 },
        style,
      ]}
    >
      {variant === 'fire' ? (
        <LinearGradient
          colors={FIRE_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={size === 'sm' ? 16 : 18} color={p.fg} /> : null}
          <AppText style={size === 'sm' ? typography.label : typography.heading} color={p.fg}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

/** "Burn the Wall" call to action: hot orange into a fiery red. */
const FIRE_GRADIENT = ['#ff7a00', '#e8400c', '#c81d0e'] as const;

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  md: { minHeight: 52, paddingHorizontal: spacing.xl },
  sm: { minHeight: 36, paddingHorizontal: spacing.lg, borderRadius: radius.pill, minWidth: touchTarget },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  fire: { overflow: 'hidden', borderWidth: 0 },
});
