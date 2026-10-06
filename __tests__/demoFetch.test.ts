import { demoFetch } from '@/demo/demoFetch';

const post = (path: string, body: unknown) => demoFetch(path, { method: 'POST', body: JSON.stringify(body) });

describe('demo backend', () => {
  it('signs in with any non-empty credentials and rejects empty ones', async () => {
    expect((await post('/api/v1/auth/signin', { email: 'a@b.co', password: 'x' })).status).toBe(200);
    expect((await post('/api/v1/auth/signin', { email: '', password: '' })).status).toBe(401);
  });

  it('serves the home feed with fictional people', async () => {
    const home = await (await demoFetch('/api/v1/home/carousels')).json();
    expect(home.featured_profile.first_name).toBe('Priya');
    expect(home.carousels.length).toBeGreaterThan(2);
  });

  it('filters discovery by search text', async () => {
    const res = await (await demoFetch('/api/v1/discovery/search/faceted?q=founder&page=1&limit=50')).json();
    expect(res.profiles.map((p: { first_name: string }) => p.first_name)).toEqual(['Arjun']);
  });

  it('persists sent messages and updates the conversation preview', async () => {
    await post('/api/v1/messaging/conversations/cv-1/messages', { content: 'Hello from the demo', message_type: 'text' });
    const msgs = await (await demoFetch('/api/v1/messaging/conversations/cv-1/messages?limit=100')).json();
    expect(msgs.messages.at(-1).content).toBe('Hello from the demo');
    const convos = await (await demoFetch('/api/v1/messaging/conversations?limit=200')).json();
    expect(convos.conversations[0].last_message).toBe('Hello from the demo');
  });

  it('joins a channel', async () => {
    await post('/api/v1/channels/ch-4/join', {});
    const joined = await (await demoFetch('/api/v1/channels/joined')).json();
    expect(joined.channels.some((c: { id: string }) => c.id === 'ch-4')).toBe(true);
  });

  it('marks notifications read', async () => {
    await post('/api/v1/notifications/mark-all-read', {});
    expect(await (await demoFetch('/api/v1/notifications/unread-count')).json()).toEqual({ count: 0 });
  });
});
