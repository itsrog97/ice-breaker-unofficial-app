import { Stack } from 'expo-router';
import React, { useEffect } from 'react';

import { useSettings } from '@/hooks/queries';
import { fontFamily, useTheme, type ThemePreference } from '@/theme';

export default function AppLayout() {
  const { colors, setPreference } = useTheme();
  const settings = useSettings();

  // Apply the account's saved appearance preference (shared with the website).
  const pref = settings.data?.theme_preference;
  useEffect(() => {
    if (pref === 'light' || pref === 'dark' || pref === 'system') setPreference(pref as ThemePreference);
  }, [pref, setPreference]);

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.textPrimary,
        headerStyle: { backgroundColor: colors.surfacePrimary },
        headerTitleStyle: { fontFamily: fontFamily.semibold, fontSize: 17 },
        headerShadowVisible: true,
        contentStyle: { backgroundColor: colors.background },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="person/[id]" options={{ title: '', presentation: 'card' }} />
      <Stack.Screen name="conversation/[id]" options={{ title: '' }} />
      <Stack.Screen name="channel/[id]" options={{ title: '' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
    </Stack>
  );
}
