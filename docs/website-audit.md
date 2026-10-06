# Icebreaker Website Audit

Audit of **https://joinicebreaker.com** (web app v1.6.7, Next.js) performed on 2026-09-30 with a normal member account, using a headless Chromium browser at phone (390×844), tablet (800×1280) and desktop (1440×900) sizes plus network inspection (endpoint-level findings are not published here; see `backend-integration.md`).

Everything below was observed directly. Items marked **(bundle)** were confirmed by reading the site's shipped JavaScript rather than by clicking through — they exist in the client but were not exercised end-to-end (usually because they would change real data or message real people).

> Privacy: other members' names and photos seen during the audit are intentionally not reproduced here. Reference screenshots containing member data were kept out of the repository.

---

## 1. Authentication

| Item | Observed behaviour |
|---|---|
| Login page | `/login?redirect=%2Fhome`. Logo, "Welcome Back", subtitle "Sign in to continue networking with your MBA community", Email Address, Password, **Sign In**, "Don't have an account? **Sign Up**", **Forgot Password?** |
| Email field | `type=email`, `required`, placeholder "Enter your email" |
| Password field | `type=password`, `required`, placeholder "Enter your password". No show/hide toggle on login (the Change Password dialog does have one). |
| Empty fields | Browser-native validation ("Please fill out this field."); no request sent |
| Invalid email | Browser-native validation ("Please include an '@'…"); no request sent |
| Wrong password | Server rejects; UI shows "Invalid email and/or password. Please try again." inline |
| Unknown email | Identical 401 / message (no account enumeration) |
| Success | Session established; user is redirected to the `redirect` page (Home) |
| Session | Short-lived session renewed silently in the background; long-lived "remember me" period |
| Expired session | Verified: an expired short-lived session renews silently and the page loads normally |
| No session | Verified: visiting `/messages` with no auth cookies redirects to `/login?redirect=%2Fmessages` |
| Logout | Menu → "Log out" and Settings → "Log Out" end the session and return to login |
| Forgot password | `/forgot-password`: "Reset Password", email field, **Send Reset Link**, "Back to Sign In" (not submitted during the audit to avoid sending email) |
| Sign up | `/signup`: Email, Password, Invite code (optional), Terms checkbox, **Create Account** (not exercised) |
| Usage analytics | The site records app sessions (platform, version) on load and exit |

## 2. Information architecture

Authenticated app (phone layout uses a top bar + hamburger drawer; desktop uses a top nav):

```
Login ─┬─ Sign Up (/signup)
       └─ Forgot Password (/forgot-password)

App (authenticated)
├── Home (/home)
│   ├── Match of the Day card → Profile modal
│   ├── "What people are building" (project cards, "Interested")
│   ├── "Ask me about this" (notable icebreakers, "Tell me more")
│   └── ~18 people carousels (People in <country>, People looking to invest,
│       <Community> in <city>, People willing to mentor, …) → Profile modal
├── Discover (/discover)
│   ├── Search "Search people, companies..."
│   ├── Filters: Industry · Areas of Interest · Location · School · Company · Goals · Advice They Can Give
│   ├── Sort: Relevance | Newest
│   └── Result grid (50 per page, infinite scroll) → Profile modal
│        └── Profile modal: reasons to connect, "Ideas to Break the Ice",
│            Save for Later, Break the Ice, prev/next profile
├── Spark (/agent) — AI networking assistant (streaming chat)
├── Chat (/messages)
│   ├── Channels (Consulting, AI, Product Management, Entertainment, Marketing; Join)
│   │    └── Channel view: messages, reactions, threads, link previews, composer (+ media)
│   └── Direct messages (search, filter)
│        └── Conversation: bubbles, reactions, "Suggest Reply", "Politely decline", composer
├── Notifications (/notifications — opened from the drawer / bell)
├── My Profile (/profile) — view + inline edit of every section
└── Settings (/settings)
    ├── Email Notifications (toggle)
    ├── Dark Mode (toggle)
    ├── Change Password (dialog)
    ├── Terms of Service / Privacy Policy / Support (external)
    ├── Log Out
    └── Delete Account
```

Routes discovered: `/`, `/login`, `/signup`, `/forgot-password`, `/home`, `/discover`, `/agent`, `/messages`, `/notifications`, `/profile`, `/settings`, plus external `/terms`, `/privacy`, `/support` — **13 routes**, ~16 distinct screens/modals.

## 3. Screen-by-screen UI audit

