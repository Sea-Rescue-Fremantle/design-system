/**
 * RecordLayout — one incident, one vessel, one member.
 *
 * A record page answers three questions in a fixed order: what is this, what
 * state is it in, what can I do about it. So the header carries the identifier
 * (mono, tabular), the StatusChip and the actions — and it stays put while the
 * body scrolls.
 *
 *   compact / medium   single column; the supporting pane falls below the body.
 *   expanded / large   body left at prose measure, supporting pane right at
 *                      360px (activity, crew, attachments).
 *
 *   <RecordLayout
 *     identifier="INC-2026-0431"
 *     heading="Vessel adrift, Rottnest channel"
 *     status={<StatusChip status="onTask" />}
 *     actions={<Button color="warning" variant="contained" size="large">Task vessel</Button>}
 *     supporting={<ActivityLog />}
 *   >
 *     <IncidentDetails />
 *   </RecordLayout>
 */
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { tokens } from '../../build/tokens';
import { useWindowSizeClass, gutterFor, atLeast, type SizeClass } from './useWindowSizeClass';

export interface RecordLayoutProps {
  /** Record ID — `INC-YYYY-NNNN`, a callsign, a member number. Rendered mono. */
  identifier?: string;
  heading: string;
  /** A single <StatusChip>. Records without a state omit it. */
  status?: React.ReactNode;
  /** One filled action at most. Emergency actions are filled `warning`, large. */
  actions?: React.ReactNode;
  /** Tabs for sibling views within the record, ≤ 5. */
  tabs?: React.ReactNode;
  children: React.ReactNode;
  supporting?: React.ReactNode;
  sizeClass?: SizeClass;
}

export function RecordLayout({
  identifier,
  heading,
  status,
  actions,
  tabs,
  children,
  supporting,
  sizeClass,
}: RecordLayoutProps) {
  const auto = useWindowSizeClass();
  const cls = sizeClass ?? auto;
  const twoPane = atLeast(cls, 'expanded') && Boolean(supporting);
  const gutter = gutterFor(cls);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: gutter, minWidth: 0, flex: 1 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          gap: 2,
          paddingBottom: tokens.space.sm,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1, minWidth: 0 }}>
          {identifier && (
            <Typography
              component="p"
              variant="body2"
              sx={{
                fontFamily: tokens.font.family.mono,
                fontVariantNumeric: 'tabular-nums',
                color: 'text.secondary',
              }}
            >
              {identifier}
            </Typography>
          )}
          <Typography variant="h5" component="h2" sx={{ textWrap: 'pretty' }}>
            {heading}
          </Typography>
          {status && <Box sx={{ paddingTop: 0.5 }}>{status}</Box>}
        </Box>
        {actions && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>{actions}</Box>
        )}
      </Box>

      {tabs}

      <Box
        sx={{
          display: 'grid',
          gap: gutter,
          gridTemplateColumns: twoPane
            ? `minmax(0, 1fr) ${tokens.layout.supportingPaneWidth}`
            : 'minmax(0, 1fr)',
          alignItems: 'start',
        }}
      >
        <Box sx={{ minWidth: 0, maxWidth: tokens.layout.readingMaxWidth }}>{children}</Box>
        {supporting && <Box sx={{ minWidth: 0 }}>{supporting}</Box>}
      </Box>
    </Box>
  );
}

export default RecordLayout;
