import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { AppText, Button, Container, Divider, Overline, errorMessage } from '@/components';
import { APP_VERSION, LINKS } from '@/constants/config';
import { useSettings, useUpdateSettings } from '@/hooks/queries';
import { useAuth } from '@/store/AuthProvider';
import { radius, spacing, touchTarget, useTheme } from '@/theme';
import { confirm, notify } from '@/utils/dialog';

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.group}>
      <Overline>{title}</Overline>
      <View style={[styles.card, { borderColor: colors.borderPrimary, backgroundColor: colors.surfacePrimary }]}>{children}</View>
    </View>
  );
}

function Row({
  label,
  onPress,
  right,
  icon,
}: {
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, pressed && onPress && { backgroundColor: colors.surfaceSecondary }]}
    >
      <AppText style={{ flex: 1 }}>{label}</AppText>
      {right ?? (icon ? <Ionicons name={icon} size={18} color={colors.textTertiary} /> : null)}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { colors, scheme, setPreference } = useTheme();
  const { signOut } = useAuth();
  const settings = useSettings();
  const update = useUpdateSettings();

  const change = (patch: Parameters<typeof update.mutate>[0]) =>
    update.mutate(patch, { onError: (e) => notify("Couldn't save setting", errorMessage(e)) });

  const confirmLogout = async () => {
    if (await confirm('Log out?', 'You will need to sign in again.', 'Log Out', true)) await signOut();
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
      <Container style={{ paddingHorizontal: spacing.lg }}>
        <Group title="Notifications">
          <Row
            label="Email Notifications"
            right={
              <Switch
                value={!!settings.data?.email_notifications}
                disabled={!settings.data}
                onValueChange={(v) => change({ email_notifications: v })}
                trackColor={{ true: colors.brandBlue, false: colors.surfaceTertiary }}
                thumbColor="#fff"
                accessibilityLabel="Email notifications"
              />
            }
          />
        </Group>
        <Group title="Appearance">
          <Row
            label="Dark Mode"
            right={
              <Switch
                value={scheme === 'dark'}
                onValueChange={(v) => {
                  const pref = v ? 'dark' : 'light';
                  setPreference(pref);
                  change({ theme_preference: pref });
                }}
                trackColor={{ true: colors.brandBlue, false: colors.surfaceTertiary }}
                thumbColor="#fff"
                accessibilityLabel="Dark mode"
              />
            }
          />
        </Group>
        <Group title="Account">
          <Row label="Change Password" icon="chevron-forward" onPress={() => router.push('/change-password')} />
          <Divider />
          <Row label="Terms of Service" icon="open-outline" onPress={() => WebBrowser.openBrowserAsync(LINKS.terms)} />
          <Divider />
          <Row label="Privacy Policy" icon="open-outline" onPress={() => WebBrowser.openBrowserAsync(LINKS.privacy)} />
          <Divider />
          <Row label="Support" icon="open-outline" onPress={() => WebBrowser.openBrowserAsync(LINKS.support)} />
        </Group>

        <Button title="Log Out" variant="dangerOutline" onPress={confirmLogout} style={styles.logout} testID="logout" />

        <AppText variant="caption" tone="tertiary" align="center" style={{ marginTop: spacing.xl }}>
          Connectoo · v{APP_VERSION} · unofficial client for Icebreaker
        </AppText>
        <AppText variant="caption" tone="tertiary" align="center">
          Not affiliated with Icebreaker Connect, Inc. Account deletion is available on the website.
        </AppText>
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  group: { marginTop: spacing.xl, gap: spacing.sm },
  card: { borderWidth: 1, borderRadius: radius.lg, overflow: 'hidden' },
  row: { minHeight: touchTarget + 4, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.md },
  logout: { marginTop: spacing.xxl, alignSelf: 'center', minWidth: 180 },
});
