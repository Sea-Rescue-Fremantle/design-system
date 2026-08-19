#!/usr/bin/env node
/**
 * Rescue MD3 token build.
 *
 *   node scripts/build-tokens.mjs
 *
 * Reads tokens.dtcg.json (W3C Design Tokens Community Group format) and writes
 * build/tokens.css and build/tokens.ts. No dependencies, no network.
 *
 * Nothing in build/ is edited by hand. If a value is wrong, it is wrong in
 * tokens.dtcg.json.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PREFIX = 'rmd';
const BANNER = '/* GENERATED FROM tokens.dtcg.json — do not edit. Run `npm run tokens`. */';

const src = JSON.parse(await readFile(resolve(root, 'tokens.dtcg.json'), 'utf8'));

/* ---------- flatten ---------------------------------------------------- */

const tokens = [];
(function walk(node, path, inheritedType) {
  const type = node.$type ?? inheritedType;
  if (Object.prototype.hasOwnProperty.call(node, '$value')) {
    tokens.push({ path, type, value: node.$value, description: node.$description });
    return;
  }
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    walk(child, [...path, key], type);
  }
})(src, [], undefined);

const byPath = new Map(tokens.map((t) => [t.path.join('.'), t]));

/* ---------- alias resolution ------------------------------------------ */

const ALIAS = /^\{([^}]+)\}$/;
const isAlias = (v) => typeof v === 'string' && ALIAS.test(v);
const aliasTarget = (v) => v.match(ALIAS)[1];

function resolveDeep(value, seen = new Set()) {
  if (!isAlias(value)) return value;
  const target = aliasTarget(value);
  if (seen.has(target)) throw new Error(`Circular token alias at {${target}}`);
  const token = byPath.get(target);
  if (!token) throw new Error(`Unknown token alias {${target}}`);
  return resolveDeep(token.value, new Set([...seen, target]));
}

/* ---------- naming ----------------------------------------------------- */

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/** Semantic scheme tokens drop the `scheme.<mode>` segment: color.scheme.light.primary -> --rmd-color-primary */
function cssVarName(path) {
  const parts = path[0] === 'color' && path[1] === 'scheme' ? ['color', ...path.slice(3)] : path;
  return `--${PREFIX}-${parts.map(kebab).join('-')}`;
}

const schemeOf = (path) => (path[0] === 'color' && path[1] === 'scheme' ? path[2] : null);

/* ---------- serialisation --------------------------------------------- */

function cssValue(token, { deref = false } = {}) {
  const { type, value } = token;
  if (isAlias(value)) {
    if (deref) return resolveDeep(value);
    const target = byPath.get(aliasTarget(value));
    return `var(${cssVarName(target.path)})`;
  }
  switch (type) {
    case 'fontFamily':
      return (Array.isArray(value) ? value : [value]).map((f) => (/\s/.test(f) ? `'${f}'` : f)).join(', ');
    case 'cubicBezier':
      return `cubic-bezier(${value.join(', ')})`;
    case 'shadow': {
      const layers = Array.isArray(value) ? value : [value];
      if (layers.length === 0) return 'none';
      return layers
        .map((s) => `${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread ?? '0px'} ${s.color}`.replace(/ 0px 0px /, ' 0px 0px '))
        .join(', ');
    }
    default:
      return String(value);
  }
}

/* ---------- tokens.css ------------------------------------------------- */

const lines = [BANNER, ''];
const emit = (selector, list, opts) => {
  if (list.length === 0) return;
  lines.push(`${selector} {`);
  let lastGroup = null;
  for (const t of list) {
    const group = t.path.slice(0, 2).join('.');
    if (group !== lastGroup) {
      lines.push(`${lines.length ? '' : ''}  /* ${group} */`);
      lastGroup = group;
    }
    lines.push(`  ${cssVarName(t.path)}: ${cssValue(t, opts)};`);
  }
  lines.push('}', '');
};

