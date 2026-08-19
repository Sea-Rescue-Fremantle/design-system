# Rescue MD3 — build rules

Design system for Marine Rescue Fremantle: the public website, the crew portal,
and every operational web application. Material Design 3 structure, brand-led skin.

Read this file before writing any UI. It is the contract; the docs page
(`Rescue Design System.dc.html`) is the visual reference for humans.

## Where things live

| Path | What | Editable |
| --- | --- | --- |
| `tokens.dtcg.json` | Source of truth. W3C DTCG format. | Yes — this is the only place a colour, size or duration is decided |
| `build/tokens.css` | CSS custom properties, both schemes, Material Web bridge | **No — generated** |
| `build/tokens.ts` | Typed token object, `StatusName`, `STATUS_ORDER` | **No — generated** |
| `src/theme.ts` | MUI `lightTheme` / `darkTheme`, `statusColors()` | Yes |
| `scripts/build-tokens.mjs` | The generator | Yes |

After editing `tokens.dtcg.json`, run `npm run tokens`. Never hand-edit `build/`.
Never import `tokens.dtcg.json` at runtime.

## Consuming the system

```ts
// React
import { lightTheme, darkTheme } from '@rescue/design-system/theme';
import { tokens, STATUS_ORDER, type StatusName } from '@rescue/design-system/tokens';
```

```html
<!-- Vanilla / Material Web: once, at the app entry point -->
<link rel="stylesheet" href="@rescue/design-system/tokens.css">
```

`build/tokens.css` also emits `--md-sys-*` aliases, so `@material/web`
components are themed by loading it and nothing else.

Dark scheme: `<html data-scheme="dark">`, or leave it off and
`prefers-color-scheme` decides. Use it for operational and night surfaces
(operations centre, vessel tablets). Light for public and intranet. Never a third.

## Rules

1. **No literals.** No hex, rgb(), named colour, font family, spacing px, radius
   or duration in application code. Everything from `tokens` or `var(--rmd-*)`.
   Missing value → add it to `tokens.dtcg.json`, don't inline it.
2. **Colour roles.** Navy is `primary` and carries the interface. Slate is
   `secondary`. Rescue orange is `tertiary` (MUI: `warning`) — a signal, spent
   on one thing per screen: the emergency action, or the urgent state. Never a
   background, never body text.
3. **One filled button per view.** Secondary actions are outlined, tertiary are
   text. Emergency actions: filled `warning`, `size="large"` (48px), always with
   an icon. Destructive actions: outlined `error`, confirmed by a dialog.
4. **Status is a closed set of seven** — `distress`, `urgent`, `advisory`,
   `onTask`, `standby`, `resolved`, `offline`. Always colour **plus icon plus
   label**; colour alone never carries meaning. Render with `<StatusChip>`, sort
   lists by `STATUS_ORDER` (severity-descending). `solid` variant only in dense
   tables and map pins.
5. **Sizes are floors, not suggestions.** Interactive targets ≥ 48px
   (`tokens.size.touchTarget`), inputs ≥ 56px, table rows 48px. Body text ≥ 14px
   in applications, ≥ 16px on the public site.
6. **Fields are outlined.** Filled text fields are not used. Label always
   visible; reserve helper-text space so layout doesn't jump on error.
7. **Icons: Material Symbols Rounded only** (`@mui/icons-material`). No second
   icon set, no hand-drawn SVG icons. 20px dense, 24px standard, 40px feature.
8. **Layout follows the window size class.** Compact → single column +
   navigation bar. Medium → navigation rail. Expanded+ → rail or permanent
   drawer, content capped at `tokens.size.contentMaxWidth`. Tables become
   two-line lists on compact; they never scroll sideways.
9. **Motion confirms, never decorates.** Four durations, `easing.standard`.
   Honour `prefers-reduced-motion`. Only `distress` may pulse.
10. **Every screen ships empty, loading and error states.** An improvised blank
    screen is an unfinished screen.
11. **Focus is visible.** 2px `primary` ring, 2px offset, on every interactive
    element. Never remove an outline without replacing it.
12. **Copy is plain and calm.** Sentence case everywhere including buttons.
    24-hour time (`HHMM` in radio and incident contexts). Australian English.
    Numerals for quantities. No exclamation marks in operational UI.

## Component selection

| Need | Use |
| --- | --- |
| Highest-priority action | Filled button — one per view |
| Secondary / low-priority | Outlined / text button |
| Emergency, distress | Filled `warning`, `size="large"`, with icon |
| Destructive | Outlined `error` + confirmation dialog |
| Single-select ≤ 4 options | Segmented button |
| Single-select ≥ 5 options | Select |
| Multi-select filters | Filter chips |
| Record state | `<StatusChip>` |
| ≥ 5 tabular records | Data table, sticky header |
| Summary / public content | Card (outlined; elevated only when floating) |
| Transient confirmation | Snackbar |
| Blocking confirmation | Dialog |
| Top-level nav, expanded | Navigation rail or drawer |
| Top-level nav, compact | Navigation bar, ≤ 5 destinations |
| Sibling views in one screen | Tabs, ≤ 5 |

## Identifiers and data

Callsigns, coordinates, times and record IDs are set in
`tokens.font.family.mono` with tabular numerals. Numerals in tables are
right-aligned. Reference format: `INC-YYYY-NNNN`.

## Email

Email ignores this system's CSS. Tables, inline styles, 600px max width, no web
fonts (Arial substitutes), navy header, one filled CTA at 44px, body ≥ 16px.
Lint rules are disabled under `**/email/**` — literals are correct there.

## Checks

```bash
npm run tokens      # regenerate build/ from tokens.dtcg.json
npm run lint        # eslint + stylelint — both fail on literals
npm run lint:css
```

`npm run tokens` must produce no git diff in CI. If it does, someone edited
`build/` by hand.
