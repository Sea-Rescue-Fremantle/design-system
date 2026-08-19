/**
 * Touch targets.
 *
 * The rule is 48px, and it is about the hit area, not the ink. A 24px icon is a
 * 24px glyph inside a 48px box; a 40px chip on a vessel tablet gets 4px of
 * invisible slop on each side. Adjacent targets keep 8px of clear space between
 * them, so a wet thumb that lands between two rows hits neither rather than the
 * wrong one.
 *
 *   <TouchTarget><Chip label="Rottnest" onClick={filter} /></TouchTarget>
 *
 *   <IconButton sx={touchTargetSx()}><CloseRounded /></IconButton>
 *
 *   <Box sx={targetRowSx}>…adjacent controls…</Box>
 *
 * Everything here reads `tokens.size.touchTarget`. Nothing overrides it: a
 * design that needs a smaller control needs fewer controls.
 */
import * as React from 'react';
import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

import { tokens } from '../../build/tokens';

/**
 * Minimum box for anything tappable. Spread into `sx` on an `IconButton`,
 * a `Chip` with `onClick`, or any custom control.
 */
export function touchTargetSx(): SxProps<Theme> {
  return {
    minWidth: tokens.size.touchTarget,
    minHeight: tokens.size.touchTarget,
  };
}

/** The 48px box around a 24px icon. Icon buttons use this, not `size="small"`. */
export function iconButtonSx(): SxProps<Theme> {
  return {
    width: tokens.size.iconButtonBox,
    height: tokens.size.iconButtonBox,
  };
}

/** Row or column of adjacent targets, at the minimum clear space between them. */
export const targetRowSx: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: tokens.size.touchTargetGap,
  alignItems: 'center',
};

export interface TouchTargetProps {
  children: React.ReactNode;
  /**
   * `pad` (default) grows the box to 48px — safe in flex and grid layouts.
   * `slop` keeps the visual size and extends the hit area outwards with a
   * pseudo-element, for controls whose size is deliberate (dense table rows,
   * map pins, chips in a scroller).
   */
  mode?: 'pad' | 'slop';
  className?: string;
}

export function TouchTarget({ children, mode = 'pad', className }: TouchTargetProps) {
  if (mode === 'slop') {
    return (
      <Box
        className={className}
        sx={{
          position: 'relative',
          display: 'inline-flex',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: tokens.size.touchTarget,
            minHeight: tokens.size.touchTarget,
            width: '100%',
            height: '100%',
          },
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      className={className}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: tokens.size.touchTarget,
        minHeight: tokens.size.touchTarget,
      }}
    >
      {children}
    </Box>
  );
}

export default TouchTarget;
