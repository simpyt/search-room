/**
 * Consolidated theme-aware style utilities.
 *
 * Instead of scattering `isHomegateTheme()` conditionals throughout components,
 * use these pre-built class strings that leverage CSS custom properties.
 *
 * The CSS variables are defined in globals.css for both .theme-homegate and .dark
 */

// =============================================================================
// Button Styles
// =============================================================================

/** Primary action button - uses theme primary color with hover state */
export const btnPrimary =
  'bg-primary text-primary-foreground hover:bg-primary-hover transition-colors';

/** Primary button that also works on dark backgrounds */
export const btnPrimaryContrast =
  'bg-primary text-white hover:bg-primary-hover transition-colors';

/** Ghost/outline button */
export const btnGhost =
  'bg-transparent hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors';

/** Secondary button */
export const btnSecondary =
  'bg-secondary text-secondary-foreground hover:bg-muted transition-colors';

// =============================================================================
// Surface Styles
// =============================================================================

/** Card/panel surface */
export const surface = 'bg-surface border border-border-subtle';

/** Elevated card (modals, dropdowns) */
export const surfaceElevated = 'bg-surface-elevated border border-border-subtle shadow-lg';

/** Muted/subdued surface */
export const surfaceMuted = 'bg-muted/50 border border-border-subtle';

// =============================================================================
// Text Styles
// =============================================================================

/** Primary heading text */
export const textPrimary = 'text-text-primary';

/** Secondary/body text */
export const textSecondary = 'text-text-secondary';

/** Muted/helper text */
export const textMuted = 'text-text-muted';

// =============================================================================
// Badge/Chip Styles
// =============================================================================

/** Soft primary badge (light background, primary text) */
export const badgePrimarySoft =
  'bg-primary-soft text-primary-soft-foreground';

/** Primary solid badge */
export const badgePrimary = 'bg-primary text-primary-foreground';

// =============================================================================
// Icon Container Styles
// =============================================================================

/** Soft icon container with primary color */
export const iconContainerSoft =
  'flex items-center justify-center rounded-full bg-primary-soft text-primary-soft-foreground';

/** Primary solid icon container */
export const iconContainerPrimary =
  'flex items-center justify-center rounded-full bg-primary text-primary-foreground';

// =============================================================================
// Input Styles
// =============================================================================

/** Standard text input */
export const inputBase =
  'bg-surface border-input text-text-primary placeholder:text-text-muted';

// =============================================================================
// Card Styles
// =============================================================================

/** Standard card */
export const card = 'bg-card border-border-subtle';

/** Interactive card with hover */
export const cardInteractive =
  'bg-card border-border-subtle hover:border-border hover:shadow-md transition-all cursor-pointer';

// =============================================================================
// Loading/Spinner Styles
// =============================================================================

/** Spinner using primary color */
export const spinner = 'animate-spin rounded-full border-b-2 border-primary';

// =============================================================================
// Combined utilities for common patterns
// =============================================================================

/** View toggle button - active state */
export const viewToggleActive = 'bg-surface-elevated text-text-primary shadow-sm';

/** View toggle button - inactive state */
export const viewToggleInactive = 'text-text-muted hover:text-text-primary';

/**
 * Helper to conditionally join class names
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
