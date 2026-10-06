import type { AppNotification } from '@/types/api';

export type AppRoute =
  | { pathname: '/conversation/[id]'; params: { id: string } }
  | { pathname: '/person/[id]'; params: { id: string } };

/** Maps a notification to an in-app route, mirroring its web deep link where possible. */
export function routeForNotification(n: AppNotification): AppRoute | null {
  const m = n.metadata ?? {};
  if (m.conversation_id) return { pathname: '/conversation/[id]', params: { id: m.conversation_id } };
  const link = m.deep_link ?? '';
  const convo = link.match(/conversations?[=/]([0-9a-f-]{36})/i);
  if (convo) return { pathname: '/conversation/[id]', params: { id: convo[1] } };
  const profile = link.match(/profiles?[=/]([0-9a-f-]{36})/i);
  if (profile) return { pathname: '/person/[id]', params: { id: profile[1] } };
  if (m.sender_id) return { pathname: '/person/[id]', params: { id: m.sender_id } };
  return null;
}

/** Splits a notification into a bold actor name and the remaining sentence. */
export function describeNotification(n: AppNotification): { name?: string; text: string } {
  const m = n.metadata ?? {};
  if (n.notification_type === 'reminder' && m.sender_name) {
    return { name: m.sender_name, text: ' reached out and wanted to connect.' };
  }
  if (m.title && m.body) return { name: m.title, text: ` ${m.body}` };
  return { text: m.body || m.title || 'New activity' };
}
