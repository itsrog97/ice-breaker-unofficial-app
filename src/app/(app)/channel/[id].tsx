import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useMemo } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { channelsApi } from '@/api/endpoints';
import { AppText, Avatar, Composer, EmptyView, ErrorView, LoadingView, errorMessage } from '@/components';
import { qk, useChannelMessages, useJoinedChannels, useSendChannelMessage } from '@/hooks/queries';
import { maxContentWidth, radius, spacing, useTheme } from '@/theme';
import type { ChannelMessage } from '@/types/api';
import { clockTime, dayLabel, fullName } from '@/utils/format';
import { notify } from '@/utils/dialog';

type Item = { kind: 'day'; id: string; label: string } | { kind: 'msg'; id: string; m: ChannelMessage };

function buildItems(messages: ChannelMessage[]): Item[] {
  const sorted = messages
    .filter((m) => !m.parent_message_id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
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

function ChannelMessageRow({ m }: { m: ChannelMessage }) {
  const { colors } = useTheme();
  const name = fullName(m.sender);
  const deleted = !!m.deleted_at;
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.push({ pathname: '/person/[id]', params: { id: m.sender.user_id } })}
        accessibilityRole="button"
        accessibilityLabel={`View ${name}'s profile`}
      >
        <Avatar uri={m.sender.photo_url} person={m.sender} size={40} />
      </Pressable>
      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.meta}>
          <AppText variant="label" numberOfLines={1} style={{ flexShrink: 1 }}>
            {name}
          </AppText>
          <AppText variant="caption" tone="tertiary">
            {clockTime(m.created_at)}
            {m.edited_at && !deleted ? ' · edited' : ''}
          </AppText>
        </View>
        <AppText italic={deleted} tone={deleted ? 'tertiary' : 'primary'} selectable>
          {deleted ? 'Message deleted' : m.content}
        </AppText>
        {m.media_url && m.media_type?.startsWith('image') ? (
          <Image
            source={{ uri: m.media_url }}
            style={{
              width: '100%',
              maxWidth: 320,
              aspectRatio: m.media_width && m.media_height ? m.media_width / m.media_height : 4 / 3,
              borderRadius: radius.md,
              marginTop: spacing.xs,
            }}
            contentFit="cover"
            accessibilityLabel="Shared image"
          />
        ) : null}
        {m.link_preview && !deleted ? (
          <Pressable
            onPress={() => WebBrowser.openBrowserAsync(m.link_preview!.url)}
            accessibilityRole="link"
            style={[styles.preview, { borderLeftColor: colors.brandBlue, backgroundColor: colors.surfaceSecondary }]}
          >
            {m.link_preview.site_name ? (
              <AppText variant="caption" tone="secondary">
                {m.link_preview.site_name}
              </AppText>
            ) : null}
            {m.link_preview.title ? (
              <AppText variant="label" tone="brand" numberOfLines={2}>
                {m.link_preview.title}
              </AppText>
            ) : null}
            {m.link_preview.description ? (
              <AppText variant="caption" tone="secondary" numberOfLines={3}>
                {m.link_preview.description}
              </AppText>
            ) : null}
          </Pressable>
        ) : null}
        {m.reactions?.length ? (
          <View style={styles.reactions}>
            {m.reactions.map((r) => (
              <View
                key={r.emoji}
                style={[
                  styles.reaction,
                  { borderColor: r.reacted_by_me ? colors.brandBlue : colors.borderPrimary, backgroundColor: colors.surfaceSecondary },
                ]}
                accessibilityLabel={`${r.emoji} ${r.count}`}
              >
                <AppText variant="caption">
                  {r.emoji} {r.count}
                </AppText>
              </View>
            ))}
          </View>
        ) : null}
        {m.thread?.reply_count ? (
          <AppText variant="caption" tone="brand">
            {m.thread.reply_count} {m.thread.reply_count === 1 ? 'reply' : 'replies'}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

export default function ChannelScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const joined = useJoinedChannels();
  const channel = joined.data?.find((c) => c.id === id);
  const messages = useChannelMessages(id);
  const send = useSendChannelMessage(id);
  const items = useMemo(() => buildItems(messages.data?.messages ?? []), [messages.data]);
  const newest = items.find((i) => i.kind === 'msg')?.id;

  useEffect(() => {
    if (!id) return;
    channelsApi
      .markRead(id)
      .then(() => qc.invalidateQueries({ queryKey: qk.channelsJoined }))
      .catch(() => {});
  }, [id, newest, qc]);

  const title = channel ? `# ${channel.name}` : name ? `# ${name}` : 'Channel';

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
      <Stack.Screen
        options={{
          title,
          headerRight: channel
            ? () => (
                <AppText variant="caption" tone="secondary" accessibilityLabel={`${channel.member_count} members`}>
                  {channel.member_count} members
                </AppText>
              )
            : undefined,
        }}
      />
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
            <EmptyView icon="chatbubbles-outline" title="No messages yet" message="Start the conversation." />
          ) : (
            <FlatList
              inverted
              data={items}
              keyExtractor={(i) => i.id}
              style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' }}
              contentContainerStyle={styles.list}
              keyboardDismissMode="interactive"
              renderItem={({ item }) =>
                item.kind === 'day' ? (
                  <View style={[styles.dayPill, { backgroundColor: colors.brandBlue }]}>
                    <AppText variant="caption" color={colors.onBrand}>
                      {item.label}
                    </AppText>
                  </View>
                ) : (
                  <ChannelMessageRow m={item.m} />
                )
              }
            />
          )}
        </View>
        <View style={{ paddingBottom: insets.bottom }}>
          <Composer placeholder={`Message ${channel?.name ?? name ?? ''}`.trim()} onSend={onSend} sending={send.isPending} />
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  dayPill: { alignSelf: 'center', borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 4, marginVertical: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.sm },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  preview: { borderLeftWidth: 3, borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.xs, gap: 2 },
  reactions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  reaction: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
});