const primitives = tokens.filter((t) => t.type !== 'typography' && !schemeOf(t.path));
const light = tokens.filter((t) => schemeOf(t.path) === 'light');
const dark = tokens.filter((t) => schemeOf(t.path) === 'dark');

emit(':root', [...primitives, ...light]);

/* Typography roles expand to component parts — composite tokens have no CSS equivalent. */
lines.push(':root {', '  /* type roles */');
for (const t of tokens.filter((x) => x.type === 'typography')) {
  const v = t.value;
  const base = `--${PREFIX}-type-${kebab(t.path.at(-1))}`;
  lines.push(`  ${base}-family: ${cssValue({ type: 'fontFamily', value: resolveDeep(v.fontFamily) })};`);
  lines.push(`  ${base}-size: ${v.fontSize};`);
  lines.push(`  ${base}-line: ${v.lineHeight};`);
  lines.push(`  ${base}-weight: ${resolveDeep(v.fontWeight)};`);
  lines.push(`  ${base}-tracking: ${v.letterSpacing};`);
}
lines.push('}', '');

emit('[data-scheme="dark"]', dark);
lines.push(
  '@media (prefers-color-scheme: dark) {',
  '  :root:not([data-scheme="light"]) {',
  ...dark.map((t) => `    ${cssVarName(t.path)}: ${cssValue(t)};`),
  '  }',
  '}',
  '',
);

/* Material Web reads --md-sys-*; alias rather than duplicate. */
lines.push('/* Material Web bridge — @material/web reads these names. */', ':root {');
for (const t of light) {
  lines.push(`  --md-sys-color-${kebab(t.path.at(-1))}: var(${cssVarName(t.path)});`);
}
for (const key of ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'full']) {
  const md = { none: 'none', xs: 'extra-small', sm: 'small', md: 'medium', lg: 'large', xl: 'extra-large', full: 'full' }[key];
  lines.push(`  --md-sys-shape-corner-${md}: var(--${PREFIX}-shape-${key});`);
}
lines.push(
  `  --md-ref-typeface-brand: var(--${PREFIX}-font-family-display);`,
  `  --md-ref-typeface-plain: var(--${PREFIX}-font-family-body);`,
  '}',
  '',
);

await mkdir(resolve(root, 'build'), { recursive: true });
await writeFile(resolve(root, 'build/tokens.css'), lines.join('\n'), 'utf8');

/* ---------- tokens.ts -------------------------------------------------- */

function tsTree(filter, { deref }) {
  const out = {};
  for (const t of tokens.filter(filter)) {
    let node = out;
    const path = t.path;
    for (const key of path.slice(0, -1)) node = node[key] ??= {};
    node[path.at(-1)] =
      t.type === 'typography'
        ? {
            fontFamily: cssValue({ type: 'fontFamily', value: resolveDeep(t.value.fontFamily) }),
            fontSize: t.value.fontSize,
            lineHeight: t.value.lineHeight,
            fontWeight: Number(resolveDeep(t.value.fontWeight)),
            letterSpacing: t.value.letterSpacing,
          }
        : cssValue(t, { deref });
  }
  return out;
}

const ts = [
  '// GENERATED FROM tokens.dtcg.json — do not edit. Run `npm run tokens`.',
  '',
  'export const tokens = ' + JSON.stringify(tsTree(() => true, { deref: true }), null, 2) + ' as const;',
  '',
  'export type Tokens = typeof tokens;',
  'export type StatusName = keyof Tokens["color"]["status"];',
  'export type TypeRole = keyof Tokens["type"];',
  '',
  '/** Severity-descending. Every status list in every app sorts by this. */',
  'export const STATUS_ORDER: readonly StatusName[] = [',
  '  "distress", "urgent", "advisory", "onTask", "standby", "resolved", "offline",',
  '] as const;',
  '',
  'export default tokens;',
  '',
].join('\n');

await writeFile(resolve(root, 'build/tokens.ts'), ts, 'utf8');

console.log(`tokens: ${tokens.length} tokens -> build/tokens.css, build/tokens.ts`);
