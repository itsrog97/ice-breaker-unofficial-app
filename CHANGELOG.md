# Changelog

All notable changes to Connectoo (formerly “Icebreaker (Unofficial)”), an unofficial mobile client for the Icebreaker network. Versions follow `app.json` (`expo.version` / `android.versionCode`).

## [1.1.0] — 2026-10-06 — Connectoo rebrand

### Changed
- App renamed to **Connectoo** everywhere: launcher name, in-app wordmark, Login and Settings copy, web demo, docs and design-review PDF. Icebreaker is still named where the app describes the service it connects to and in the disclaimer.
- The profile's primary action is now **Burn the Wall** (was “Break the Ice”). It's a fiery orange-to-red gradient button with a flame icon. Once you've already messaged someone it still reads **Message** in the brand colour.
- Android package ID changed to `io.github.itsrog97.connectoo`, deep-link scheme to `connectoo://`; versionCode 3. Installs alongside v1.0.0; uninstall the old app.

### Added
- `expo-linear-gradient` for the new button.

### Testing
Typecheck ✅, Jest 45/45 ✅. Web demo end-to-end: 16/16 checks (including Burn the Wall → conversation → send). Light and dark mode checked visually. APK not re-tested on a device.

## [1.0.0] — 2026-10-06 — first public release (unofficial client)

### Changed
- Published as an independent, **unofficial** portfolio project. Not affiliated with or endorsed by Icebreaker Connect, Inc.
- New original app icon and text wordmark with an “UNOFFICIAL” tag; Icebreaker's logo artwork removed.
- Disclaimer added to the Login and Settings screens; app name “Icebreaker (Unofficial)”.
- Public docs trimmed to product/UX level: the detailed private-API catalogue was replaced by `docs/backend-integration.md`, and the data model is now an entity overview.
- Design-review PDF and screenshots regenerated with the new branding (fictional demo data).
- Android package ID changed to `io.github.itsrog97.icebreakerunofficial` (installs alongside the 0.1.0 test build; uninstall that one).
- **Live web demo** (GitHub Pages): demo mode (`EXPO_PUBLIC_DEMO_MODE=1`) runs the app on an in-browser fake backend with fictional data; landing page with phone frame in `web-demo/`.
- Version 1.0.0 (versionCode 2).

### Fixed
- Web: connectivity probe falsely reported “offline” on static hosting (and paused actions); the web build now relies on browser online/offline events.
- Chat: tapping **Join** on a channel you haven't joined could be swallowed by the (disabled) row; non-member rows are no longer wrapped in a button.

### Testing status
Typecheck ✅, lint ✅, Jest 45/45 ✅ (6 new demo-backend tests). Web demo end-to-end: 16/16 checks (sign-in, Discover search, profile, Break the Ice + send, Spark streaming/cards/opener, join channel, deep links, phone-width landing, no errors, no external calls). APK not re-tested on a device.

## [0.1.0] — 2026-09-30 — ANDROID TEST BUILD (not a final release)

### Added
- Website audit and documentation set (`docs/`): audit, product spec, user flows, data model, API documentation, design system, QA report.
- Expo SDK 57 + Expo Router + TypeScript project with a design system mirrored from the website's CSS tokens (light & dark).
- Secure authentication: login with client + server validation, show/hide password, forgot-password request, sign-up link, tokens in SecureStore, session persistence, silent refresh with single-flight + token rotation, expired-session redirect with notice, logout.
- Home: Match of the Day, project and "Ask me about this" story carousels, people carousels, pull-to-refresh.
- Discover: search, 5 filters as bottom sheets, sort (Relevance/Newest), infinite scroll, responsive grid (3/4/6 columns).
- Profile detail: reasons to connect, commonalities, full profile sections, Save / Saved, Break the Ice (opens or creates the conversation).
- Chat: channels (join, unread badges) and direct messages (search, unread), conversation and channel views with 4-second polling, send, mark-as-read.
- Spark AI assistant with streaming responses (SSE), suggestion chips, tool status and structured cards.
- Notifications list with unread badge, tap-to-navigate, mark read / mark all read.
- My Profile (read-only) and Settings (email notifications, dark mode synced to account, change password with web's rules, legal/support links, logout).
- Offline banner, error/empty/loading states, request timeouts and retry policy, accessibility labels, 48 dp touch targets.
- Minimal Android permissions (INTERNET, network/wifi state, vibrate); overlay/storage/biometric permissions blocked.
- Smaller APK: compressed native libraries and R8 code/resource shrinking without renaming (`-dontobfuscate`) — arm64 APK 24.6 MiB.
- Release-signing config plugin (`plugins/withReleaseSigning.js`) for AAB builds.
- 39 automated tests (API client incl. refresh/timeout/offline, SSE parser, formatting, validation, notification routing, Login screen, Composer).

### Known issues
- Not verified on a physical Android device. A software-only emulator (no KVM) was tried: the APK installed, but the emulator's own system process kept crashing, so the app could not be exercised there.
- The backend home feed is slow (6–14 s) and the backend intermittently returns 502; the app retries but Home can show "Couldn't load this" — tap Try again.
- Profile editing, channel threads, adding reactions, image/GIF posting and AI reply helpers are not in this build.
- No push notifications; counts refresh by polling.
- Release APK is signed with the debug key (side-load only).

### Testing status
Automated: typecheck ✅, lint ✅, expo-doctor ✅, Jest 39/39 ✅. Web-rendered QA of the same code against the live API: 33/33 walkthrough checks, 12/12 failure-mode checks, 5 viewports ✅. APK: builds, `apksigner` verified, minSdk 24 / targetSdk 36, no credentials in the bundle. On-device Android testing: **pending (you)**.

APK SHA-256 — universal (arm64, armv7, x86_64; 84 MiB): `6fa43be47a678f45f7d49f5675663dcaa68b7a0248a8121bd323099dcc914782`
APK SHA-256 — arm64-only, shrunk (24.6 MiB, delivered to tester as Icebreaker-v0.1.0-test.apk): `599c17405a6a5abf4da7fb2bc6f0e4a858b932227c2d5aeebe2686c116ae759e`
