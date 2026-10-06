/**
 * In-memory fake backend for the public web demo (EXPO_PUBLIC_DEMO_MODE=1).
 * Answers the same requests the real client makes, using fictional data, so the
 * whole app can be explored in a browser without an account or network access.
 * State (sent messages, joined channels, read flags) lives for the browser session.
 */
import {
  HOME,
  ME,
  MY_PROFILE,
  OPTIONS,
  PEOPLE,
  SCHOOLS,
  SPARK_GREETING,
  cmsg,
  commonalities,
  detail,
  dm,
  initialChannelMessages,
  initialChannels,
  initialConversations,
  initialMessages,
  initialNotifications,
} from './data';

const state = {
  conversations: initialConversations(),
  messages: initialMessages(),
  channels: initialChannels(),
  channelMessages: {} as Record<string, ReturnType<typeof initialChannelMessages>>,
  notifications: initialNotifications(),
  saved: new Set<string>(),
  theme: 'system' as string,
  emailNotifications: true,
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function sseStream(events: [string, unknown][]): Response {
  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const [event, data] of events) {
        controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        await delay(event === 'text' ? 35 : 250);
      }
      controller.close();
    },
  });
  return new Response(stream, { status: 200, headers: { 'Content-Type': 'text/event-stream' } });
}

const words = (s: string): [string, unknown][] => s.split(/(?<= )/).map((w) => ['text', { delta: w }]);

const findPerson = (id: string) => PEOPLE.find((p) => p.id === id) ?? PEOPLE[0];

function sparkReply(messages: { role: string; content: string }[]): [string, unknown][] {
  const last = messages[messages.length - 1]?.content.toLowerCase() ?? '';
  if (!messages.length) {
    return [
      ['ready', { session_id: 'demo' }],
      ...words(SPARK_GREETING),
      ['suggestions', { chips: [
        { id: 'find', label: 'Find relevant people', send_text: 'Find me relevant people' },
        { id: 'opener', label: 'Draft an opener', send_text: 'Draft an opener to Priya' },
        { id: 'prep', label: 'Prep for a coffee chat', send_text: 'Help me prep for a coffee chat' },
      ] }],
      ['done', { session_id: 'demo' }],
    ];
  }
  if (last.includes('opener') || last.includes('draft')) {
    return [
      ['ready', { session_id: 'demo' }],
      ['tool_call', { name: 'draft_icebreaker' }],
      ...words('Here’s an opener for Priya that leans on what you share:'),
      ['icebreaker', { profile: { profile_id: 'p-0', first_name: 'Priya', last_name: 'Nair', current_title: 'Product Manager', current_company: 'Lumen Health', photo_url: PEOPLE[0].photo_url }, message: 'Hi Priya! Fellow NBS person here — I’m moving from consulting into product and saw you made the same jump. Would you be up for a 20-minute chat about what helped most in your PM interviews?' }],
      ['suggestions', { chips: [{ id: 'more', label: 'Find more people', send_text: 'Find me relevant people' }] }],
      ['done', { session_id: 'demo' }],
    ];
  }
  if (last.includes('prep') || last.includes('coffee')) {
    return [
      ['ready', { session_id: 'demo' }],
      ...words('Great idea. For a 20-minute coffee chat: 1) open with your shared context (NBS, consulting → product), 2) ask how they decided to switch and what surprised them, 3) ask what they’d do differently in interviews, 4) close by asking who else you should talk to. Keep your own story to 60 seconds.'),
      ['suggestions', { chips: [{ id: 'opener', label: 'Draft an opener', send_text: 'Draft an opener to Priya' }] }],
      ['done', { session_id: 'demo' }],
    ];
  }
  return [
    ['ready', { session_id: 'demo' }],
    ['tool_call', { name: 'search_network' }],
    ...words('Here are two people worth meeting this week, based on your move toward product:'),
    ['profile_card', { profile: { profile_id: 'p-0', first_name: 'Priya', last_name: 'Nair', current_title: 'Product Manager', current_company: 'Lumen Health', photo_url: PEOPLE[0].photo_url }, why: 'Switched from consulting to PM two years ago and is also from NBS.' }],
    ['profile_card', { profile: { profile_id: 'p-10', first_name: 'Grace', last_name: 'Liu', current_title: 'Product Analyst', current_company: 'Pennywise', photo_url: PEOPLE[10].photo_url }, why: 'Runs PM interview mock sessions in the Product channel.' }],
    ['suggestions', { chips: [
      { id: 'draft', label: 'Draft an opener to Priya', send_text: 'Draft an opener to Priya' },
      { id: 'prep', label: 'Prep for a coffee chat', send_text: 'Help me prep for a coffee chat' },
    ] }],
    ['done', { session_id: 'demo' }],
  ];
}

