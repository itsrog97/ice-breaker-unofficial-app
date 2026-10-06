/**
 * Types for the Icebreaker REST API (`/api/v1`), derived from observed responses.
 * See docs/backend-integration.md and docs/data-model.md.
 */

export type UUID = string;
export type ISODate = string;

export interface AuthUser {
  id: UUID;
  email: string;
  full_name: string | null;
  is_email_verified: boolean;
  created_at: ISODate;
}

export interface AuthResponse {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  needs_email_verification: boolean;
  message: string | null;
}

export interface SchoolInfo {
  id: number;
  name: string;
  alias: string | null;
  domain?: string | null;
}

export interface Experience {
  id: UUID;
  is_current: boolean;
  company: string;
  title: string;
  start_year: number | null;
  end_year: string | null;
  display_order: number;
}

/** GET /profile (the signed-in user). */
export interface MyProfile {
  id: UUID;
  photo_url: string | null;
  first_name: string;
  last_name: string;
  city: string | null;
  city_display_name: string | null;
  hometown_display_name: string | null;
  mba_school_id: number | null;
  mba_grad_year: number | null;
  current_company: string | null;
  current_title: string | null;
  current_industry: string | null;
  my_icebreaker: string | null;
  hobbies: string[] | null;
  my_projects: string | null;
  project_brief: string | null;
  linkedin_url: string | null;
  what_brings_you: string[] | null;
  excited_cities: string[] | null;
  passionate_about: string[] | null;
  help_others: string[] | null;
  affinity_tags: string[] | null;
  experiences: Experience[];
  school_info: SchoolInfo | null;
  is_profile_complete: boolean;
  is_verified: boolean;
  agent_beta_enabled: boolean;
  channels_enabled: boolean;
}

/** Profile summary used in discovery results, conversation participants, etc. */
export interface ProfileSummary {
  id: UUID;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  city: string | null;
  mba_school_name: string | null;
  mba_school_alias: string | null;
  mba_school_id: number | null;
  mba_grad_year: number | null;
  current_company: string | null;
  current_title: string | null;
  current_industry: string | null;
  my_icebreaker: string | null;
  hobbies: string[] | null;
  is_verified: boolean;
  is_connected: boolean;
  has_messaged: boolean;
  is_new: boolean | null;
  is_active: boolean | null;
}

/** GET /discovery/profiles/{id}. */
export interface ProfileDetail extends ProfileSummary {
  hometown: string | null;
  undergrad_school: string | null;
  experiences: Experience[];
  my_projects: string | null;
  linkedin_url: string | null;
  what_brings_you: string[] | null;
  excited_cities: string[] | null;
  passionate_about: string[] | null;
  help_others: string[] | null;
  affinity_tags: string[] | null;
  can_message: boolean;
}

export interface Commonalities {
  commonalities: { category: string; label: string; items: string[] }[];
  reasons_to_connect: { type: string; text: string }[];
}

export interface Option {
  value: string;
  label: string;
  description?: string;
  category?: string;
  group?: string;
}

export interface ProfileOptions {
  networking_goals: Option[];
  mba_focus_areas: Option[];
  industries: Option[];
  areas_of_expertise: Option[];
  hobbies: Option[];
  what_brings_you_options: Option[];
  excited_city_options: Option[];
  passionate_about_options: Option[];
  help_others_options: Option[];
  affinity_tag_options: Option[];
}

export interface School {
  id: number;
  name: string;
  alias: string | null;
  city?: string | null;
  country?: string | null;
}

export interface FacetedSearchResponse {
  profiles: ProfileSummary[];
  total_count: number;
  page: number;
  limit: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  total_pages: number;
  search_id: string;
}

export interface DiscoveryFilters {
  q?: string;
  industries?: string[];
  passionate_about?: string[];
  what_brings_you?: string[];
  help_others?: string[];
  schools?: number[];
  companies?: string[];
  sort_by?: string;
}

/* ---------- Home ---------- */

