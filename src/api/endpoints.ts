import { api, request } from './client';
import type {
  AppNotification,
  AuthResponse,
  Channel,
  ChannelMessage,
  ChannelMessagesResponse,
  Commonalities,
  Conversation,
  ConversationsResponse,
  DirectMessage,
  DiscoveryFilters,
  FacetedSearchResponse,
  HomeCarouselsResponse,
  MessagesResponse,
  MyProfile,
  ProfileDetail,
  ProfileOptions,
  School,
  UnreadCount,
  UserSettings,
} from '@/types/api';

const V1 = '/api/v1';

export const authApi = {
  signIn: (email: string, password: string) =>
    request<AuthResponse>(`${V1}/auth/signin`, { method: 'POST', body: { email, password }, noAuthRetry: true }),
  signOut: () => request<unknown>(`${V1}/auth/signout`, { method: 'POST', body: {}, noAuthRetry: true }),
  forgotPassword: (email: string) =>
    request<unknown>(`${V1}/auth/forgot-password`, { method: 'POST', body: { email }, noAuthRetry: true }),
  changePassword: (current_password: string, new_password: string) =>
    api.post<unknown>(`${V1}/auth/change-password`, { current_password, new_password }),
  me: () => api.get<{ user_id: string; email: string }>(`${V1}/auth/me`),
};

export const profileApi = {
  me: () => api.get<MyProfile>(`${V1}/profile`),
  options: () => api.get<ProfileOptions>(`${V1}/profile/options`),
  detail: (id: string) => api.get<ProfileDetail>(`${V1}/discovery/profiles/${encodeURIComponent(id)}`),
  commonalities: (id: string) => api.get<Commonalities>(`${V1}/profiles/${encodeURIComponent(id)}/commonalities`),
  schools: () => api.get<School[]>(`${V1}/schools`),
};

export function filtersToParams(filters: DiscoveryFilters, page: number, limit = 50): string {
  const p = new URLSearchParams();
  if (filters.q?.trim()) p.set('q', filters.q.trim());
  const lists: [keyof DiscoveryFilters, string][] = [
    ['industries', 'industries'],
    ['passionate_about', 'passionate_about'],
    ['what_brings_you', 'what_brings_you'],
    ['help_others', 'help_others'],
    ['schools', 'schools'],
    ['companies', 'companies'],
  ];
  for (const [key, param] of lists) {
    const v = filters[key] as unknown[] | undefined;
    if (v && v.length) p.set(param, v.join(','));
  }
  if (filters.sort_by) p.set('sort_by', filters.sort_by);
  p.set('page', String(page));
  p.set('limit', String(limit));
  return p.toString();
}

export const discoveryApi = {
  search: (filters: DiscoveryFilters, page: number) =>
    api.get<FacetedSearchResponse>(`${V1}/discovery/search/faceted?${filtersToParams(filters, page)}`),
};

export const homeApi = {
  carousels: () => api.get<HomeCarouselsResponse>(`${V1}/home/carousels`, { timeoutMs: 30_000 }),
  saveProfile: (profileId: string) => api.post<unknown>(`${V1}/home/saved-profiles`, { profile_id: profileId }),
  unsaveProfile: (profileId: string) => api.delete<unknown>(`${V1}/home/saved-profiles/${encodeURIComponent(profileId)}`),
  savedProfiles: () => api.get<{ profiles: unknown[]; total_count: number }>(`${V1}/home/saved-profiles`),
};

export const messagingApi = {
  conversations: () => api.get<ConversationsResponse>(`${V1}/messaging/conversations?limit=200`),
  conversation: (id: string) => api.get<Conversation>(`${V1}/messaging/conversations/${encodeURIComponent(id)}`),
  messages: (id: string) =>
    api.get<MessagesResponse>(`${V1}/messaging/conversations/${encodeURIComponent(id)}/messages?limit=100`),
  send: (id: string, content: string) =>
    api.post<DirectMessage>(`${V1}/messaging/conversations/${encodeURIComponent(id)}/messages`, {
      content,
      message_type: 'text',
    }),
  markRead: (id: string) => api.put<unknown>(`${V1}/messaging/conversations/${encodeURIComponent(id)}/read`),
  /** Returns the existing conversation with that user or creates one. */
  start: (otherUserId: string) =>
    api.post<Conversation>(`${V1}/messaging/conversations`, { other_user_id: otherUserId }),
  unreadCount: () => api.get<UnreadCount>(`${V1}/messaging/unread-count`),
};

export const channelsApi = {
  directory: () => api.get<{ channels: Channel[] }>(`${V1}/channels`).then((r) => r.channels),
  joined: () => api.get<{ channels: Channel[] }>(`${V1}/channels/joined`).then((r) => r.channels),
  join: (id: string) => api.post<unknown>(`${V1}/channels/${encodeURIComponent(id)}/join`, {}),
  messages: (id: string) =>
    api.get<ChannelMessagesResponse>(`${V1}/channels/${encodeURIComponent(id)}/messages?limit=50`),
  send: (id: string, content: string) =>
    api.post<ChannelMessage>(`${V1}/channels/${encodeURIComponent(id)}/messages`, { content }),
  markRead: (id: string) => api.put<unknown>(`${V1}/channels/${encodeURIComponent(id)}/read`, {}),
};

export const notificationsApi = {
  list: () => api.get<AppNotification[]>(`${V1}/notifications`),
  unreadCount: () => api.get<{ count: number }>(`${V1}/notifications/unread-count`),
  markRead: (id: string) => api.post<unknown>(`${V1}/notifications/${encodeURIComponent(id)}/mark-read`),
  markAllRead: () => api.post<unknown>(`${V1}/notifications/mark-all-read`),
};

export const settingsApi = {
  get: () => api.get<{ settings: UserSettings }>(`${V1}/user-settings`).then((r) => r.settings),
  update: (patch: Partial<UserSettings>) => api.patch<{ settings: UserSettings }>(`${V1}/user-settings`, patch),
};

export const agentApi = {
  chatPath: `${V1}/agent/chat`,
  latestSession: () =>
    api.get<{
      session_id: string | null;
      interactions: { id: string; type: string; details: { role?: string; content?: string }; created_at: string }[];
    }>(`${V1}/agent/interactions?scope=latest_session`),
};
