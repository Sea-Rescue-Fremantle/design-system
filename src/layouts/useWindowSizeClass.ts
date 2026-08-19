/**
 * Window size class — the only thing layouts are allowed to branch on.
 *
 * Material's four classes, mapped onto the theme's breakpoints (which come
 * from tokens.breakpoint):
 *
 *   compact   < 600   phone portrait, vessel handhelds
 *   medium    600+    tablet portrait, phone landscape
 *   expanded  840+    tablet landscape, small laptop
 *   large     1200+   desktop, operations centre
 *
 * Nothing else adapts on its own. If a screen needs a fifth arrangement, it
 * needs a different layout, not a new breakpoint.
 */
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import { tokens } from '../../build/tokens';

export type SizeClass = 'compact' | 'medium' | 'expanded' | 'large';

/** True from `cls` upwards — `atLeast('expanded')` covers expanded and large. */
export const SIZE_ORDER: readonly SizeClass[] = ['compact', 'medium', 'expanded', 'large'];

export function useWindowSizeClass(): SizeClass {
  const theme = useTheme();
  const medium = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: false });
  const expanded = useMediaQuery(theme.breakpoints.up('md'));
  const large = useMediaQuery(theme.breakpoints.up('lg'));

  if (large) return 'large';
  if (expanded) return 'expanded';
  if (medium) return 'medium';
  return 'compact';
}

export function atLeast(current: SizeClass, target: SizeClass): boolean {
  return SIZE_ORDER.indexOf(current) >= SIZE_ORDER.indexOf(target);
}

/** Gutter for a size class. Never hand-pick page padding — ask this. */
export function gutterFor(cls: SizeClass): string {
  if (cls === 'compact') return tokens.gutter.compact;
  if (cls === 'medium') return tokens.gutter.medium;
  return tokens.gutter.expanded;
}
