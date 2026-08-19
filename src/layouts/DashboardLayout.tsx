/**
 * DashboardLayout — the operations dashboard.
 *
 * The map is the primary region: it takes the space, the tiles read around it.
 * Arrangement by size class:
 *
 *   compact   no map. The incident list is the screen; a "Map" destination
 *             opens it full-screen instead (a map under 420px tall is a toy).
 *   medium    map on top at its floor height, tiles stacked beneath.
 *   expanded  map left, supporting pane right, tiles in a row beneath.
 *   large     same, map taller — it grows with the viewport.
 *
 * Tiles are a fluid track: `repeat(auto-fit, minmax(tileMinWidth, 1fr))`.
 * Never a fixed column count.
 *
 *   <DashboardLayout
 *     map={<OperationsMap />}
 *     supporting={<ActiveTaskings />}
 *     compactFallback={<IncidentList />}
 *     tiles={[<CrewOnWater />, <VesselStatus />, <Weather />]}
 *   />
 */
import * as React from 'react';
import Box from '@mui/material/Box';

import { tokens } from '../../build/tokens';
import { useWindowSizeClass, gutterFor, atLeast, type SizeClass } from './useWindowSizeClass';

export interface DashboardLayoutProps {
  /** The map. Rendered at every size class except compact. */
  map: React.ReactNode;
  /** Tiles beneath the map. Sort by severity, not by name. */
  tiles?: React.ReactNode[];
  /** Right-hand pane at expanded and above: taskings, crew, radio log. */
  supporting?: React.ReactNode;
  /** What compact shows instead of the map. Required if compact is supported. */
  compactFallback?: React.ReactNode;
  sizeClass?: SizeClass;
}

export function DashboardLayout({
  map,
  tiles = [],
  supporting,
  compactFallback,
  sizeClass,
}: DashboardLayoutProps) {
  const auto = useWindowSizeClass();
  const cls = sizeClass ?? auto;
  const gutter = gutterFor(cls);
  const twoPane = atLeast(cls, 'expanded') && Boolean(supporting);

  if (cls === 'compact' && compactFallback) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: gutter, minWidth: 0 }}>
        {compactFallback}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: gutter, minWidth: 0, flex: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gap: gutter,
          gridTemplateColumns: twoPane
            ? `minmax(${tokens.layout.detailPaneMinWidth}, 1fr) ${tokens.layout.supportingPaneWidth}`
            : 'minmax(0, 1fr)',
          alignItems: 'stretch',
        }}
      >
        <Box
          sx={{
            minHeight: tokens.layout.mapMinHeight,
            height: atLeast(cls, 'large') ? '52dvh' : tokens.layout.mapMinHeight,
            borderRadius: tokens.shape.md,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          {map}
        </Box>
        {twoPane && <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>{supporting}</Box>}
      </Box>

      {tiles.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gap: gutter,
            gridTemplateColumns: `repeat(auto-fit, minmax(${tokens.layout.tileMinWidth}, 1fr))`,
          }}
        >
          {tiles.map((tile, i) => (
            <Box key={i} sx={{ minWidth: 0 }}>
              {tile}
            </Box>
          ))}
        </Box>
      )}

      {!twoPane && supporting}
    </Box>
  );
}

export default DashboardLayout;
