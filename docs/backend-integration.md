# Backend Integration (overview)

This app is an **unofficial client**. It signs in with a member's own Icebreaker account and talks to the same backend the Icebreaker website uses. It is not affiliated with or endorsed by Icebreaker Connect, Inc.

> The detailed endpoint, payload and response catalogue produced during the audit is **intentionally not published** in this public repository. This page describes the integration at the level needed to understand the architecture and the product decisions.

## Approach
- The audit (see `website-audit.md`) showed the website is a single-page app over a JSON REST API, so a native client could reuse the member's existing account and data directly, with no scraping or embedded web views.
- All network code lives in `src/api/` (`client.ts` for transport, auth and errors; `endpoints.ts` for typed calls), with typed models in `src/types/api.ts`. Screens never call `fetch` directly.

## Authentication & session
| Concern | Decision |
|---|---|
| Sign-in | Email + password sent once over HTTPS; never stored. |
| Session | Short-lived access token + rotating refresh token, stored only in the OS keystore (`expo-secure-store`). |
| Transport | `Authorization: Bearer` header; cookies are never used (`credentials: 'omit'`). |
| Expiry | On 401 the client refreshes once (single-flight, shared by concurrent requests) and retries; if refresh fails, the session is cleared and the user returns to Login with a notice. |
| Logout | Best-effort server sign-out, then local token deletion and cache clear. |

## Capabilities the app uses
| Area | What the app reads / writes |
|---|---|
| Home | Personalised feed: match of the day and themed carousels |
| Discover | Faceted people search with filters, sort and pagination |
| Profiles | Member profile, "reasons to connect" and shared context; save / unsave |
| Messaging | Conversation list, message history, send, read receipts, start conversation |
| Channels | Directory, join, history, post, read state |
| Notifications | List, unread count, mark read / mark all read |
| Settings | Account preferences (email notifications, theme), change password |
| Spark (AI) | Latest session history and a **streaming** chat (Server-Sent Events) |

## Freshness model
The website has no push/WebSocket channel for messaging; it polls. The app mirrors that with TanStack Query intervals: open thread 4 s, conversation list and unread counts 30 s, notifications 60 s. Polling pauses when offline and resumes when the app returns to the foreground.

## Resilience
- 15 s request timeout (30 s for the slow home feed).
- Retries: server errors ×2 with back-off, network/timeouts ×1, client errors never.
- Offline banner; cached data stays visible.
- Every screen has explicit loading, empty, error-with-retry and offline states.
- The audit observed a slow home feed (6–14 s) and intermittent 5xx responses from the backend, which these rules absorb.

## Risks of an unofficial client
- The backend is not a public API: it can change without notice and break the app. A real product would need an agreed, versioned API contract.
- Rate limits and terms of service apply to the member's account.
