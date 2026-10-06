import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, RefreshControl, SectionList, StyleSheet, TextInput, View } from 'react-native';

import {
  AppText,
  Avatar,
  Button,
  CountBadge,
  EmptyView,
  ErrorView,
  LoadingView,
  Overline,
  errorMessage,
} from '@/components';
import { useChannelDirectory, useConversations, useJoinChannel, useJoinedChannels, useMe } from '@/hooks/queries';
import { fontFamily, maxContentWidth, radius, spacing, touchTarget, useTheme } from '@/theme';
import type { Channel, Conversation } from '@/types/api';
import { badgeCount, fullName, relativeTime } from '@/utils/format';
import { notify } from '@/utils/dialog';

type Row = { kind: 'channel'; channel: Channel } | { kind: 'dm'; conversation: Conversation };

function ChannelRow({ channel, onJoin, joining }: { channel: Channel; onJoin: () => void; joining: boolean }) {
  const { colors } = useTheme();
  const unread = badgeCount(channel.unread_count);
  const open = () => router.push({ pathname: '/channel/[id]', params: { id: channel.id, name: channel.name } });
  const label = (
    <>
      <AppText variant="heading" tone="tertiary">
        #
      </AppText>
      <AppText variant={unread ? 'heading' : 'bodyMedium'} style={{ flex: 1 }} numberOfLines={1}>
        {channel.name}
      </AppText>
    </>
  );
  if (!channel.is_member) {
    // Not joined: the row itself isn't tappable, only the Join button is.
    return (
      <View style={styles.channelRow} accessibilityLabel={`Channel ${channel.name}, not joined`}>
        {label}
        <Button title="Join" variant="outline" size="sm" loading={joining} onPress={onJoin} accessibilityLabel={`Join ${channel.name}`} />
      </View>
    );
  }
  return (
    <Pressable
      onPress={open}
      accessibilityRole="button"
      accessibilityLabel={`Channel ${channel.name}${unread ? `, ${unread} unread` : ''}`}
      style={({ pressed }) => [styles.channelRow, pressed && { backgroundColor: colors.surfaceSecondary }]}
    >
      {label}
      {unread ? <CountBadge text={unread} /> : null}
    </Pressable>
  );
}

function ConversationRow({ c, myId }: { c: Conversation; myId?: string }) {
  const { colors } = useTheme();
  const other = c.other_participant;
  const name = fullName(other);
  const unread = c.unread_count > 0 || c.marked_unread;
  const preview = c.last_message
    ? `${c.last_message_sender_id && c.last_message_sender_id === myId ? 'You: ' : ''}${c.last_message}`
    : 'Say hello 👋';
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/conversation/[id]', params: { id: c.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${name}${unread ? ', unread' : ''}. ${preview}`}
      style={({ pressed }) => [styles.dmRow, pressed && { backgroundColor: colors.surfaceSecondary }]}
    >
      <Avatar uri={other.photo_url} person={other} size={52} online={other.is_active} />
      <View style={{ flex: 1, gap: 2 }}>
        <View style={styles.dmTop}>
          <AppText variant={unread ? 'heading' : 'bodyMedium'} numberOfLines={1} style={{ flex: 1 }}>
            {name}
          </AppText>
          <AppText variant="caption" tone="tertiary">
            {relativeTime(c.last_message_at)}
          </AppText>
        </View>
        <View style={styles.dmTop}>
          <AppText variant="caption" tone={unread ? 'primary' : 'secondary'} numberOfLines={2} style={{ flex: 1 }}>
            {preview}
          </AppText>
          {c.unread_count > 0 ? <CountBadge text={badgeCount(c.unread_count)!} /> : unread ? <View style={[styles.dot, { backgroundColor: colors.brandBlue }]} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

export default function MessagesScreen() {
  const { colors } = useTheme();
  const me = useMe();
  const conversations = useConversations();
  const joined = useJoinedChannels();
  const directory = useChannelDirectory();
  const join = useJoinChannel();
  const [query, setQuery] = useState('');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const channels: Channel[] = useMemo(() => {
    const mine = joined.data ?? [];
    const ids = new Set(mine.map((c) => c.id));
    const others = (directory.data ?? []).filter((c) => !ids.has(c.id));
    return [...mine, ...others];
  }, [joined.data, directory.data]);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const ch = channels.filter((c) => !q || c.name.toLowerCase().includes(q));
    const dms = (conversations.data?.conversations ?? []).filter(
      (c) => !q || fullName(c.other_participant).toLowerCase().includes(q) || (c.last_message ?? '').toLowerCase().includes(q),
    );
    const out: { key: string; title: string; data: Row[] }[] = [];
    if (ch.length) out.push({ key: 'channels', title: 'Channels', data: ch.map((channel) => ({ kind: 'channel', channel })) });
    out.push({ key: 'dms', title: 'Direct Messages', data: dms.map((conversation) => ({ kind: 'dm', conversation })) });
    return out;
  }, [channels, conversations.data, query]);

  const onJoin = async (c: Channel) => {
    setJoiningId(c.id);
    try {
      await join.mutateAsync(c.id);
    } catch (e) {
      notify("Couldn't join channel", errorMessage(e));
    } finally {
      setJoiningId(null);
    }
  };

  if (conversations.isPending) return <LoadingView />;
  if (conversations.isError) return <ErrorView error={conversations.error} onRetry={() => conversations.refetch()} />;

  const refreshing = conversations.isRefetching || joined.isRefetching;

  return (
    <SectionList
      sections={sections}
      keyExtractor={(r) => (r.kind === 'channel' ? `c-${r.channel.id}` : `d-${r.conversation.id}`)}
      style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' }}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      stickySectionHeadersEnabled={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            conversations.refetch();
            joined.refetch();
            directory.refetch();
          }}
        />
      }
      ListHeaderComponent={
        <View style={[styles.search, { borderColor: colors.borderPrimary, backgroundColor: colors.surfaceSecondary }]}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search conversations"
            placeholderTextColor={colors.textTertiary}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            accessibilityLabel="Search conversations"
          />
        </View>
      }
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Overline>{section.title}</Overline>
        </View>
      )}
      renderSectionFooter={({ section }) =>
        section.key === 'dms' && section.data.length === 0 ? (
          <EmptyView
            icon="chatbubbles-outline"
            title={query ? 'No matches' : 'No conversations yet'}
            message={query ? 'Try a different name.' : 'Find someone on Discover and tap “Burn the Wall”.'}
          />
        ) : null
      }
      renderItem={({ item }) =>
        item.kind === 'channel' ? (
          <ChannelRow channel={item.channel} joining={joiningId === item.channel.id} onJoin={() => onJoin(item.channel)} />
        ) : (
          <ConversationRow c={item.conversation} myId={me.data?.id} />
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 46,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 16, fontFamily: fontFamily.regular, paddingVertical: spacing.sm },
  sectionHeader: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xs },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: touchTarget,
  },
  dmRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  dmTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
