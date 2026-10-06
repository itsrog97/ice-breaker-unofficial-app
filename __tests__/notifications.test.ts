import type { AppNotification } from '@/types/api';
import { describeNotification, routeForNotification } from '@/utils/notifications';

const base: AppNotification = {
  id: 'n1',
  notification_type: 'reminder',
  metadata: {},
  sent_at: '2026-09-30T00:00:00Z',
  read_at: null,
  is_read: false,
};
const uuid = '3f2a9c1e-7b4d-4e8a-9c21-5d6e7f8a9b0c';

describe('notification helpers', () => {
  it('routes to the conversation when present', () => {
    expect(routeForNotification({ ...base, metadata: { conversation_id: uuid } })).toEqual({
      pathname: '/conversation/[id]',
      params: { id: uuid },
    });
  });
  it('parses deep links', () => {
    expect(routeForNotification({ ...base, metadata: { deep_link: `icebreaker://conversations/${uuid}` } })?.pathname).toBe('/conversation/[id]');
    expect(routeForNotification({ ...base, metadata: { deep_link: `/profiles/${uuid}` } })?.pathname).toBe('/person/[id]');
  });
  it('falls back to the sender profile, else null', () => {
    expect(routeForNotification({ ...base, metadata: { sender_id: uuid } })?.pathname).toBe('/person/[id]');
    expect(routeForNotification(base)).toBeNull();
  });
  it('describes reminders like the website', () => {
    expect(describeNotification({ ...base, metadata: { sender_name: 'Sam Lee' } })).toEqual({
      name: 'Sam Lee',
      text: ' reached out and wanted to connect.',
    });
    expect(describeNotification({ ...base, notification_type: 'other', metadata: { body: 'Hello' } }).text).toBe('Hello');
  });
});
