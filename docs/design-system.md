# Design System

Tokens are taken from the website's CSS custom properties (`:root` / `.dark`) and live in `src/theme/tokens.ts`. Components read colours through `useTheme()` so light and dark themes switch at runtime.

## Colour

| Token | Light | Dark | Web variable |
|---|---|---|---|
| brandBlue | `#255b7d` | `#2fb5d8` | `--brand-blue` |
| brandIce | `#2fb5d8` | `#12cbf5` | `--brand-ice` |
| brandNavy | `#001c33` | `#000c1a` | `--brand-navy` |
| surfacePrimary / background | `#ffffff` | `#070e16` | `--surface-primary` |
| surfaceSecondary | `#f5f7f9` | `#0f171f` | `--surface-secondary` |
| surfaceTertiary | `#edeff0` | `#182029` | `--surface-tertiary` |
| textPrimary | `#0e1216` | `#eceff2` | `--text-primary` |
| textSecondary | `#5f6469` | `#9b9fa3` | `--text-secondary` |
| textTertiary | `#8c9094` | `#6f7274` | `--text-tertiary` |
| borderPrimary | `#dcdee0` | `#282f35` | `--border-primary` |
| borderSecondary | `#ccced0` | `#353b42` | `--border-secondary` |
| success | `#2f9f3d` | `#4db956` | `--success` (active dot) |
| error | `#cc272e` | `#f14d4c` | `--error` |
| warning | `#e99b2a` | `#faab3f` | `--warning` (offline banner) |
| contextBg / contextText | `#f4e3bf` / `#372c15` | `#443922` / `#daccb1` | `--context-*` (notices) |
| projectChip | `#f1edfd` / `#6b4fd8` | `#231c3d` / `#b8a6ff` | project category pill (from screenshots) |

## Typography — Inter (400/500/600/700 via `@expo-google-fonts/inter`)

| Variant | Size/line | Weight | Use |
|---|---|---|---|
| display | 28/34 | 700 | Screen titles ("Welcome Back"), profile name |
| title | 20/26 | 700 | Section headers, story-card text |
| heading | 17/22 | 600 | Button labels, list titles |
| body / bodyMedium | 15/21 | 400/500 | Body copy |
| label | 14/19 | 500 | Chips, small buttons |
| caption | 13/17 | 400 | Meta text, timestamps |
| overline | 12/16 | 600, +0.6 tracking, uppercase | "EDUCATION", "CHANNELS" |
| micro | 11/14 | 600 | Badges, "NEW" pill |

Text scales with the OS font size (capped at 1.6×).

## Spacing, radius, elevation
- Spacing (4-pt): 2, 4, 8, 12, 16, 24, 32, 48. Screen gutter 16.
- Radius: sm 6, md 10 (web `--radius`), lg 14 (inputs/buttons), xl 18 (cards), pill 999.
- Shadows: light `0 1 3 /6%`, medium `0 4 8 /8%` (primary button), heavy `0 8 16 /12%` (bottom action bar).
- Touch targets ≥ 48 dp (icon buttons, tab bar, list rows).

## Components (`src/components`)
| Component | Variants / notes |
|---|---|
| `AppText` | `variant` × `tone` (primary, secondary, tertiary, brand, error, success, onBrand) |
| `Button` | primary (brand fill + shadow), secondary, outline, ghost, danger, dangerOutline; sizes md (52 dp) / sm (36 dp pill); loading & disabled states |
| `TextField` | label, error, focus ring (brand), optional show/hide password toggle |
| `Avatar` | Cloudinary-resized image, initials fallback, green active dot, "NEW" pill |
| `ProfileTile` | Circular avatar + name / school (brand) / company (grey) — Discover grid & Home carousels |
| `Card` | 18 radius, 1 px border, light shadow, optional pressable |
| `Chip` | Filter chip with selected state & trailing chevron |
| `SelectSheet` | Bottom sheet replacement for web dropdowns: single/multi select, search, Apply/Clear |
| `Composer` | Pill input + round send button; keeps draft on failure |
| `LoadingView`, `ErrorView` (offline vs server copy + retry), `EmptyView` | State views |
| `IconButton`, `CountBadge`, `SectionHeader`, `Overline`, `Divider`, `Container` | Layout helpers; `Container` caps width at 720 dp on tablets/Chromebooks |
| `Logo`, `OfflineBanner` | Brand wordmark (tinted in dark mode); NetInfo-driven offline banner |

## Navigation pattern (mobile adaptation)
The website's phone layout uses a hamburger drawer. The app uses a **bottom tab bar** (Home, Discover, Spark, Chat, Profile) for one-handed reach, with Notifications and Settings in the top bar — the same destinations as the drawer. Web dropdown filters became **bottom sheets**; the profile modal became a **full screen with a sticky bottom action bar**.

## Responsive rules
- Discover grid: 3 columns < 600 dp, 4 columns ≥ 600 dp, 6 columns ≥ 1024 dp.
- Lists and forms are centred with max width 720 dp; login max width 440 dp.
- Tab bar labels move beside icons on wide screens (React Navigation default).
