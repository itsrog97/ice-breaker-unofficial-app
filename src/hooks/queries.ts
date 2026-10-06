import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  channelsApi,
  discoveryApi,
  homeApi,
  messagingApi,
  notificationsApi,
  profileApi,
  settingsApi,
} from '@/api/endpoints';
import { POLL } from '@/constants/config';
import type { DiscoveryFilters, UserSettings } from '@/types/api';

/** Query keys in one place so invalidation stays consistent. */
export const qk = {
  me: ['profile', 'me'] as const,
  options: ['profile', 'options'] as const,
  schools: ['schools'] as const,
  profile: (id: string) => ['profile', id] as const,
  commonalities: (id: string) => ['profile', id, 'commonalities'] as const,
  home: ['home', 'carousels'] as const,
  discover: (f: DiscoveryFilters) => ['discover', f] as const,
  conversations: ['messaging', 'conversations'] as const,
  conversation: (id: string) => ['messaging', 'conversation', id] as const,
  messages: (id: string) => ['messaging', 'messages', id] as const,
  unreadMessages: ['messaging', 'unread'] as const,
  channelsJoined: ['channels', 'joined'] as const,
  channelsDirectory: ['channels', 'directory'] as const,
  channelMessages: (id: string) => ['channels', id, 'messages'] as const,
  notifications: ['notifications'] as const,
  unreadNotifications: ['notifications', 'unread'] as const,
  settings: ['settings'] as const,
};

export const useMe = () => useQuery({ queryKey: qk.me, queryFn: profileApi.me, staleTime: 60_000 });

export const useProfileOptions = () =>
  useQuery({ queryKey: qk.options, queryFn: profileApi.options, staleTime: 24 * 3600_000 });

export const useSchools = (enabled = true) =>
  useQuery({ queryKey: qk.schools, queryFn: profileApi.schools, staleTime: 24 * 3600_000, enabled });

export const useProfileDetail = (id: string) =>
  useQuery({ queryKey: qk.profile(id), queryFn: () => profileApi.detail(id), enabled: !!id, staleTime: 120_000 });

export const useCommonalities = (id: string) =>
  useQuery({ queryKey: qk.commonalities(id), queryFn: () => profileApi.commonalities(id), enabled: !!id, staleTime: 300_000 });

export const useHome = () => useQuery({ queryKey: qk.home, queryFn: homeApi.carousels, staleTime: 300_000 });

export const useDiscover = (filters: DiscoveryFilters) =>
  useInfiniteQuery({
    queryKey: qk.discover(filters),
    queryFn: ({ pageParam }) => discoveryApi.search(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.has_next_page ? last.page + 1 : undefined),
    staleTime: 60_000,
  });

export const useConversations = () =>
  useQuery({ queryKey: qk.conversations, queryFn: messagingApi.conversations, refetchInterval: POLL.conversations, staleTime: 10_000 });

export const useConversation = (id: string) =>
  useQuery({ queryKey: qk.conversation(id), queryFn: () => messagingApi.conversation(id), enabled: !!id });

export const useMessages = (id: string) =>
  useQuery({
    queryKey: qk.messages(id),
    queryFn: () => messagingApi.messages(id),
    enabled: !!id,
    refetchInterval: POLL.openThread,
    staleTime: 2_000,
  });

export const useUnreadMessages = () =>
  useQuery({ queryKey: qk.unreadMessages, queryFn: messagingApi.unreadCount, refetchInterval: POLL.unreadCounts, staleTime: 15_000 });

export const useJoinedChannels = () =>
  useQuery({ queryKey: qk.channelsJoined, queryFn: channelsApi.joined, refetchInterval: POLL.conversations, staleTime: 10_000 });

export const useChannelDirectory = () =>
  useQuery({ queryKey: qk.channelsDirectory, queryFn: channelsApi.directory, staleTime: 60_000 });

export const useChannelMessages = (id: string) =>
  useQuery({
    queryKey: qk.channelMessages(id),
    queryFn: () => channelsApi.messages(id),
    enabled: !!id,
    refetchInterval: POLL.openThread,
    staleTime: 2_000,
  });

export const useNotifications = () =>
  useQuery({ queryKey: qk.notifications, queryFn: notificationsApi.list, refetchInterval: POLL.notifications, staleTime: 30_000 });

export const useUnreadNotifications = () =>
  useQuery({ queryKey: qk.unreadNotifications, queryFn: notificationsApi.unreadCount, refetchInterval: POLL.unreadCounts, staleTime: 15_000 });

export const useSettings = () => useQuery({ queryKey: qk.settings, queryFn: settingsApi.get });

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<UserSettings>) => settingsApi.update(patch),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: qk.settings });
      const prev = qc.getQueryData<UserSettings>(qk.settings);
      if (prev) qc.setQueryData(qk.settings, { ...prev, ...patch });
      return { prev };
    },
    onError: (_e, _p, ctx) => ctx?.prev && qc.setQueryData(qk.settings, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.settings }),
  });
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => messagingApi.send(conversationId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.messages(conversationId) });
      qc.invalidateQueries({ queryKey: qk.conversations });
    },
  });
}

export function useSendChannelMessage(channelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => channelsApi.send(channelId, content),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.channelMessages(channelId) });
      qc.invalidateQueries({ queryKey: qk.channelsJoined });
    },
  });
}

export function useJoinChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => channelsApi.join(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.channelsJoined });
      qc.invalidateQueries({ queryKey: qk.channelsDirectory });
    },
  });
}

export function useStartConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (otherUserId: string) => messagingApi.start(otherUserId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.conversations }),
  });
}

export function useToggleSaved() {
  return useMutation({
    mutationFn: ({ id, saved }: { id: string; saved: boolean }) =>
      saved ? homeApi.unsaveProfile(id) : homeApi.saveProfile(id),
  });
}
