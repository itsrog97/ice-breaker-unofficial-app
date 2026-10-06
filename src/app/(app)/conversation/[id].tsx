import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import { messagingApi } from '@/api/endpoints';
import { AppText, Avatar, Composer, ErrorView, LoadingView, errorMessage } from '@/components';
import { qk, useConversation, useMe, useMessages, useSendMessage } from '@/hooks/queries';
import { maxContentWidth, radius, spacing, useTheme } from '@/theme';
import type { DirectMessage } from '@/types/api';
import { clockTime, dayLabel, fullName } from '@/utils/format';
import { notify } from '@/utils/dialog';

type Item = { kind: 'day'; id: string; label: string } | { kind: 'msg'; id: string; m: DirectMessage };

function buildItems(messages: DirectMessage[]): Item[] {
  // Inverted list → newest first.
  const sorted = [...messages].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const out: Item[] = [];
  sorted.forEach((m, i) => {
    out.push({ kind: 'msg', id: m.id, m });
    const next = sorted[i + 1];
    if (!next || dayLabel(next.created_at) !== dayLabel(m.created_at)) {
      out.push({ kind: 'day', id: `day-${m.id}`, label: dayLabel(m.created_at) });
    }
  });
  return out;
}

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const me = useMe();
  const conversation = useConversation(id);
  const messages = useMessages(id);
  const send = useSendMessage(id);

  const other = conversation.data?.other_participant;
  const items = useMemo(() => buildItems(messages.data?.messages ?? []), [messages.data]);
  const newestId = messages.data?.messages?.[messages.data.messages.length - 1]?.id;

  // Mark as read when opened and whenever a new message arrives while open.
  useEffect(() => {
    if (!id) return;
    messagingApi
      .markRead(id)
      .then(() => {
        qc.invalidateQueries({ queryKey: qk.unreadMessages });
        qc.invalidateQueries({ queryKey: qk.conversations });
      })
      .catch(() => {});
  }, [id, newestId, qc]);

  const headerTitle = () =>
    other ? (
      <Pressable
        onPress={() => router.push({ pathname: '/person/[id]', params: { id: other.id } })}
        accessibilityRole="button"
        accessibilityLabel={`View ${fullName(other)}'s profile`}
        style={styles.headerTitle}
      >
        <Avatar uri={other.photo_url} person={other} size={36} online={other.is_active} />
        <View style={{ flexShrink: 1 }}>
          <AppText variant="heading" numberOfLines={1}>
            {fullName(other)}
          </AppText>
          <AppText variant="caption" tone="secondary" numberOfLines={1}>
            {[other.current_title, other.current_company].filter(Boolean).join(' at ')}
          </AppText>
        </View>
      </Pressable>
    ) : null;

  const onSend = async (text: string) => {
    try {
      await send.mutateAsync(text);
    } catch (e) {
      notify('Message not sent', errorMessage(e));
      throw e;
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerTitle, headerTitleAlign: 'left' }} />
      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.flex}>
          {messages.isPending ? (
            <LoadingView />
          ) : messages.isError ? (
            <ErrorView error={messages.error} onRetry={() => messages.refetch()} />
          ) : items.length === 0 ? (
            <View style={styles.empty}>
              <AppText tone="secondary" align="center">
                No messages yet. Say hello 👋
              </AppText>
            </View>
          ) : (
            <FlatList
              inverted
              data={items}
              keyExtractor={(i) => i.id}
              style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' }}
              contentContainerStyle={styles.list}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                if (item.kind === 'day') {
                  return (
                    <View style={[styles.dayPill, { backgroundColor: colors.surfaceTertiary }]}>
                      <AppText variant="caption" tone="secondary">
                        {item.label}
                      </AppText>
                    </View>
                  );
                }
                const mine = item.m.sender_id === me.data?.id;
                const deleted = !!item.m.deleted_at;
                return (
                  <View style={[styles.msgWrap, mine ? styles.right : styles.left]}>
                    <View
                      style={[
                        styles.bubble,
                        mine
                          ? { backgroundColor: colors.bubbleMine, borderBottomRightRadius: 6 }
                          : { backgroundColor: colors.bubbleTheirs, borderBottomLeftRadius: 6 },
                      ]}
                    >
                      <AppText
                        color={mine ? colors.onBubbleMine : colors.textPrimary}
                        italic={deleted}
                        selectable
                      >
                        {deleted ? 'Message deleted' : item.m.content}
                      </AppText>
                    </View>
                    <AppText variant="caption" tone="tertiary" style={styles.time}>
                      {clockTime(item.m.created_at)}
                      {item.m.edited_at ? ' · edited' : ''}
                    </AppText>
                  </View>
                );
              }}
            />
          )}
        </View>
        <View style={{ paddingBottom: insets.bottom }}>
          <Composer placeholder="Type a message..." onSend={onSend} sending={send.isPending} disabled={!conversation.data && conversation.isError} />
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, maxWidth: 280 },
  list: { padding: spacing.lg, gap: spacing.xs, flexGrow: 1 },
  empty: { flex: 1, justifyContent: 'center', padding: spacing.xl },
  dayPill: { alignSelf: 'center', borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 4, marginVertical: spacing.md },
  msgWrap: { maxWidth: '82%', marginVertical: 2 },
  left: { alignSelf: 'flex-start' },
  right: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubble: { borderRadius: radius.xl + 4, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  time: { marginTop: 2, marginHorizontal: spacing.xs },
});
