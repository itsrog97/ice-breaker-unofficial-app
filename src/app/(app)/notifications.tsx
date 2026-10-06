import { useQueryClient } from '@tanstack/react-query';
import { Stack, router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { notificationsApi } from '@/api/endpoints';
import { AppText, Avatar, Button, EmptyView, ErrorView, LoadingView } from '@/components';
import { qk, useNotifications } from '@/hooks/queries';
import { maxContentWidth, spacing, useTheme } from '@/theme';
import type { AppNotification } from '@/types/api';
import { timeAgo } from '@/utils/format';
import { describeNotification as describe, routeForNotification } from '@/utils/notifications';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const qc = useQueryClient();
  const list = useNotifications();

  const refreshCounts = () => {
    qc.invalidateQueries({ queryKey: qk.notifications });
    qc.invalidateQueries({ queryKey: qk.unreadNotifications });
  };

  const open = (n: AppNotification) => {
    if (!n.is_read) notificationsApi.markRead(n.id).then(refreshCounts).catch(() => {});
    const r = routeForNotification(n);
    if (r) router.push(r);
  };

  const hasUnread = (list.data ?? []).some((n) => !n.is_read);

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: hasUnread
            ? () => (
                <Button
                  title="Mark all read"
                  variant="ghost"
                  size="sm"
                  onPress={() => notificationsApi.markAllRead().then(refreshCounts).catch(() => {})}
                />
              )
            : undefined,
        }}
      />
      {list.isPending ? (
        <LoadingView />
      ) : list.isError ? (
        <ErrorView error={list.error} onRetry={() => list.refetch()} />
      ) : (
        <FlatList
          data={list.data}
          keyExtractor={(n) => n.id}
          style={{ backgroundColor: colors.background }}
          contentContainerStyle={{ flexGrow: 1, width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' }}
          refreshControl={<RefreshControl refreshing={list.isRefetching} onRefresh={() => list.refetch()} />}
          ListEmptyComponent={<EmptyView icon="notifications-off-outline" title="You're all caught up" message="New activity will show up here." />}
          renderItem={({ item }) => {
            const d = describe(item);
            return (
              <Pressable
                onPress={() => open(item)}
                accessibilityRole="button"
                accessibilityLabel={`${d.name ?? ''}${d.text}${item.is_read ? '' : ', unread'}`}
                style={({ pressed }) => [
                  styles.row,
                  !item.is_read && { backgroundColor: colors.surfaceSecondary },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Avatar uri={item.metadata?.sender_photo_url} person={{ first_name: item.metadata?.sender_name }} size={40} />
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText>
                    {d.name ? <AppText variant="bodyMedium">{d.name}</AppText> : null}
                    {d.text}
                  </AppText>
                  <AppText variant="caption" tone="tertiary">
                    {timeAgo(item.sent_at)}
                  </AppText>
                </View>
                {!item.is_read ? <View style={[styles.dot, { backgroundColor: colors.brandBlue }]} /> : null}
              </Pressable>
            );
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg, alignItems: 'flex-start' },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
});
