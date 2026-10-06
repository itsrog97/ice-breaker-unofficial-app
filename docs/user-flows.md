# User Flows

Flows as implemented in the Android test build (v0.1.0), mirroring the website's behaviour.

## 1. Launch & session restore
```mermaid
flowchart TD
  A[App launch] --> B[Splash]
  B --> C{Tokens in SecureStore?}
  C -- no --> L[Login]
  C -- yes --> H[Home tabs]
  H --> D{API returns 401?}
  D -- no --> H
  D -- yes --> R[Renew session]
  R -- 200 --> S[Save rotated tokens, retry request] --> H
  R -- fail --> X[Clear tokens] --> L2[Login + 'Your session expired']
```

## 2. Login
```mermaid
flowchart TD
  L[Login] --> V{Client validation}
  V -- empty --> E1[Please enter your email / password]
  V -- bad email --> E2[Please enter a valid email address]
  V -- ok --> P[Sign in request]
  P -- 401 --> E3[Invalid email and/or password. Please try again. — password cleared]
  P -- network/timeout --> E4[No connection / timed out]
  P -- 200 --> T[Store access+refresh token in SecureStore] --> H[Home]
  L --> F[Forgot Password?] --> FP[Enter email → reset link sent → confirmation]
  L --> SU[Sign Up → opens website]
```

## 3. Discover → Burn the Wall
```mermaid
flowchart LR
  D[Discover] -->|type / filter / sort| Q[People search]
  Q --> G[Grid, infinite scroll page=2…]
  G -->|tap tile| P[Profile detail]
  P --> C[GET commonalities → 'Reach out to X to:']
  P -->|Save| S[Save / unsave]
  P -->|Burn the Wall| B[Open or create conversation]
  B --> CV[Conversation screen]
```

## 4. Messaging
```mermaid
flowchart TD
  CH[Chat tab] --> LST[Channels + Direct messages\npoll 30s]
  LST -->|tap DM| CV[Conversation\nGET messages, poll 4s\nPUT read]
  CV -->|send| SND[POST message] --> CV
  LST -->|Join| J[Join channel] --> LST
  LST -->|tap channel| CN[Channel\nGET messages, poll 4s\nPUT read]
  CN -->|send| CS[POST channel message] --> CN
  CV -->|tap header| PR[Profile detail]
```

## 5. Spark
```mermaid
flowchart TD
  SP[Spark tab] --> H[GET latest session interactions]
  H -- history --> SHOW[Render conversation]
  H -- empty --> G[Request greeting]
  SHOW --> U[User types or taps a chip]
  U --> ST[Streaming chat request]
  ST --> EV{event}
  EV -- text --> T[Stream into assistant message]
  EV -- tool_call --> A[Status: 'Searching your network…']
  EV -- profile_card etc. --> C[Card with View profile]
  EV -- suggestions --> CH[Chips]
```

## 6. Notifications
Bell (badge = unread count, polled 30 s) → list → tap → mark read + navigate to conversation (if `conversation_id`/deep link) or sender profile. "Mark all read" in header.

## 7. Settings & logout
Header ⚙ → Settings: Email notifications toggle (PATCH), Dark mode (local + PATCH `theme_preference`), Change Password (validate → POST → re-signin), Terms/Privacy/Support (in-app browser), **Log Out** (confirm → server sign-out → clear SecureStore → Login). Android back from Login after logout exits the app — protected screens are removed from history.

## Android back button
- Tabs: back from a non-Home tab returns to Home (React Navigation `firstRoute` behaviour); back on Home exits the app.
- Stack screens (Profile detail, Conversation, Channel, Notifications, Settings, Change Password): back pops one level.
- Bottom sheets (Discover filters): back closes the sheet (`onRequestClose`).
