/**
 * AppShell — every authenticated screen sits inside one of these.
 *
 * Navigation follows the window size class and nothing else (AGENTS.md rule 8):
 *
 *   compact   top bar + bottom navigation bar (≤ 5 destinations)
 *   medium    top bar + navigation rail
 *   expanded  top bar + navigation rail
 *   large     top bar + permanent drawer (rail if `railOnly`)
 *
 * The shell owns the page scroll container, the gutters and the content cap.
 * Screens render content only — they never re-declare padding or max width.
 *
 *   <AppShell
 *     title="Incidents"
 *     navigation={<Destinations />}
 *     drawer={<DestinationsExpanded />}
 *     actions={<Button variant="contained">New incident</Button>}
 *   >
 *     <IncidentList />
 *   </AppShell>
 */
import * as React from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { tokens } from '../../build/tokens';
import { useWindowSizeClass, gutterFor, type SizeClass } from './useWindowSizeClass';

export interface AppShellProps {
  /** Screen name. Sentence case, no app name — the shell is already the app. */
  title: string;
  children: React.ReactNode;
  /** Rail / bar destinations. Same set at every size class. */
  navigation?: React.ReactNode;
  /** Drawer contents at `large`. Falls back to `navigation` when omitted. */
  drawer?: React.ReactNode;
  /** Top-bar actions. At most one filled button. */
  actions?: React.ReactNode;
  /** Full-bleed content: maps, dashboards. Drops the gutters and the cap. */
  bleed?: boolean;
  /** Keep the rail at `large` instead of expanding to a drawer. */
  railOnly?: boolean;
  /** Force a size class. Tests and the docs page only. */
  sizeClass?: SizeClass;
}

export function AppShell({
  title,
  children,
  navigation,
  drawer,
  actions,
  bleed = false,
  railOnly = false,
  sizeClass,
}: AppShellProps) {
  const auto = useWindowSizeClass();
  const cls = sizeClass ?? auto;

  const side =
    cls === 'compact' ? 'bar' : cls === 'large' && !railOnly && (drawer ?? navigation) ? 'drawer' : 'rail';
  const gutter = gutterFor(cls);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns:
          side === 'drawer'
            ? `${tokens.layout.navDrawerWidth} minmax(0, 1fr)`
            : side === 'rail'
              ? `${tokens.layout.navRailWidth} minmax(0, 1fr)`
              : 'minmax(0, 1fr)',
        minHeight: '100dvh',
        backgroundColor: 'background.default',
      }}
    >
      {side !== 'bar' && navigation && (
        <Box
          component="nav"
          aria-label="Main"
          sx={{
            position: 'sticky',
            top: 0,
            alignSelf: 'start',
            height: '100dvh',
            overflowY: 'auto',
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          {side === 'drawer' ? (drawer ?? navigation) : navigation}
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar position="sticky" color="primary" elevation={0}>
          <Toolbar
            sx={{
              minHeight: tokens.layout.topBarHeight,
              gap: 2,
              paddingInline: gutter,
            }}
          >
            <Typography variant="h6" component="h1" sx={{ flex: 1, minWidth: 0 }} noWrap>
              {title}
            </Typography>
            {actions && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{actions}</Box>}
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: bleed ? 0 : gutter,
            paddingBottom:
              side === 'bar' ? `calc(${tokens.layout.navBarHeight} + ${gutter})` : undefined,
            ...(bleed
              ? {}
              : { maxWidth: tokens.layout.pageMaxWidth, width: '100%', marginInline: 'auto' }),
          }}
        >
          {children}
        </Box>
      </Box>

      {side === 'bar' && navigation && (
        <Box
          component="nav"
          aria-label="Main"
          sx={{
            position: 'fixed',
            insetInline: 0,
            bottom: 0,
            height: tokens.layout.navBarHeight,
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          {navigation}
        </Box>
      )}
    </Box>
  );
}

export default AppShell;
