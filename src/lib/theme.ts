/**
 * Theme configuration for the application.
 *
 * To switch themes, change the THEME environment variable in .env.local:
 *   NEXT_PUBLIC_THEME=default  (dark mode)
 *   NEXT_PUBLIC_THEME=homegate (Homegate style)
 */

export const THEMES = ['default', 'homegate'] as const;
export type Theme = (typeof THEMES)[number];

export function getTheme(): Theme {
  const envTheme = process.env.NEXT_PUBLIC_THEME;
  if (envTheme && THEMES.includes(envTheme as Theme)) {
    return envTheme as Theme;
  }
  return 'default';
}

export function isHomegateTheme(): boolean {
  return getTheme() === 'homegate';
}

