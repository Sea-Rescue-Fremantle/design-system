/**
 * SearchResultsLayout — one search across incidents, vessels, members, documents.
 *
 *   compact / medium   query summary, filter chips in a horizontal scroller,
 *                      results.
 *   expanded / large   filters in a 400px left rail, results beside them at
 *                      prose measure.
 *
 * The result count and the active filters are always visible: a crew member
 * looking for a callsign needs to know whether a filter is hiding it. Results
 * carrying a status sort by severity first, then by recency.
 *
 *   <SearchResultsLayout
 *     query="rottnest"
 *     count={18}
 *     filters={<FilterChips />}
 *     facets={<TypeFacets />}
 *   >
 *     <ResultList />
 *   </SearchResultsLayout>
 */
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { tokens } from '../../build/tokens';
import { useWindowSizeClass, gutterFor, atLeast, type SizeClass } from './useWindowSizeClass';

export interface SearchResultsLayoutProps {
  query: string;
  /** Total matches. `undefined` while loading — render the skeleton, not zero. */
  count?: number;
  children: React.ReactNode;
  /** Filter chips. Shown at every size class, above the results on compact. */
  filters?: React.ReactNode;
  /** Facet groups for the rail at expanded and above. */
  facets?: React.ReactNode;
  /** Sort control. Right of the count. */
  sort?: React.ReactNode;
  sizeClass?: SizeClass;
}

export function SearchResultsLayout({
  query,
  count,
  children,
  filters,
  facets,
  sort,
  sizeClass,
}: SearchResultsLayoutProps) {
  const auto = useWindowSizeClass();
  const cls = sizeClass ?? auto;
  const rail = atLeast(cls, 'expanded') && Boolean(facets);
  const gutter = gutterFor(cls);

  const summary =
    count === undefined
      ? `Searching for “${query}”`
      : `${count} ${count === 1 ? 'result' : 'results'} for “${query}”`;

  return (
    <Box
      sx={{
        display: 'grid',
        gap: gutter,
        gridTemplateColumns: rail ? `${tokens.layout.listPaneWidth} minmax(0, 1fr)` : 'minmax(0, 1fr)',
        alignItems: 'start',
        flex: 1,
        minWidth: 0,
      }}
    >
      {rail && (
        <Box
          component="aside"
          aria-label="Filters"
          sx={{
            position: 'sticky',
            top: tokens.layout.topBarHeight,
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.space.lg,
            minWidth: 0,
          }}
        >
          {facets}
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: tokens.space.lg, minWidth: 0 }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography variant="h6" component="h2" aria-live="polite" sx={{ minWidth: 0 }}>
            {summary}
          </Typography>
          {sort}
        </Box>

        {filters && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: rail ? 'wrap' : 'nowrap',
              overflowX: rail ? 'visible' : 'auto',
              paddingBottom: rail ? 0 : tokens.space.xs,
            }}
          >
            {filters}
          </Box>
        )}

        <Box sx={{ minWidth: 0, maxWidth: tokens.layout.readingMaxWidth }}>{children}</Box>
      </Box>
    </Box>
  );
}

export default SearchResultsLayout;
