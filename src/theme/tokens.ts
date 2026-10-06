/**
 * Design tokens mirrored from the Icebreaker web app's CSS custom properties
 * (`:root` and `.dark` on joinicebreaker.com). See docs/design-system.md.
 */

export type ColorScheme = 'light' | 'dark';

export interface Palette {
  brandBlue: string;
  brandIce: string;
  brandNavy: string;
  brandIcy: string;
  /** Wordmark text colour (navy on light, near-white on dark). */
  brandNavyText: string;
  background: string;
  surfacePrimary: string;
  surfaceSecondary: string;
  surfaceTertiary: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  borderPrimary: string;
  borderSecondary: string;
  inputBackground: string;
  success: string;
  error: string;
  warning: string;
  contextBg: string;
  contextText: string;
  onBrand: string;
  overlay: string;
  bubbleMine: string;
  bubbleTheirs: string;
  onBubbleMine: string;
  projectChipBg: string;
  projectChipText: string;
}

export const palettes: Record<ColorScheme, Palette> = {
  light: {
    brandBlue: '#255b7d',
    brandIce: '#2fb5d8',
    brandNavy: '#001c33',
    brandIcy: '#389db9',
    brandNavyText: '#0d3350',
    background: '#ffffff',
    surfacePrimary: '#ffffff',
    surfaceSecondary: '#f5f7f9',
    surfaceTertiary: '#edeff0',
    textPrimary: '#0e1216',
    textSecondary: '#5f6469',
    textTertiary: '#8c9094',
    borderPrimary: '#dcdee0',
    borderSecondary: '#ccced0',
    inputBackground: '#fafafa',
    success: '#2f9f3d',
    error: '#cc272e',
    warning: '#e99b2a',
    contextBg: '#f4e3bf',
    contextText: '#372c15',
    onBrand: '#ffffff',
    overlay: 'rgba(0,0,0,0.45)',
    bubbleMine: '#255b7d',
    bubbleTheirs: '#f3f4f6',
    onBubbleMine: '#ffffff',
    projectChipBg: '#f1edfd',
    projectChipText: '#6b4fd8',
  },
  dark: {
    brandBlue: '#2fb5d8',
    brandIce: '#12cbf5',
    brandNavy: '#000c1a',
    brandIcy: '#25afd2',
    brandNavyText: '#eceff2',
    background: '#070e16',
    surfacePrimary: '#070e16',
    surfaceSecondary: '#0f171f',
    surfaceTertiary: '#182029',
    textPrimary: '#eceff2',
    textSecondary: '#9b9fa3',
    textTertiary: '#6f7274',
    borderPrimary: '#282f35',
    borderSecondary: '#353b42',
    inputBackground: '#0f171f',
    success: '#4db956',
    error: '#f14d4c',
    warning: '#faab3f',
    contextBg: '#443922',
    contextText: '#daccb1',
    onBrand: '#001c33',
    overlay: 'rgba(0,0,0,0.6)',
    bubbleMine: '#2fb5d8',
    bubbleTheirs: '#182029',
    onBubbleMine: '#001c33',
    projectChipBg: '#231c3d',
    projectChipText: '#b8a6ff',
  },
};

/** 4-pt spacing scale. */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Web `--radius` is .625rem (10px); inputs/buttons use ~14-16px, cards ~16px. */
export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  pill: 999,
} as const;

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontFamily: fontFamily.bold },
  title: { fontSize: 20, lineHeight: 26, fontFamily: fontFamily.bold },
  heading: { fontSize: 17, lineHeight: 22, fontFamily: fontFamily.semibold },
  body: { fontSize: 15, lineHeight: 21, fontFamily: fontFamily.regular },
  bodyMedium: { fontSize: 15, lineHeight: 21, fontFamily: fontFamily.medium },
  label: { fontSize: 14, lineHeight: 19, fontFamily: fontFamily.medium },
  caption: { fontSize: 13, lineHeight: 17, fontFamily: fontFamily.regular },
  micro: { fontSize: 11, lineHeight: 14, fontFamily: fontFamily.semibold },
  overline: { fontSize: 12, lineHeight: 16, fontFamily: fontFamily.semibold, letterSpacing: 0.6 },
} as const;

/** Web shadows: light 0 1px 3px /6%, medium 0 4px 8px /8%, heavy 0 8px 16px /12%. */
export const shadows = {
  light: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  medium: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  heavy: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
} as const;

/** Minimum touch target (Android Material guideline). */
export const touchTarget = 48;

/** Layout breakpoints (dp). */
export const breakpoints = {
  tablet: 600,
  desktop: 1024,
} as const;

/** Max content width on tablets / Chromebooks so lines stay readable. */
export const maxContentWidth = 720;
