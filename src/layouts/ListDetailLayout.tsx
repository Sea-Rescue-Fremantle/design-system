/**
 * ListDetailLayout — incidents, vessels, members.
 *
 *   compact / medium   one pane at a time. The list is the screen; selecting a
 *                      record replaces it, with a back affordance. `selected`
 *                      decides which is showing.
 *   expanded / large   list pane at a fixed 400px, detail fills the rest. The
 *                      list keeps its own scroll; the detail keeps its own.
 *
 * The list never becomes a sidebar of the detail — it is a peer that happens to
 * be narrower, so its own scroll position survives selection.
 *
 *   <ListDetailLayout
 *     list={<IncidentList onSelect={setId} />}
 *     detail={id ? <Incident id={id} /> : <SelectARecord />}
 *     selected={Boolean(id)}
 *     onBack={() => setId(null)}
 *   />
 */
import * as React from 'react';
import Box from '@mui/material/Box';

import { tokens } from '../../build/tokens';
import { useWindowSizeClass, gutterFor, atLeast, type SizeClass } from './useWindowSizeClass';

export interface ListDetailLayoutProps {
  list: React.ReactNode;
  detail: React.ReactNode;
  /** Whether a record is open. Decides which pane shows on compact and medium. */
  selected?: boolean;
  /** Called by the detail's back affordance on compact and medium. */
  onBack?: () => void;
  /** Placeholder for the detail pane when nothing is selected (two-pane only). */
  empty?: React.ReactNode;
  sizeClass?: SizeClass;
}

export function ListDetailLayout({
  list,
  detail,
  selected = false,
  onBack,
  empty,
  sizeClass,
}: ListDetailLayoutProps) {
  const auto = useWindowSizeClass();
  const cls = sizeClass ?? auto;
  const twoPane = atLeast(cls, 'expanded');
  const gutter = gutterFor(cls);

  if (!twoPane) {
    return (
      <Box sx={{ minWidth: 0, flex: 1 }} data-back={onBack ? 'available' : undefined}>
        {selected ? detail : list}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `${tokens.layout.listPaneWidth} minmax(${tokens.layout.detailPaneMinWidth}, 1fr)`,
        gap: gutter,
        alignItems: 'start',
        flex: 1,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          position: 'sticky',
          top: tokens.layout.topBarHeight,
          maxHeight: `calc(100dvh - ${tokens.layout.topBarHeight})`,
          overflowY: 'auto',
          minWidth: 0,
        }}
      >
        {list}
      </Box>
      <Box sx={{ minWidth: 0 }}>{selected ? detail : (empty ?? detail)}</Box>
    </Box>
  );
}

export default ListDetailLayout;