export interface CarouselProfileCard {
  profile_id: UUID;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  school_alias: string | null;
  school_name?: string | null;
  mba_grad_year: number | null;
  current_title: string | null;
  current_company: string | null;
  city?: string | null;
  my_icebreaker?: string | null;
  is_new?: boolean | null;
  is_active?: boolean | null;
  is_saved?: boolean;
  shared_context?: string[];
  project_brief?: string;
  project_category?: string;
  icebreaker_brief?: string;
}

export interface CarouselCard {
  id: string;
  card_type: 'profile' | 'project' | 'notable_icebreaker' | string;
  position: number;
  data: CarouselProfileCard;
}

export interface Carousel {
  id: string;
  carousel_type: string;
  primary_card_type: string;
  title: string;
  subtitle: string | null;
  cards: CarouselCard[] | null;
  has_more: boolean;
}

export interface FeaturedProfile extends CarouselProfileCard {
  match_id: string | null;
}

export interface HomeCarouselsResponse {
  carousels: Carousel[];
  featured_profile: FeaturedProfile | null;
  generated_at: ISODate;
}

/* ---------- Messaging ---------- */

export interface Conversation {
  id: UUID;
  created_at: ISODate;
  updated_at: ISODate;
  last_message: string | null;
  last_message_at: ISODate | null;
  last_message_sender_id: UUID | null;
  other_participant: ProfileSummary;
  unread_count: number;
  marked_unread: boolean;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface Reaction {
  emoji: string;
  count: number;
  reacted_by_me: boolean;
}

export interface DirectMessage {
  id: UUID;
  conversation_id: UUID;
  sender_id: UUID;
  content: string;
  created_at: ISODate;
  is_read: boolean;
  message_type: string;
  deleted_at: ISODate | null;
  edited_at: ISODate | null;
  reactions: Reaction[] | null;
}

export interface MessagesResponse {
  messages: DirectMessage[];
  total: number;
  has_more: boolean;
}

export interface UnreadCount {
  unread_count: number;
  conversations_with_unread: number;
}

/* ---------- Channels ---------- */

export interface Channel {
  id: UUID;
  slug: string;
  name: string;
  emoji: string | null;
  description: string | null;
  category: string;
  member_count: number;
  is_member: boolean;
  unread_count?: number;
  last_message_at?: ISODate | null;
  last_message_preview?: string | null;
  notification_level?: string;
}

export interface ChannelMessage {
  id: UUID;
  channel_id: UUID;
  content: string;
  created_at: ISODate;
  edited_at: ISODate | null;
  deleted_at: ISODate | null;
  is_pinned: boolean;
  sender: { user_id: UUID; first_name: string; last_name: string; photo_url: string | null };
  reactions: Reaction[];
  link_preview: { url: string; title?: string; description?: string; image_url?: string; site_name?: string } | null;
  media_type: string | null;
  media_url: string | null;
  media_width: number | null;
  media_height: number | null;
  parent_message_id: UUID | null;
  thread: { reply_count: number; last_reply_at?: ISODate } | null;
}

export interface ChannelMessagesResponse {
  messages: ChannelMessage[];
  has_more: boolean;
}

/* ---------- Notifications ---------- */

export interface AppNotification {
  id: UUID;
  notification_type: string;
  metadata: {
    title?: string;
    body?: string;
    deep_link?: string;
    sender_id?: UUID;
    sender_name?: string;
    sender_photo_url?: string;
    conversation_id?: UUID;
  };
  sent_at: ISODate;
  read_at: ISODate | null;
  is_read: boolean;
}

/* ---------- Settings ---------- */

export interface UserSettings {
  push_notifications: boolean;
  email_notifications: boolean;
  discovery_enabled: boolean;
  show_graduation_year: boolean;
  privacy_level: string;
  theme_preference: 'system' | 'light' | 'dark' | string;
}

/* ---------- Spark agent ---------- */

export interface SparkChip {
  id: string;
  label: string;
  send_text: string;
}

export interface SparkChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
