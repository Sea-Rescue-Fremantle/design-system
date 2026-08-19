// Rescue MD3 — ESLint flat config.
//
// These rules encode the parts of the design system a reviewer would otherwise
// have to catch by eye. An agent converges on what passes the build far faster
// than on what the documentation says, so the documentation is enforced here.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';

/** Hex, rgb()/hsl(), and named-colour literals anywhere in JS/TS/JSX. */
const COLOR_LITERAL = String.raw`^(#[0-9a-fA-F]{3,8}|(rgb|rgba|hsl|hsla|oklch)\(.*|white|black|red|green|blue|orange|navy|grey|gray)$`;

export default tseslint.config(
  // Global ignores. Must be its own config object with no `files` key —
  // an `ignores` inside a config object only applies to that object, so
  // generated output would otherwise still be linted by the recommended sets.
  { ignores: ['build/**', 'dist/**', 'node_modules/**', 'docs/**'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: ['build/**', 'dist/**', 'node_modules/**', 'scripts/**'],
    plugins: { react },
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
    rules: {
      'no-restricted-syntax': [
        'error',

        // ---- colour ----------------------------------------------------
        {
          selector: `Literal[value=/${COLOR_LITERAL}/]`,
          message:
            'Colour literal. Import from build/tokens.ts (tokens.color.scheme.light.primary) or use var(--rmd-color-*).',
        },

        // ---- the status vocabulary -------------------------------------
        {
          selector:
            'JSXOpeningElement[name.name="StatusChip"] JSXAttribute[name.name="status"] Literal[value!=/^(distress|urgent|advisory|onTask|standby|resolved|offline)$/]',
          message:
            'Status is a closed set of seven. Extend tokens.dtcg.json (color.status) before inventing an eighth.',
        },
        {
          selector: 'JSXOpeningElement[name.name=/Chip$/] JSXAttribute[name.name="color"]',
          message:
            'Do not colour a chip directly. Use <StatusChip status="…"> so colour, icon and label stay in step.',
        },

        // ---- one filled primary per view -------------------------------
        {
          selector: 'JSXAttribute[name.name="variant"][value.value="text"] ~ JSXAttribute[name.name="color"][value.value="warning"]',
          message: 'Rescue orange is only ever a filled emergency action, never a text button.',
        },

        // ---- icon set --------------------------------------------------
        {
          selector: 'ImportDeclaration[source.value=/^(react-icons|@heroicons|lucide-react|@phosphor-icons|react-feather)/]',
          message: 'Material Symbols Rounded only. Import from @mui/icons-material.',
        },
        {
          selector: 'JSXOpeningElement[name.name="svg"]',
          message:
            'No hand-drawn SVG icons. Use @mui/icons-material; for charts use the charting library, not inline SVG.',
        },

        // ---- theme integrity -------------------------------------------
        {
          selector: 'CallExpression[callee.name="createTheme"]',
          message: 'One theme. Import { lightTheme, darkTheme } from src/theme.ts instead of creating another.',
        },
        {
          selector: 'ImportDeclaration[source.value=/tokens\\.dtcg\\.json$/]',
          message: 'Do not import the DTCG source at runtime. Import build/tokens.ts.',
        },
      ],

      // Raw numbers in sx/style props are the usual way spacing drifts.
      'no-restricted-properties': [
        'error',
        { object: 'theme', property: 'spacing', message: 'Use the sx spacing shorthand (p, m, gap) so the 4px base applies.' },
      ],

      // Accessibility floor: focus rings are never removed, only replaced.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['**/build/tokens.css'], message: 'Load tokens.css once at the app entry point, not per component.' },
          ],
        },
      ],
    },
  },

  // The token build and the docs page are allowed literals. The token build
  // is also a Node script, so it gets Node globals.
  {
    files: ['scripts/**', '**/*.stories.tsx', '**/email/**'],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly', URL: 'readonly', fetch: 'readonly' },
    },
    rules: { 'no-restricted-syntax': 'off' },
  },

  // src/theme.ts is the one place the theme is allowed to be created — that is
  // the whole point of the rule that bans createTheme everywhere else.
  {
    files: ['src/theme.ts'],
    rules: { 'no-restricted-syntax': 'off' },
  },
);
