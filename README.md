# Rescue MD3

The design system for **Sea Rescue Fremantle** — the public website, the crew
portal, and every operational web application.

Material Design 3 provides the structure: component semantics, colour roles,
the type scale, window size classes. The skin is ours — marine navy as the
working ground, rescue orange reserved as a signal, never a decoration.

📖 **[Documentation](https://sea-rescue-fremantle.github.io/design-system/)** ·
🤖 **[AGENTS.md](./AGENTS.md)** — read this before writing UI

## Install

The package is not published to npm. Install it straight from this repository —
npm builds it for you on install (the `prepare` script runs `npm run build`):

```bash
npm install github:Sea-Rescue-Fremantle/design-system
```

Pin a release by appending a tag, which is what applications should do:

```bash
npm install github:Sea-Rescue-Fremantle/design-system#v1.0.0
```

The repository is private, so the installing machine needs read access to it —
an SSH key for a developer, or a fine-grained read-only PAT for a build server.

## Use

```tsx
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme, StatusChip } from '@sea-rescue-fremantle/design-system';
import '@sea-rescue-fremantle/design-system/tokens.css';

// Light for public and intranet. Dark for operational and night surfaces.
export function App({ operational }: { operational: boolean }) {
  return (
    <ThemeProvider theme={operational ? darkTheme : lightTheme}>
      <CssBaseline />
      <StatusChip status="distress" pulse />
    </ThemeProvider>
  );
}
```

Vanilla HTML or Material Web — load the stylesheet once and you're themed; it
emits `--md-sys-*` aliases alongside its own `--rmd-*` tokens:

```html
<link rel="stylesheet" href="node_modules/@sea-rescue-fremantle/design-system/build/tokens.css">
```

Dark scheme: set `<html data-scheme="dark">`, or omit it and let
`prefers-color-scheme` decide.

## Repository layout

```
tokens.dtcg.json          Source of truth — W3C Design Tokens (DTCG) format
scripts/build-tokens.mjs  Generator: DTCG → CSS + TypeScript. No dependencies.
build/                    GENERATED. Committed so consumers need no build step.
  tokens.css              Custom properties, both schemes, Material Web bridge
  tokens.ts               Typed tokens, StatusName union, STATUS_ORDER
src/
  theme.ts                MUI lightTheme / darkTheme, statusColors()
  components/             Components the system guarantees
docs/index.html           The documentation page (GitHub Pages)
AGENTS.md                 Build rules — read by humans and coding agents
```

## Contributing

**One rule above all: no literals.** No hex, `rgb()`, font family, spacing px,
radius or duration in application or component code. If a value you need isn't
a token, add it to `tokens.dtcg.json` — don't inline it.

```bash
npm run tokens     # regenerate build/ from tokens.dtcg.json
npm run verify     # what CI runs: token freshness + eslint + stylelint
```

`build/` is generated and committed. Never edit it by hand — CI fails if
`npm run tokens` produces a diff.

### Changing a colour

1. Edit the primitive in `tokens.dtcg.json` under `color.palette`.
2. `npm run tokens`
3. Commit both the source and the regenerated `build/`.

Semantic roles alias primitives (`{color.palette.navy.700}`), so a brand
refresh is one edit, not a search-and-replace.

### Adding a status

The status vocabulary is closed at seven values, and the lint rules enforce it.
To extend it: add the entry to `color.status` in `tokens.dtcg.json`, then add
its icon and label to `src/components/StatusChip.tsx`, then update the ESLint
selector in `eslint.config.mjs`. In that order — the token file leads.

## Versioning

Semver. A token value change is a minor; removing or renaming a token, or
changing a component's props, is a major. A release is a tag — there is no
publish step, because consumers install from the tag directly:

```bash
npm version minor && git push --follow-tags
```

Applications then move their `#v…` pin when they are ready to take the change.

## Provenance

Derived from the existing Sea Rescue Fremantle brand — the logo artwork is
unchanged in form, recoloured onto the navy ramp. The palette was reconstructed
from the live site; if the group holds an authoritative brand hex, correct
`color.palette.navy.700` in `tokens.dtcg.json` and everything follows.
