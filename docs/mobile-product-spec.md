# Icebreaker Mobile — Product Specification

## Objective
Turn the Icebreaker web experience (MBA networking: discover people, break the ice, message, AI assistant) into a mobile-first native app, starting with an Android test build, on a codebase that also ships to iOS, tablets and Chromebooks.

## Target platforms
- **Phase 1:** Android phones (API 24+), installable APK for testing.
- **Phase 2:** iOS/iPadOS, Android tablets, Chromebooks (same codebase; layouts already responsive), Play Store AAB.

## Technology choice
**React Native + Expo SDK 57 + Expo Router, TypeScript.** One codebase for Android/iOS/tablet/Chromebook (and web for previews); file-based routing with protected routes; `expo-secure-store` for tokens in the Android Keystore/iOS Keychain; `expo/fetch` supports the SSE streaming Spark needs; local release builds via `expo prebuild` + Gradle, cloud builds via EAS later. The audit found a clean JSON REST API that accepts Bearer tokens, so a native client needs no web views or scraping.

Libraries: TanStack Query (caching, polling, retries, offline pause), expo-image (cached images), NetInfo (offline banner), Inter font, Ionicons.

## Scope

### MVP — Android v0.1 (implemented)
| Area | Included |
|---|---|
| Auth | Login with validation & server errors, show/hide password, forgot password request, sign-up link to website, secure token storage, session persistence, silent token refresh, expiry → login with notice, logout |
| Home | Match of the Day, project & "ask me about this" story carousels, people carousels, pull-to-refresh, error/retry |
| Discover | Search, filters (Industry, Areas of Interest, School, Goals, Advice They Can Give), sort (Relevance/Newest), infinite scroll, empty state |
| Profile detail | Photo, headline, icebreaker quote, reasons to connect, commonalities, full sections, Save/Saved, Break the Ice → conversation |
| Chat | Channels (joined + joinable, unread badges, Join), direct messages (search, unread), conversation view (read, send, mark read, 4 s polling), channel view (read, post, reactions/link previews/images display) |
| Spark | Session history, streaming replies, suggestion chips, tool-status line, structured cards with "View profile" |
| Notifications | List, unread state, tap-to-navigate, mark read / mark all read, unread badge |
| My Profile | Read-only view of all sections; "Edit Profile" opens website |
| Settings | Email notifications, dark mode (synced with account), change password (web rules), Terms/Privacy/Support, logout |
| Platform | Android back behaviour, safe areas, keyboard handling, dark mode, offline banner, tablet/Chromebook layouts, accessibility labels/roles, 48 dp targets |

### Phase 2 (after validation)
- Native profile editing (sections, experiences, photo upload with camera/gallery), onboarding.
- Push notifications (Expo Notifications / FCM) and deep links from notifications.
- Channel threads, reactions (add/remove), message edit/delete, image/GIF posting, @mentions.
- AI assists: "Ideas to Break the Ice", "Suggest Reply", "Politely decline".
- "Interested" on projects, "Tell me more" drafts, prev/next profile swiping, Location & Company filters.
- Persisted query cache (instant Home on cold start), blocked users, delete account, report.
- iOS build, signed Play Store AAB, crash reporting.

### Future
Resume review upload in Spark, referral sharing, polls, widgets, biometric unlock (settings has `biometric_preference`), realtime via WebSocket if the backend adds it.

## Non-functional requirements
- Never store passwords; tokens only in SecureStore; no secrets in source or logs.
- Request timeout 15 s (30 s for Home feed); retries: 5xx ×2, network ×1, 4xx none.
- Must remain usable at 360×800 and scale to 1366×768.
