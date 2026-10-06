import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';

import { breakpoints, maxContentWidth, radius, shadows, spacing, touchTarget, useTheme } from '@/theme';
import { badgeCount } from '@/utils/format';
import { AppText } from './AppText';

/** Centers content and caps its width on tablets / Chromebooks. */
export function Container({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.container, style]}>{children}</View>;
}

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= breakpoints.tablet;
  const isDesktop = width >= breakpoints.desktop;
  const contentWidth = Math.min(width, maxContentWidth + (isDesktop ? 280 : 0));
  return { width, height, isTablet, isDesktop, contentWidth };
}

export function Card({ children, style, onPress, accessibilityLabel }: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const { colors } = useTheme();
  const base = [
    styles.card,
    { backgroundColor: colors.surfacePrimary, borderColor: colors.borderPrimary },
    shadows.light,
    style,
  ];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [base, pressed && { opacity: 0.9 }]}
    >
      {children}
    </Pressable>
  );
}

export function SectionHeader({ title, subtitle, right }: { title: string; subtitle?: string | null; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <AppText variant="title" accessibilityRole="header">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="secondary">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function Overline({ children }: { children: string }) {
  return (
    <AppText variant="overline" tone="secondary" style={{ textTransform: 'uppercase' }} accessibilityRole="header">
      {children}
    </AppText>
  );
}

export function IconButton({
  icon,
  onPress,
  label,
  badge,
  color,
  size = 24,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  label: string;
  badge?: number | null;
  color?: string;
  size?: number;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const text = badgeCount(badge);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={text ? `${label}, ${text} unread` : label}
      hitSlop={4}
      style={({ pressed }) => [styles.iconBtn, pressed && { backgroundColor: colors.surfaceTertiary }, disabled && { opacity: 0.4 }]}
    >
      <Ionicons name={icon} size={size} color={color ?? colors.textPrimary} />
      {text ? <CountBadge text={text} style={styles.iconBadge} /> : null}
    </Pressable>
  );
}

export function CountBadge({ text, style }: { text: string; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: colors.brandBlue }, style]}>
      <AppText variant="micro" color={colors.onBrand}>
        {text}
      </AppText>
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  icon,
  trailingIcon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  trailingIcon?: keyof typeof Ionicons.glyphMap;
}) {
  const { colors } = useTheme();
  const fg = selected ? colors.onBrand : colors.textPrimary;
  const content = (
    <>
      {icon ? <Ionicons name={icon} size={14} color={fg} /> : null}
      <AppText variant="label" color={fg} numberOfLines={1}>
        {label}
      </AppText>
      {trailingIcon ? <Ionicons name={trailingIcon} size={14} color={fg} /> : null}
    </>
  );
  const style = [
    styles.chip,
    {
      backgroundColor: selected ? colors.brandBlue : colors.surfacePrimary,
      borderColor: selected ? colors.brandBlue : colors.borderPrimary,
    },
  ];
  if (!onPress) return <View style={style}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [...style, pressed && { opacity: 0.8 }]}
    >
      {content}
    </Pressable>
  );
}

export function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.borderPrimary }} />;
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' },
  card: { borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md, marginBottom: spacing.md },
  iconBtn: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: touchTarget / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: { position: 'absolute', top: 6, right: 4 },
  badge: { minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 40,
  },
});
