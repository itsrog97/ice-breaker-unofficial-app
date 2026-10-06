import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ApiError } from '@/api/client';
import { spacing, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';

export function LoadingView({ label }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.center} accessibilityRole="progressbar" accessibilityLabel={label ?? 'Loading'}>
      <ActivityIndicator size="large" color={colors.brandBlue} />
      {label ? (
        <AppText tone="secondary" variant="caption">
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong.';
}

export function ErrorView({ error, onRetry, compact }: { error: unknown; onRetry?: () => void; compact?: boolean }) {
  const { colors } = useTheme();
  const offline = error instanceof ApiError && error.isNetwork;
  return (
    <View style={[styles.center, compact && styles.compact]} accessibilityRole="alert">
      <Ionicons name={offline ? 'cloud-offline-outline' : 'alert-circle-outline'} size={40} color={colors.textTertiary} />
      <AppText variant="heading" align="center">
        {offline ? "You're offline" : "Couldn't load this"}
      </AppText>
      <AppText tone="secondary" align="center">
        {errorMessage(error)}
      </AppText>
      {onRetry ? <Button title="Try again" variant="outline" size="sm" icon="refresh" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyView({
  icon = 'file-tray-outline',
  title,
  message,
  action,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  action?: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.center}>
      <Ionicons name={icon} size={40} color={colors.textTertiary} />
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      {message ? (
        <AppText tone="secondary" align="center">
          {message}
        </AppText>
      ) : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md, minHeight: 240 },
  compact: { minHeight: 160, flex: 0 },
});
