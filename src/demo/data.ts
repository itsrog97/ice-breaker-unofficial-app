/**
 * Fictional demo data used when the app is built with EXPO_PUBLIC_DEMO_MODE=1
 * (the public web demo). No real people, schools or messages.
 */
import type {
  AppNotification,
  Channel,
  ChannelMessage,
  Commonalities,
  Conversation,
  DirectMessage,
  HomeCarouselsResponse,
  MyProfile,
  ProfileDetail,
  ProfileOptions,
  ProfileSummary,
} from '@/types/api';

export const ME = 'demo-me';

const HUES = [205, 160, 25, 280, 340, 45, 120, 190, 0, 230, 300, 90];
export function avatar(i: number): string {
  const h = HUES[i % HUES.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="hsl(${h},55%,82%)"/><circle cx="50" cy="40" r="17" fill="hsl(${h},35%,45%)"/><path d="M18 100c2-22 16-34 32-34s30 12 32 34z" fill="hsl(${h},35%,45%)"/></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const opt = (labels: string[]) =>
  labels.map((label) => ({ value: label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''), label }));

export const OPTIONS: ProfileOptions = {
  networking_goals: opt(['Building my network', 'Finding a cofounder', 'Looking for new role']),
  mba_focus_areas: opt(['Finance', 'Marketing', 'Strategy', 'Operations']),
  industries: [
    'Banking & Financial Services', 'Consulting', 'Consumer Goods', 'Fintech', 'Healthcare',
    'Logistics', 'Media & Marketing', 'Technology & Software', 'Venture Capital', 'AI / Machine Learning',
  ].map((l) => ({ value: l, label: l })),
  areas_of_expertise: opt(['Analytics', 'Brand Marketing', 'Product Strategy', 'Fundraising']),
  hobbies: opt(['Travel', 'Running', 'Photography', 'Cooking', 'Music']),
  what_brings_you_options: opt(['Finding a new role', 'Want mentorship', 'Exploring career paths', 'Building my network', 'Fundraising']),
  excited_city_options: opt(['Bangalore', 'Singapore', 'London', 'New York', 'Dubai']),
  passionate_about_options: opt(['Consulting', 'Product Management', 'Data Analytics', 'Venture Capital', 'Marketing / Growth']),
  help_others_options: opt(['Recruiting interviews', 'My industry', 'Resume feedback', 'My career path', 'Coffee chats']),
  affinity_tag_options: opt(['Career changer', 'International student', 'Former founder']),
};

const RAW: [string, string, string, string, number, string, string, string][] = [
  ['Priya', 'Nair', 'NBS', 'Northbridge Business School', 2025, 'Product Manager', 'Lumen Health', 'Healthcare'],
  ['Daniel', 'Okafor', 'WCB', 'Westcliff Business School', 2026, 'Associate', 'Harbor Capital', 'Banking & Financial Services'],
  ['Mei', 'Tanaka', 'RSM', 'Riverside School of Management', 2024, 'Strategy Consultant', 'Atlas Advisory', 'Consulting'],
  ['Arjun', 'Mehta', 'NBS', 'Northbridge Business School', 2027, 'Founder', 'Stackwise', 'Technology & Software'],
  ['Sofia', 'Rossi', 'ESL', 'European School of Leadership', 2025, 'Brand Manager', 'Verde Foods', 'Consumer Goods'],
  ['Kwame', 'Mensah', 'WCB', 'Westcliff Business School', 2023, 'Data Scientist', 'Brightline AI', 'AI / Machine Learning'],
  ['Hannah', 'Becker', 'CIM', 'Central Institute of Management', 2026, 'Operations Lead', 'Shiplane', 'Logistics'],
  ['Rahul', 'Iyer', 'RSM', 'Riverside School of Management', 2025, 'Investment Analyst', 'Northgate Partners', 'Venture Capital'],
  ['Lena', 'Fischer', 'ESL', 'European School of Leadership', 2024, 'Growth Marketer', 'Kite Apps', 'Media & Marketing'],
  ['Omar', 'Haddad', 'CIM', 'Central Institute of Management', 2027, 'Engineer', 'Orbit Labs', 'Technology & Software'],
  ['Grace', 'Liu', 'NBS', 'Northbridge Business School', 2026, 'Product Analyst', 'Pennywise', 'Fintech'],
  ['Mateo', 'García', 'WCB', 'Westcliff Business School', 2025, 'Consultant', 'Meridian Group', 'Consulting'],
];

const QUOTES = [
  'I have run a marathon on every continent except Antarctica.',
  'I learned to cook from my grandmother’s handwritten recipe book.',
  'I once interned at a zoo feeding penguins.',
  'I built my first app at 14 to track cricket scores.',
  'I can solve a Rubik’s cube in under a minute.',
  'I play the tabla in a weekend jazz band.',
];

export const SCHOOLS = [
  'Northbridge Business School', 'Westcliff Business School', 'Riverside School of Management',
  'European School of Leadership', 'Central Institute of Management',
].map((name, i) => ({ id: 100 + i, name, alias: null }));

export const PEOPLE: ProfileSummary[] = RAW.map(([first, last, alias, school, year, title, company, industry], i) => ({
  id: `p-${i}`,
  first_name: first,
  last_name: last,
  photo_url: avatar(i),
  city: ['New Delhi, DL', 'Mumbai, MH', 'Bengaluru, KA', 'London', 'Singapore'][i % 5],
  mba_school_name: `${school} (${alias})`,
  mba_school_alias: alias,
  mba_school_id: 100 + SCHOOLS.findIndex((s) => s.name === school),
  mba_grad_year: year,
  current_company: company,
  current_title: title,
  current_industry: industry,
  my_icebreaker: QUOTES[i % QUOTES.length],
  hobbies: ['Travel', 'Running', 'Photography'],
  is_verified: true,
  is_connected: false,
  has_messaged: i < 3,
  is_new: i % 3 === 0,
  is_active: i % 2 === 0,
}));

export const MY_PROFILE: MyProfile = {
  id: ME,
  photo_url: avatar(11),
  first_name: 'Alex',
  last_name: 'Morgan',
  city: 'New Delhi, DL',
  city_display_name: 'New Delhi, DL',
  hometown_display_name: 'Pune, MH',
  mba_school_id: 100,
  mba_grad_year: 2027,
  current_company: 'Northwind Consulting',
  current_title: 'Consultant',
  current_industry: 'Consulting',
  my_icebreaker: 'I’ve visited 18 countries and still can’t pack light.',
  hobbies: ['travel', 'photography', 'cooking'],
  my_projects: null,
  project_brief: null,
  linkedin_url: null,
  what_brings_you: ['finding_a_new_role', 'want_mentorship', 'exploring_career_paths'],
  excited_cities: ['bangalore', 'singapore', 'london'],
  passionate_about: ['consulting', 'product_management', 'data_analytics'],
  help_others: ['recruiting_interviews', 'my_industry', 'resume_feedback'],
  affinity_tags: ['career_changer'],
  experiences: [
    { id: 'e1', is_current: true, company: 'Northwind Consulting', title: 'Consultant', start_year: 2022, end_year: 'Present', display_order: 0 },
    { id: 'e2', is_current: false, company: 'Bluebird Retail', title: 'Business Analyst', start_year: 2019, end_year: '2022', display_order: 1 },
  ],
  school_info: { id: 100, name: 'Northbridge Business School', alias: 'NBS' },
  is_profile_complete: true,
  is_verified: true,
  agent_beta_enabled: true,
  channels_enabled: true,
};

const card = (p: ProfileSummary, extra: Record<string, unknown> = {}) => ({
  profile_id: p.id,
  first_name: p.first_name,
  last_name: p.last_name,
  photo_url: p.photo_url,
  school_alias: p.mba_school_alias,
  school_name: p.mba_school_name,
  mba_grad_year: p.mba_grad_year,
  current_title: p.current_title,
  current_company: p.current_company,
  city: p.city,
  my_icebreaker: p.my_icebreaker,
  is_new: p.is_new,
  is_active: p.is_active,
  is_saved: false,
  ...extra,
});

export const HOME: HomeCarouselsResponse = {
  featured_profile: { ...card(PEOPLE[0]), shared_context: ['NBS', 'Product'], match_id: 'm1' },
  generated_at: new Date().toISOString(),
  carousels: [
    {
      id: 'c-proj', carousel_type: 'projects_carousel', primary_card_type: 'project', title: 'What people are building',
      subtitle: 'Explore new projects and share your own.', has_more: false,
      cards: ([
        ['Building a telehealth app for rural clinics', 'healthcare'],
        ['Looking for a co-founder for a climate fintech idea', 'technology'],
        ['Starting a podcast on careers in sports business', 'media'],
      ] as const).map(([brief, cat], i) => ({ id: `pc${i}`, card_type: 'project', position: i, data: card(PEOPLE[i + 3], { project_brief: brief, project_category: cat }) })),
    },
    {
      id: 'c-ice', carousel_type: 'notable_icebreakers_carousel', primary_card_type: 'notable_icebreaker', title: 'Ask me about this',
      subtitle: 'Tap one and we’ll help you start the conversation.', has_more: false,
      cards: [4, 5, 6].map((n, i) => ({ id: `ic${i}`, card_type: 'notable_icebreaker', position: i, data: card(PEOPLE[n], { icebreaker_brief: PEOPLE[n].my_icebreaker }) })),
    },
    { id: 'c-near', carousel_type: 'people_near_you', primary_card_type: 'profile', title: 'People in New Delhi', subtitle: null, has_more: true, cards: PEOPLE.slice(1, 9).map((p, i) => ({ id: `n${i}`, card_type: 'profile', position: i, data: card(p) })) },
    { id: 'c-mentor', carousel_type: 'bidirectional_mentorship', primary_card_type: 'profile', title: 'People willing to mentor', subtitle: null, has_more: true, cards: PEOPLE.slice(4, 12).map((p, i) => ({ id: `m${i}`, card_type: 'profile', position: i, data: card(p) })) },
    { id: 'c-school', carousel_type: 'school_near_you', primary_card_type: 'profile', title: 'People from NBS', subtitle: null, has_more: false, cards: PEOPLE.filter((p) => p.mba_school_alias === 'NBS').map((p, i) => ({ id: `s${i}`, card_type: 'profile', position: i, data: card(p) })) },
  ],
};

export function detail(p: ProfileSummary): ProfileDetail {
  return {
    ...p,
    hometown: null,
    undergrad_school: 'Delhi College of Commerce',
    experiences: [{ id: `x-${p.id}`, is_current: true, company: p.current_company ?? '', title: p.current_title ?? '', start_year: 2023, end_year: 'Present', display_order: 0 }],
    my_projects: null,
    linkedin_url: null,
    what_brings_you: ['building_my_network', 'want_mentorship', 'finding_a_new_role'],
    excited_cities: ['singapore', 'london'],
    passionate_about: ['product_management', 'consulting'],
    help_others: ['my_career_path', 'recruiting_interviews'],
    affinity_tags: ['career_changer'],
    can_message: true,
  };
}

export function commonalities(p: ProfileSummary): Commonalities {
  return {
    commonalities: [
      { category: 'school', label: 'School', items: [p.mba_school_alias === 'NBS' ? 'Northbridge Business School' : 'MBA community'] },
      { category: 'passion', label: 'Passions', items: ['Product Management', 'Consulting'] },
      { category: 'excited_city', label: 'Excited Cities', items: ['Singapore'] },
    ],
    reasons_to_connect: [
      { type: 'complementary', text: `Get their take on moving into ${p.current_industry}` },
      { type: 'shared', text: 'Compare notes on product strategy interviews' },
      { type: 'shared', text: 'Swap ideas on working in Singapore' },
      { type: 'help', text: 'Share your consulting experience with them' },
      { type: 'help', text: 'Talk about life after the MBA' },
    ],
  };
}

const ago = (mins: number) => new Date(Date.now() - mins * 60000).toISOString();

function convo(p: ProfileSummary, i: number, last: string, mins: number, unread: number, fromMe: boolean): Conversation {
  return {
    id: `cv-${i}`,
    created_at: ago(mins + 600),
    updated_at: ago(mins),
    last_message: last,
    last_message_at: ago(mins),
    last_message_sender_id: fromMe ? ME : p.id,
    other_participant: p,
    unread_count: unread,
    marked_unread: false,
  };
}

export function initialConversations(): Conversation[] {
  return [
    convo(PEOPLE[0], 0, 'Would love to hear how you prepared for PM interviews!', 12, 2, false),
    convo(PEOPLE[1], 1, 'Thanks Alex — happy to intro you to the team.', 180, 0, false),
    convo(PEOPLE[2], 2, 'Sounds great, let’s chat Friday.', 1500, 0, true),
    convo(PEOPLE[7], 3, 'Do you have time for a quick coffee chat next week?', 4300, 0, false),
  ];
}

export function dm(conversationId: string, sender: string, content: string, mins: number, id = `d-${Math.random().toString(36).slice(2)}`): DirectMessage {
  return {
    id, conversation_id: conversationId, sender_id: sender, content, created_at: ago(mins),
    is_read: true, message_type: 'text', deleted_at: null, edited_at: null, reactions: null,
  };
}

export function initialMessages(): Record<string, DirectMessage[]> {
  return {
    'cv-0': [
      dm('cv-0', 'p-0', 'Hi Alex! I saw we’re both from NBS and interested in product. 👋', 1560),
      dm('cv-0', ME, 'Hey Priya, great to connect! I’m exploring a move from consulting into PM.', 1500),
      dm('cv-0', 'p-0', 'I made the same switch two years ago — happy to share what worked.', 30),
      dm('cv-0', 'p-0', 'Would love to hear how you prepared for PM interviews!', 12),
    ],
    'cv-1': [
      dm('cv-1', ME, 'Hi Daniel, I’d love to learn more about Harbor Capital.', 300),
      dm('cv-1', 'p-1', 'Thanks Alex — happy to intro you to the team.', 180),
    ],
    'cv-2': [dm('cv-2', 'p-2', 'Want to compare notes on case prep?', 1600), dm('cv-2', ME, 'Sounds great, let’s chat Friday.', 1500)],
    'cv-3': [dm('cv-3', 'p-7', 'Do you have time for a quick coffee chat next week?', 4300)],
  };
}

export function initialChannels(): Channel[] {
  return [
    { id: 'ch-1', slug: 'product', name: 'Product Management', emoji: '🧭', description: 'PMs and aspiring PMs', category: 'interest', member_count: 248, is_member: true, unread_count: 3, last_message_at: ago(20), last_message_preview: 'Anyone attending the product summit?' },
    { id: 'ch-2', slug: 'consulting', name: 'Consulting', emoji: '📊', description: 'Consultants', category: 'interest', member_count: 312, is_member: true, unread_count: 0, last_message_at: ago(300) },
    { id: 'ch-3', slug: 'ai', name: 'AI', emoji: '🤖', description: 'AI builders', category: 'interest', member_count: 405, is_member: true, unread_count: 1, last_message_at: ago(90) },
    { id: 'ch-4', slug: 'marketing', name: 'Marketing', emoji: '📣', description: '', category: 'interest', member_count: 190, is_member: false },
    { id: 'ch-5', slug: 'entertainment', name: 'Entertainment', emoji: '🎬', description: '', category: 'interest', member_count: 120, is_member: false },
  ];
}

export function cmsg(channelId: string, p: { id: string; first_name: string; last_name: string; photo_url: string | null }, content: string, mins: number, extra: Partial<ChannelMessage> = {}): ChannelMessage {
  return {
    id: `cm-${Math.random().toString(36).slice(2)}`,
    channel_id: channelId,
    content,
    created_at: ago(mins),
    edited_at: null,
    deleted_at: null,
    is_pinned: false,
    sender: { user_id: p.id, first_name: p.first_name, last_name: p.last_name, photo_url: p.photo_url },
    reactions: [],
    link_preview: null,
    media_type: null,
    media_url: null,
    media_width: null,
    media_height: null,
    parent_message_id: null,
    thread: null,
    ...extra,
  };
}

export function initialChannelMessages(channelId: string): ChannelMessage[] {
  if (channelId !== 'ch-1') {
    return [cmsg(channelId, PEOPLE[5], 'Welcome to the channel! Introduce yourself 👋', 600)];
  }
  return [
    cmsg(channelId, PEOPLE[10], 'Hi all! Sharing a PM interview prep guide I put together 👇', 1500, {
      link_preview: { url: 'https://example.com/pm-guide', title: 'The PM Interview Playbook', description: 'Frameworks, sample questions and mock interview tips.', site_name: 'example.com' },
      reactions: [{ emoji: '👍', count: 6, reacted_by_me: false }, { emoji: '🙏', count: 2, reacted_by_me: true }],
      thread: { reply_count: 3, last_reply_at: ago(1400) },
    }),
    cmsg(channelId, PEOPLE[3], 'This is super helpful, thanks Grace!', 1450),
    cmsg(channelId, PEOPLE[8], 'Anyone attending the product summit in Bengaluru next month? Would love to meet up.', 20, {
      reactions: [{ emoji: '🙌', count: 4, reacted_by_me: false }],
    }),
  ];
}

export function initialNotifications(): AppNotification[] {
  return [
    { id: 'nt1', notification_type: 'reminder', metadata: { sender_id: 'p-0', sender_name: 'Priya Nair', sender_photo_url: PEOPLE[0].photo_url ?? undefined, conversation_id: 'cv-0' }, sent_at: ago(12), read_at: null, is_read: false },
    { id: 'nt2', notification_type: 'reminder', metadata: { sender_id: 'p-7', sender_name: 'Rahul Iyer', sender_photo_url: PEOPLE[7].photo_url ?? undefined, conversation_id: 'cv-3' }, sent_at: ago(4300), read_at: ago(4000), is_read: true },
    { id: 'nt3', notification_type: 'channel', metadata: { title: 'Grace Liu', body: 'posted in #Product Management', sender_id: 'p-10', sender_photo_url: PEOPLE[10].photo_url ?? undefined }, sent_at: ago(1500), read_at: ago(1400), is_read: true },
  ];
}

export const SPARK_GREETING =
  'Hi Alex, I’m Spark 👋 You’ve got a strong mix here: consulting at Northwind, NBS ’27, and a clear interest in product and analytics.\n\nI can find people worth meeting, explain why they matter, draft an opener for you, and help you prep for a coffee chat or interview.\n\nWhere would you like to start?';