Global visual language (from the site's CSS custom properties — see `design-system.md`):
- Font **Inter** (JetBrains Mono also loaded). Brand blue `#255b7d`, navy `#001c33`, ice `#2fb5d8`. White surfaces, `#dcdee0` borders, radius 10px (`--radius: .625rem`), soft shadows.
- Full dark theme exists (`.dark` class) with its own palette.

| Screen | Layout & components | States |
|---|---|---|
| **Login** | Centered single column, logo, 28px bold heading, grey subtitle, labelled inputs (52px tall, 14px radius, `#fafafa` fill), full-width brand-blue Sign In button with shadow, text links | Inline red error under password; native validation bubbles |
| **Top bar (phone)** | Wordmark left; Search, Spark (sparkle), Chat (with unread badge), hamburger right. Drawer: Home, Discover, Spark ✦, Chat (badge), Notifications, My Profile, Settings, red "Log out" at bottom | Active item highlighted grey |
| **Home** | "MATCH OF THE DAY" card (96px circular photo, name, title at company, school+year, shared-context pill). Section headers (20px bold + grey subtitle). Horizontal carousels: large project/icebreaker cards (category pill in lavender, 24px bold text, person row with chevron, "Interested"/"Tell me more" button) and circular 110px profile tiles with green "active" dot and navy "NEW" pill | Centered spinner while the home feed loads (observed 6–14 s) |
| **Discover** | Rounded search field, horizontally scrolling filter dropdown chips, "Sort by: Relevance ▾", 3-column grid (phone) / 6 columns (desktop) of circular tiles: first name bold, school alias in brand blue, company grey | Dropdown menus (desktop-style popovers) |
| **Profile modal** | Full-screen sheet: close ✕, 140px photo with active dot, name 24px bold, italic quote (icebreaker), bordered card "Reach out to <name> to:" with bullet reasons + "+N more reasons", "Ideas to Break the Ice" button, sections (Education, Work Experience…), fixed bottom bar with round **Save for Later** and **Break the Ice** buttons, prev/next arrows | — |
| **Spark** | Full-height chat: assistant text in large 16/26 type without bubbles, user messages as bubbles, suggestion chips (outlined pills), "Message Spark" input with round send button | "Thinking…" indicator; streaming text |
| **Chat list** | "Search conversations" + filter button; CHANNELS header with NEW pill; `#` rows with unread count badges or outlined "Join"; DIRECT MESSAGES rows (52px avatar, name, relative time, 2-line preview) | Skeleton rows while loading |
| **Conversation** | Header: back, avatar, name, title at company, school. Day pill, grey left bubbles / blue right bubbles, time under bubble, reaction button; AI chips "Suggest Reply", "Politely decline"; pill input + round send | — |
| **Channel** | Header "# Product Management 👥 240 …"; day pills (navy "Today"); messages as avatar + name + time + body; link previews; emoji reaction pills; "N reply · date" thread links; join events; composer with "+" media button | "Message deleted" italic |
| **Notifications** | Simple list: avatar, "**Name** reached out and wanted to connect.", relative time | — |
| **My Profile** | Large photo with edit pencil, name, italic quote with pencil, "Edit Profile" outline button; sections with uppercase grey headers and pencil icons: Education, Work Experience (+ industry chip), Activities & Projects, Location, What brings me here, I'm passionate about, I'm interested in working in, Reach out to me about, What's shaped my experience, My hobbies | Empty-state hints in italic grey |
| **Settings** | Grouped cards with uppercase section labels; switches (brand blue when on); chevron / external-link icons; red outline Log Out; red text Delete Account; "Version 1.6.7" footer | Change Password modal with 3 password fields, show/hide eyes, rules |

Responsive behaviour: at desktop width the drawer becomes a top nav (Home, Discover, Spark ✦, Chat) with a centered search field, bell and avatar on the right; Discover grid grows to 6 columns.

## 4. Feature matrix

| Feature | Screen | User action | Expected result | Priority |
|---|---|---|---|---|
| Sign in | Login | Enter email/password → Sign In | Home; errors inline | P0 |
| Session refresh | All | (automatic) | Seamless | P0 |
| Sign out | Settings/drawer | Log out | Login screen | P0 |
| Home feed | Home | Open, scroll | Match of day + carousels | P0 |
| People search | Discover | Type query | Results update | P0 |
| Filters & sort | Discover | Pick values | Results filtered | P1 |
| Profile detail | Profile modal | Tap person | Details + reasons | P0 |
| Save for later | Profile modal | Tap | Saved list updated | P1 |
| Break the Ice | Profile modal | Tap | Opens/creates DM | P0 |
| Ice-breaker ideas | Profile / DM | Tap | AI openers (bundle) | P2 |
| DM list | Chat | Open | Conversations (polled) | P0 |
| Read DM | Conversation | Open | Messages, marked read (polled) | P0 |
| Send DM | Conversation | Type → send | Message appears | P0 |
| Reactions / edit / delete DM | Conversation | Long press | — (bundle) | P2 |
| Suggest reply / decline | Conversation | Tap chip | AI draft (bundle) | P2 |
| Channels list / join | Chat | Join | Channel joined | P1 |
| Channel read / post | Channel | Open / send | Messages | P1 |
| Channel threads, reactions, media, GIFs, mentions | Channel | — | — (bundle) | P2 |
| Notifications | Notifications | Open / tap | Navigate, mark read | P1 |
| Unread badges | Header | — | Counts (polled) | P1 |
| Spark assistant | Spark | Chat | Streaming answers, people cards | P1 |
| Resume review | Spark | Upload | Feedback (bundle) | P3 |
| View own profile | My Profile | Open | Sections | P0 |
| Edit profile / photo / experience | My Profile | Edit | Saved (bundle) | P1 |
| Settings toggles | Settings | Toggle | Saved | P1 |
| Change password | Settings | Submit | Re-authenticated | P1 |
| Blocked users | Settings | — | — (bundle) | P2 |
| Delete account | Settings | Confirm | Account deleted (bundle) | P2 |
| Referral code | Spark | — | Share link | P3 |
| Polls | Channel | Vote | — (bundle) | P3 |

All features require authentication. None work offline on the web (no service worker); state is persisted server-side. The web caches the home carousels and profile options in `localStorage`.

## 5. Real-time behaviour

No WebSocket or Server-Sent-Events connection for messaging. Freshness is achieved by **polling** (React Query `refetchInterval`): open thread/channel 4 s, conversation list 30 s, unread counts 30 s, notifications 60 s. Only Spark uses streaming (Server-Sent Events).

## 6. Limitations of this audit

- Actions that would contact other members or change shared data were not performed on the live site (sending messages, joining channels, "Interested", reactions, profile edits, deleting account, sending reset email). Their API contracts come from the shipped client code.
- Sign-up and onboarding flows were not exercised (would create an account).
- Native push notifications (the settings model has `push_notifications`) could not be observed on the web.
- Backend reliability: intermittent **502** responses were observed on several data requests (profile, channels, settings, home feed) during the audit, on both the website and the mobile client.