export async function demoFetch(path: string, init: RequestInit = {}): Promise<Response> {
  await delay(250); // feel like a network
  const url = new URL(path, 'https://demo.local');
  const p = url.pathname.replace('/api/v1', '');
  const method = (init.method ?? 'GET').toUpperCase();
  const body = typeof init.body === 'string' && init.body ? JSON.parse(init.body) : {};
  let m: RegExpMatchArray | null;

  // ---- auth
  if (p === '/auth/signin') {
    if (!body.email || !body.password) return json({ detail: 'Invalid email or password' }, 401);
    return json({ user: { id: ME, email: body.email, full_name: 'Alex Morgan', is_email_verified: true, created_at: new Date().toISOString() }, access_token: 'demo-access', refresh_token: 'demo-refresh', needs_email_verification: false, message: null });
  }
  if (p === '/auth/refresh') return json({ access_token: 'demo-access', refresh_token: 'demo-refresh' });
  if (p === '/auth/me') return json({ user_id: ME, email: 'alex.morgan@example.com' });
  if (p.startsWith('/auth/')) return json({});

  // ---- profile & options
  if (p === '/profile') return json(MY_PROFILE);
  if (p === '/profile/options') return json(OPTIONS);
  if (p === '/schools') return json(SCHOOLS);
  if ((m = p.match(/^\/discovery\/profiles\/([^/]+)$/))) return json(detail(findPerson(m[1].replace(/b$/, ''))));
  if ((m = p.match(/^\/profiles\/([^/]+)\/commonalities$/))) return json(commonalities(findPerson(m[1].replace(/b$/, ''))));

  // ---- settings
  if (p === '/user-settings') {
    if (method === 'PATCH') {
      if (typeof body.theme_preference === 'string') state.theme = body.theme_preference;
      if (typeof body.email_notifications === 'boolean') state.emailNotifications = body.email_notifications;
    }
    return json({ settings: { push_notifications: true, email_notifications: state.emailNotifications, discovery_enabled: true, show_graduation_year: true, privacy_level: 'public', theme_preference: state.theme } });
  }

  // ---- home & saved
  if (p === '/home/carousels') return json(HOME);
  if (p === '/home/saved-profiles') {
    if (method === 'POST') state.saved.add(body.profile_id);
    return json({ profiles: [...state.saved].map((id) => ({ id })), total_count: state.saved.size });
  }
  if ((m = p.match(/^\/home\/saved-profiles\/(.+)$/))) {
    state.saved.delete(m[1]);
    return json({});
  }

  // ---- discover
  if (p === '/discovery/search/faceted') {
    const q = (url.searchParams.get('q') ?? '').toLowerCase();
    const industries = url.searchParams.get('industries')?.split(',') ?? [];
    let list = PEOPLE.filter((x) => !q || `${x.first_name} ${x.last_name} ${x.current_company} ${x.current_title}`.toLowerCase().includes(q));
    if (industries.length) list = list.filter((x) => industries.includes(x.current_industry ?? ''));
    if (url.searchParams.get('sort_by') === 'recent') list = [...list].reverse();
    const filtered = !!q || industries.length > 0;
    const all = filtered ? list : [...list, ...list.map((x) => ({ ...x, id: x.id + 'b' }))];
    return json({ profiles: all, total_count: all.length, page: 1, limit: 50, has_next_page: false, has_previous_page: false, total_pages: 1, search_id: 'demo' });
  }

  // ---- direct messages
  if (p === '/messaging/conversations' && method === 'GET') {
    const sorted = [...state.conversations].sort((a, b) => (b.last_message_at ?? '').localeCompare(a.last_message_at ?? ''));
    return json({ conversations: sorted, total: sorted.length, limit: 200, offset: 0, has_more: false });
  }
  if (p === '/messaging/conversations' && method === 'POST') {
    const other = findPerson(String(body.other_user_id).replace(/b$/, ''));
    let c = state.conversations.find((x) => x.other_participant.id === other.id);
    if (!c) {
      c = { id: `cv-${other.id}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), last_message: null, last_message_at: null, last_message_sender_id: null, other_participant: other, unread_count: 0, marked_unread: false };
      state.conversations.push(c);
      state.messages[c.id] = [];
    }
    return json(c);
  }
  if (p === '/messaging/unread-count') {
    const n = state.conversations.reduce((s, c) => s + c.unread_count, 0);
    return json({ unread_count: n, conversations_with_unread: state.conversations.filter((c) => c.unread_count > 0).length });
  }
  if ((m = p.match(/^\/messaging\/conversations\/([^/]+)\/read$/))) {
    const c = state.conversations.find((x) => x.id === m![1]);
    if (c) c.unread_count = 0;
    return json({});
  }
  if ((m = p.match(/^\/messaging\/conversations\/([^/]+)\/messages$/))) {
    const id = m[1];
    const list = (state.messages[id] ??= []);
    if (method === 'POST') {
      const msg = dm(id, ME, String(body.content ?? ''), 0);
      list.push(msg);
      const c = state.conversations.find((x) => x.id === id);
      if (c) {
        c.last_message = msg.content;
        c.last_message_at = msg.created_at;
        c.last_message_sender_id = ME;
      }
      return json(msg);
    }
    return json({ messages: list, total: list.length, has_more: false });
  }
  if ((m = p.match(/^\/messaging\/conversations\/([^/]+)$/))) {
    return json(state.conversations.find((x) => x.id === m![1]) ?? state.conversations[0]);
  }

  // ---- channels
  if (p === '/channels') return json({ channels: state.channels });
  if (p === '/channels/joined') return json({ channels: state.channels.filter((c) => c.is_member) });
  if ((m = p.match(/^\/channels\/([^/]+)\/join$/))) {
    const c = state.channels.find((x) => x.id === m![1]);
    if (c) {
      c.is_member = true;
      c.member_count += 1;
      c.unread_count = 0;
    }
    return json({});
  }
  if ((m = p.match(/^\/channels\/([^/]+)\/read$/))) {
    const c = state.channels.find((x) => x.id === m![1]);
    if (c) c.unread_count = 0;
    return json({});
  }
  if ((m = p.match(/^\/channels\/([^/]+)\/messages$/))) {
    const id = m[1];
    const list = (state.channelMessages[id] ??= initialChannelMessages(id));
    if (method === 'POST') {
      const msg = cmsg(id, { id: ME, first_name: 'Alex', last_name: 'Morgan', photo_url: MY_PROFILE.photo_url }, String(body.content ?? ''), 0);
      list.push(msg);
      return json(msg);
    }
    return json({ messages: list, has_more: false, joins: [] });
  }

  // ---- notifications
  if (p === '/notifications') return json(state.notifications);
  if (p === '/notifications/unread-count') return json({ count: state.notifications.filter((n) => !n.is_read).length });
  if (p === '/notifications/mark-all-read') {
    state.notifications.forEach((n) => (n.is_read = true));
    return json({});
  }
  if ((m = p.match(/^\/notifications\/([^/]+)\/mark-read$/))) {
    const n = state.notifications.find((x) => x.id === m![1]);
    if (n) n.is_read = true;
    return json({});
  }

  // ---- Spark
  if (p === '/agent/interactions') return json({ session_id: null, interactions: [] });
  if (p === '/agent/chat') return sseStream(sparkReply(body.messages ?? []));

  return json({});
}
