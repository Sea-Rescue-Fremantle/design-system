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
| `src/components/` | `StatusChip`, `Field`, `TouchTarget` — the guaranteed components | Yes |
| `src/layouts/` | The seven page layouts + `useWindowSizeClass` | Yes |
| `assets/pwa/` | Manifest, icons and the `<head>` block for installable apps | Yes — regenerate icons from `assets/mark-white.svg`, don’t hand-draw |
| `scripts/build-tokens.mjs` | The generator | Yes |

After editing `tokens.dtcg.json`, run `npm run tokens`. Never hand-edit `build/`.
Never import `tokens.dtcg.json` at runtime.

## Consuming the system

```ts
// React
import { lightTheme, darkTheme } from '@rescue/design-system/theme';
import { tokens, STATUS_ORDER, type StatusName } from '@rescue/design-system/tokens';
import { AppShell, DashboardLayout } from '@rescue/design-system/layouts';
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
   in applications, ≥ 16px on the public site. The floor is the hit area, not
   the ink — see “Touch targets” below.
6. **Fields are outlined.** Filled text fields are not used. Label always
   visible; reserve helper-text space so layout doesn’t jump on error. Render
   with `<Field>` — see “Fields” below.
7. **Icons: Material Symbols Rounded only** (`@mui/icons-material`). No second
   icon set, no hand-drawn SVG icons. 20px dense, 24px standard, 40px feature.
8. **Layout follows the window size class.** Compact → single column +
   navigation bar. Medium → navigation rail. Expanded+ → rail or permanent
   drawer, content capped at `tokens.size.contentMaxWidth`. Tables become
   two-line lists on compact; they never scroll sideways. Never write a page
   shell, gutter or column grid by hand — use a layout from `src/layouts/`
   (below) and read the size class from `useWindowSizeClass()`, never from
   `window.innerWidth`.
9. **Motion confirms, never decorates.** Four durations, `easing.standard`.
   Honour `prefers-reduced-motion`. Only `distress` may pulse.
10. **Every screen ships empty, loading and error states.** An improvised blank
    screen is an unfinished screen.
11. **Focus is visible.** 2px `primary` ring, 2px offset, on every interactive
    element. Never remove an outline without replacing it.
12. **Copy is plain and calm.** Sentence case everywhere including buttons.
    24-hour time (`HHMM` in radio and incident contexts). Australian English.
    Numerals for quantities. No exclamation marks in operational UI.

## Page layouts

Every screen is one of seven layouts. There is no eighth: a screen that fits
none of these is a screen whose job isn't decided yet. All of them take an
optional `sizeClass` override for tests and the docs page; in an application
they read the window themselves.

| Layout | Use for | Regions |
| --- | --- | --- |
| `AppShell` | Every authenticated screen — wraps one of the six below | Top bar 64px, nav (bar 80 / rail 80 / drawer 360), main |
| `DashboardLayout` | Operations dashboard, watch overview | Map (primary, ≥ 420px), supporting pane 360, fluid tile track ≥ 320 |
| `ListDetailLayout` | Incidents, vessels, members, documents | List pane 400 + detail ≥ 480; one pane at a time below expanded |
| `RecordLayout` | One incident, vessel, member | Sticky identity header (ID, status, actions), body at 680, supporting pane 360 |
| `FormLayout` | Logging, editing, multi-step reports | Single column at 720. Actions pinned to the bottom on compact |
| `AuthLayout` | Sign in, code entry, session expired | One 440 card on the navy ground. Nothing else |
| `SearchResultsLayout` | Search across record types | Facet rail 400 + results at 680; chips scroll horizontally on compact |

Rules that hold across all of them:

1. **Regions are token-sized, content is fluid.** Rail, drawer, list pane,
   supporting pane and tile minimum come from `tokens.layout.*`. Never a
   hand-picked width, never a fixed column count — dashboards use
   `repeat(auto-fit, minmax(tokens.layout.tileMinWidth, 1fr))`.
2. **The shell owns padding and the content cap.** Gutters come from
   `gutterFor(sizeClass)` (16 / 24 / 32). A screen that sets its own page
   padding or `maxWidth` is fighting the shell.
3. **One layout per screen.** Layouts nest only as `AppShell` → one other.
4. **Two panes are peers.** In list-detail the list keeps its own scroll and
   its own selection; it is not a sidebar that resets when a record opens.
5. **The map is the dashboard's primary region** and never appears below
   `tokens.layout.mapMinHeight`. On compact there is no map: render
   `compactFallback` (the list) and open the map as its own destination.
6. **Forms stay one column at every size class.** Two-column forms cause
   mis-keyed data, and this is where incidents get logged.
7. **Bottom-pinned actions on compact only** — thumbs there, mouse elsewhere.
8. **Prose has a measure.** Record bodies and results cap at
   `tokens.layout.readingMaxWidth`, forms at `formMaxWidth`. Full-width
   paragraphs are unreadable on a 27-inch operations screen.

## Fields

Every text input is `<Field>` (`src/components/Field.tsx`). A bare MUI
`TextField` allows a dozen combinations this system does not, so the wrapper
closes them off and the lint rules back it up.

| Contract | Value |
| --- | --- |
| Variant | Outlined. Filled and standard are never used |
| Height | `tokens.size.fieldHeight` (56px); multiline grows from `rows` |
| Label | Always visible, sentence case. A placeholder is an example, never a label |
| Helper text | Space always reserved (`tokens.size.helperTextHeight`), 14px, so an error never shifts the fields below it |
| Required | The default. Mark the exceptions with `optional` — most fields in an incident report are required |
| Errors | `error` + helper text saying what to do, announced politely. Never colour alone |
| Layout | One field per line, in a `<FieldGroup>`. Two inputs on one line is how a latitude ends up in a longitude |

`kind` fixes keyboard, autocomplete, casing and alignment — pick the kind, never
hand-set `inputMode`:

| kind | Keyboard | Renders |
| --- | --- | --- |
| `text`, `multiline`, `search` | Text | Body font |
| `number`, `time`, `position`, `phone` | Numeric / decimal / tel | Mono, tabular numerals |
| `callsign` | Text, uppercased | Mono |
| `date` | Native date | Mono |
| `email` | Email | Body font |

## Touch targets

The floor is the **hit area**, not the ink.

| Contract | Value |
| --- | --- |
| Any tappable control | ≥ `tokens.size.touchTarget` (48px) in both axes |
| Icon button | `tokens.size.iconButtonBox` (48px) around a 24px glyph — `sx={iconButtonSx()}` |
| Between adjacent targets | ≥ `tokens.size.touchTargetGap` (8px) clear — `targetRowSx` |
| Table rows | `tokens.size.rowHeight` (48px), the whole row is the target |
| Emergency actions | 48px tall minimum, and the widest target on the screen |

`size="small"` is banned by ESLint on buttons, icon buttons, chips, checkboxes,
radios, switches, toggles and tabs. Where a control’s ink must stay small — dense
tables, map pins, chip scrollers — wrap it: `<TouchTarget mode="slop">` keeps the
visual size and extends the hit area outwards. A screen that needs smaller
controls needs fewer controls.

## Installable applications

Field surfaces are installed to a home screen, not bookmarked. Every application
ships the manifest and icons from `assets/pwa/` — do not generate your own.

| File | Use |
| --- | --- |
| `assets/pwa/manifest.webmanifest` | Name, scope, `display: standalone`, navy background and theme colour |
| `icon-192.png`, `icon-512.png` | `purpose: any` |
| `icon-maskable-512.png` | `purpose: maskable` — mark inside the 80% safe zone |
| `apple-touch-icon-180.png` | iOS home screen |
| `favicon-32.png`, `favicon-16.png` | Browser tab |
| `assets/pwa/head.html` | The exact `<head>` block to copy — manifest, theme-colour, icons, `viewport-fit=cover` |

Rules: `theme-color` is navy in both schemes — the status bar belongs to the
brand, not the scheme. Respect the safe area (`viewport-fit=cover` plus
`env(safe-area-inset-*)` padding) so the bottom navigation bar clears the home
indicator on a vessel handheld. Offline is a state like any other: an installed
app that loses signal shows the offline state (`StatusChip status="offline"`),
never a browser error page.

## Versions

Versions are pinned, not ranged. The system supports **one** MUI major at a
time; a second copy of `@mui/material` in a consuming app means two themes and
two sets of tokens.

| | Pin |
| --- | --- |
| `@mui/material`, `@mui/icons-material` | `^7.1.0` (peer) |
| `react`, `react-dom` | `^18.3.1 \|\| ^19.1.0` (peer) |
| Node | `>=20.11 <23`, `.nvmrc` 20.11.1 |
| npm | `>=10.5`, `packageManager: npm@10.9.2` |
| devDependencies | Exact versions, no carets |

`package-lock.json` is committed and CI runs `npm ci` — a lockfile change is a
reviewable event. Upgrading MUI is a deliberate task: bump the peer range, run
`npm run verify`, and check the field, chip and navigation components against
the docs page before merging.

## Component selection

| Need | Use |
| --- | --- |
| Any text input | `<Field>` — never a bare `TextField` |
| A control whose ink must stay small | `<TouchTarget mode="slop">` |
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
| A page — any page | A layout from `src/layouts/`, inside `AppShell` |

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
