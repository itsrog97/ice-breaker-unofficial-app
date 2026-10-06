import { Ionicons } from '@expo/vector-icons';
import { Tabs, router } from 'expo-router';
import React from 'react';
import { StyleSheet, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DemoBanner, IconButton, Logo, OfflineBanner } from '@/components';
import { useJoinedChannels, useUnreadMessages, useUnreadNotifications } from '@/hooks/queries';
import { fontFamily, spacing, useTheme } from '@/theme';

function AppHeader() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const notifications = useUnreadNotifications();
  return (
    <View style={{ backgroundColor: colors.surfacePrimary }}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, borderBottomColor: colors.borderPrimary, height: 56 + insets.top },
        ]}
      >
        <Logo height={28} />
        <View style={styles.actions}>
          <IconButton
            icon="notifications-outline"
            label="Notifications"
            badge={notifications.data?.count}
            onPress={() => router.push('/notifications')}
          />
          <IconButton icon="settings-outline" label="Settings" onPress={() => router.push('/settings')} />
        </View>
      </View>
      <DemoBanner />
      <OfflineBanner />
    </View>
  );
}

type IconName = keyof typeof Ionicons.glyphMap;
const icon = (active: IconName, inactive: IconName) =>
  function TabIcon({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) {
    return <Ionicons name={focused ? active : inactive} color={color as string} size={size} />;
  };

export default function TabsLayout() {
  const { colors } = useTheme();
  const unread = useUnreadMessages();
  const channels = useJoinedChannels();
  const channelUnread = (channels.data ?? []).reduce((n, c) => n + (c.unread_count ?? 0), 0);
  const chatBadge = (unread.data?.unread_count ?? 0) + channelUnread;

  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.brandBlue,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: { backgroundColor: colors.surfacePrimary, borderTopColor: colors.borderPrimary },
        tabBarLabelStyle: { fontFamily: fontFamily.medium, fontSize: 11 },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('home', 'home-outline') }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover', tabBarIcon: icon('search', 'search-outline') }} />
      <Tabs.Screen name="spark" options={{ title: 'Spark', tabBarIcon: icon('sparkles', 'sparkles-outline') }} />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Chat',
          tabBarIcon: icon('chatbubbles', 'chatbubbles-outline'),
          tabBarBadge: chatBadge > 0 ? (chatBadge > 99 ? '99+' : chatBadge) : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.brandBlue, color: colors.onBrand, fontSize: 10 },
        }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person-circle', 'person-circle-outline') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actions: { flexDirection: 'row', alignItems: 'center' },
});
