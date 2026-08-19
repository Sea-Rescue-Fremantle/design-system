import * as React from 'react';
import Box from '@mui/material/Box';
import SosRounded from '@mui/icons-material/SosRounded';
import PriorityHighRounded from '@mui/icons-material/PriorityHighRounded';
import InfoRounded from '@mui/icons-material/InfoRounded';
import DirectionsBoatRounded from '@mui/icons-material/DirectionsBoatRounded';
import PauseCircleRounded from '@mui/icons-material/PauseCircleRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import CloudOffRounded from '@mui/icons-material/CloudOffRounded';

import { tokens, STATUS_ORDER, type StatusName } from '../../build/tokens';
import { statusColors } from '../theme';

/**
 * StatusChip — the only sanctioned way to render a record's state.
 *
 * Colour never carries meaning alone: this component always renders colour,
 * icon and label together. That is why applications must not colour a plain
 * MUI <Chip> themselves (the ESLint config enforces it).
 *
 * The vocabulary is closed. To add a state, add it to `tokens.dtcg.json`
 * under `color.status`, then add its icon and label here — in that order.
 */

const ICONS: Record<StatusName, typeof SosRounded> = {
  distress: SosRounded,
  urgent: PriorityHighRounded,
  advisory: InfoRounded,
  onTask: DirectionsBoatRounded,
  standby: PauseCircleRounded,
  resolved: CheckCircleRounded,
  offline: CloudOffRounded,
};

const LABELS: Record<StatusName, string> = {
  distress: 'Distress',
  urgent: 'Urgent',
  advisory: 'Advisory',
  onTask: 'On task',
  standby: 'Standby',
  resolved: 'Resolved',
  offline: 'Offline',
};

export interface StatusChipProps {
  status: StatusName;
  /**
   * `tinted` (default) everywhere. `solid` only in dense tables and map pins,
   * where a fill is what reads at a glance.
   */
  variant?: 'tinted' | 'solid';
  /**
   * Distress may pulse — nothing else ever animates. Ignored for other
   * statuses and under `prefers-reduced-motion`.
   */
  pulse?: boolean;
  /** Hide the text label. Only legal inside a column already headed "Status". */
  iconOnly?: boolean;
  className?: string;
}

export function StatusChip({
  status,
  variant = 'tinted',
  pulse = false,
  iconOnly = false,
  className,
}: StatusChipProps) {
  const Icon = ICONS[status];
  const label = LABELS[status];
  const colors = statusColors(status, variant);
  const dense = variant === 'solid';
  const animate = pulse && status === 'distress';

  return (
    <Box
      component="span"
      className={className}
      role="status"
      aria-label={iconOnly ? label : undefined}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        height: dense ? 24 : 28,
        paddingInline: dense ? 1.125 : 1.25,
        borderRadius: tokens.shape.sm,
        ...colors,
        fontFamily: tokens.type.labelMedium.fontFamily,
        fontSize: dense ? tokens.type.labelSmall.fontSize : tokens.type.labelMedium.fontSize,
        fontWeight: tokens.type.labelMedium.fontWeight,
        letterSpacing: tokens.type.labelMedium.letterSpacing,
        whiteSpace: 'nowrap',
        ...(animate && {
          animation: `rmd-distress-pulse ${tokens.duration.extraLong} ${tokens.easing.standard} 3`,
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          '@keyframes rmd-distress-pulse': {
            '0%, 100%': { boxShadow: `0 0 0 0 ${tokens.color.status.distress.solid}80` },
            '50%': { boxShadow: `0 0 0 6px ${tokens.color.status.distress.solid}00` },
          },
        }),
      }}
    >
      <Icon aria-hidden sx={{ fontSize: dense ? 14 : 16 }} />
      {!iconOnly && label}
    </Box>
  );
}

/**
 * Comparator for severity-descending order. Every status list in every
 * application sorts with this — a roster that sorts alphabetically buries
 * a distress call under "Advisory".
 */
export function compareStatus(a: StatusName, b: StatusName): number {
  return STATUS_ORDER.indexOf(a) - STATUS_ORDER.indexOf(b);
}

/** Sort any records carrying a status, severity-descending. */
export function bySeverity<T>(getStatus: (item: T) => StatusName) {
  return (a: T, b: T) => compareStatus(getStatus(a), getStatus(b));
}

export default StatusChip;
