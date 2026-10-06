# QA Report — Android Test Build v0.1.0

Date: 2026-09-30 · Build: `app-release.apk`, versionName 0.1.0, versionCode 1, package `com.icebreaker.mobiletest`, targetSdk 36, ABIs arm64-v8a / armeabi-v7a / x86_64, debug-key signed.

## How it was tested (and what that does and doesn't prove)

| Layer | Method | Environment |
|---|---|---|
| Static | `tsc --noEmit`, `expo lint`, `expo-doctor` (21/21) | Node 22 |
| Unit / component | Jest + React Native Testing Library, 39 tests | jest-expo |
| Functional UI | Playwright driving the **web export of the same React Native code** against the **live Icebreaker API** | Chromium; CORS disabled in the test browser only |
| Native build | `expo prebuild` + Gradle `assembleRelease` | Android SDK 36, JDK 21 |
| On-device | **Not completed** — see Known limitations | — |

The web export exercises the same screens, navigation, state, API client and business logic as Android, but **not** native-only behaviour: SecureStore persistence, the hardware back button, the Android keyboard, native fonts/rendering, and SSE streaming through the native `fetch`. Those need your on-device pass.

To avoid affecting real members, outgoing **messages and new conversations were intercepted** in the test browser (never reached the server). The only live writes were the Dark-mode setting (restored to its original "system" value afterwards) and read-receipts from opening conversations/channels.

## Tested
- **13 screens:** Login, Forgot password, Home, Discover (+2 bottom sheets), Profile detail, Spark, Chat list, Conversation, Channel, Notifications, My Profile, Settings, Change password
- **9 flows:** login (4 error paths + success), forgot password, discover→profile→Break the Ice, chat→conversation→send, chat→channel, Spark greeting/history, notifications, settings toggles, logout
- **16 components:** AppText, Button, TextField, Avatar, ProfileTile, Card, Chip, SelectSheet, Composer, State views, IconButton, CountBadge, SectionHeader, Logo, OfflineBanner, ProfileSections
- **24 API interactions** observed from the app (sign-in, refresh, home feed, search incl. pagination, profiles, saved profiles, messaging, channels, notifications, settings, Spark streaming)
- **5 viewports:** 360×800, 390×844, 412×915, 800×1280 (tablet), 1366×768 (Chromebook)

## Passed

**Automated (39/39):** API client (bearer header, cookies omitted, refresh-and-retry, single-flight refresh under concurrency, token rotation persisted to SecureStore, session cleared + listeners notified when refresh fails, 422/5xx error mapping, network error, timeout), SSE parser (chunk boundaries, CRLF, defaults), discovery query serialisation, formatting helpers, password rules, notification routing, Login screen (empty, invalid email, 401 copy + password cleared, offline message, successful submit), Composer (blank blocked, trims & clears, keeps draft on failure).

**Functional walkthrough (33/33):** empty-field validation · invalid email · wrong password shows "Invalid email and/or password" · password cleared after failure · show/hide password · forgot-password validation · back to login · login lands on Home (Home ready in ~6 s) · profile carousels · profile detail from Home · reasons to connect · back navigation · Discover grid + count · search · industry sheet · filter chip count · sort Newest · infinite scroll (pages 2–4) · profile from Discover · Break the Ice requests a conversation · channels + DMs · DM list · chat search no-match state · conversation render · send flow · channel render · Spark history · own profile · notifications · settings · change-password validation · dark mode persists.

**Failure modes (12/12):** offline sign-in message · Home 5xx → error view · Try again recovers · chat empty state · notifications empty state · slow network shows loader then results · Discover no-results · hung request times out with retry (on an uncached screen) · all-401 + failed refresh → Login with "Your session expired" · logout → Login · browser back after logout does not reveal the app. (Also incidentally observed: real backend 502s on the home feed were handled by the error/retry state.)

**Responsive (5/5 viewports):** no horizontal overflow on Login, Home, Discover, Chat, Conversation, Profile; composer stays on-screen; tab targets 48 dp; Discover grid 3/4/6 columns.

**Build:** release APK builds; `apksigner verify` passes; minSdk 24, targetSdk 36; `allowBackup=false`; permissions limited to INTERNET, ACCESS_NETWORK_STATE, ACCESS_WIFI_STATE, VIBRATE; bundle scanned — no credentials.

## Failed / fixed during QA
| Issue | Status |
|---|---|
| `expo-asset` missing (would crash icon/font loading) | Fixed |
| "Save for Later" label wrapped at 390 dp | Fixed (label "Save") |
| Project category labels lower-cased ("Business services") | Fixed (title case) |
| Timeout took ~48 s (15 s × 3 attempts) | Fixed: network/timeouts retry once |
| Discover sort value guessed | Fixed: uses the site's `recent` value |

## Known limitations
1. **No on-device/emulator run completed.** The build container has no KVM; a software-emulated Android 14 image booted and the APK installed, but the emulator's `system_server` kept crashing under software emulation, so the app could not be launched and exercised there. Native-only behaviour (SecureStore persistence across restarts, hardware back, keyboard avoidance, streaming Spark on Android, fonts) is **unverified** — please cover it in your test pass.
2. Sending a real message / creating a real conversation / joining a channel was not executed against the live server (intercepted) to avoid contacting real members.
3. Forgot-password submit and change-password submit were not executed (would email / change your password).
4. The backend home feed takes 6–14 s and intermittently 502s; Home can show an error until retried.
5. Not in v0.1: push notifications, profile editing (opens website), channel threads, adding reactions, media/GIF posting, @mentions, AI reply helpers, "Interested", Location/Company filters, delete account, blocked users.
6. Spark's structured cards (`profile_card`, `icebreaker`, …) are rendered generically — their exact payloads weren't captured during the audit.
7. Release APK is debug-signed (side-load only).
8. Tablet: carousel rows start at the screen edge while section titles are centred (cosmetic).
9. During auditing, a Spark greeting session was started on the test account (visible as the latest Spark conversation).

## Recommended changes
- Persist the React Query cache (instant Home on cold start; offline reading).
- Push notifications (FCM) + notification deep links.
- Native profile editing & photo upload.
- Sentry/Crashlytics before wider testing.
- Ask the backend team about home-feed latency and 502s.
- Real upload key + Play internal testing track.

## Recommended test scenarios for you
1. Install, sign in, force-close, reopen → still signed in.
2. Wrong password → error; airplane mode → "No connection".
3. Home → Match of the Day → Break the Ice → send yourself-appropriate message to a colleague.
4. Discover: search, 2 filters, sort Newest, scroll far.
5. Chat: open a DM, reply; open a channel, post (if appropriate); Join a channel.
6. Spark: tap "Find relevant people", check streaming & cards.
7. Hardware back from every screen; rotate on a tablet/Chromebook.
8. Settings: dark mode, change password (optional), log out → back button must not reopen the app.
9. Leave the app for > 4 h, reopen → should refresh silently.
