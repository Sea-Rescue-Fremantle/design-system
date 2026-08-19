/**
 * Rescue MD3 — MUI v6 theme.
 *
 * Authored (not generated), but every value comes from build/tokens.ts.
 * If you find yourself typing a hex, a px or a font name in this file, the
 * token is missing from tokens.dtcg.json — add it there.
 *
 * Usage:
 *   import { ThemeProvider, CssBaseline } from '@mui/material';
 *   import { lightTheme, darkTheme } from '@rescue/design-system/theme';
 *
 *   <ThemeProvider theme={isOperational ? darkTheme : lightTheme}>
 *     <CssBaseline />
 *     …
 *   </ThemeProvider>
 */
import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';
import { tokens, type StatusName, type TypeRole } from '../build/tokens';

const px = (v: string) => Number.parseFloat(v);

function type(role: TypeRole) {
  const t = tokens.type[role];
  return {
    fontFamily: t.fontFamily,
    fontSize: px(t.fontSize),
    lineHeight: px(t.lineHeight) / px(t.fontSize),
    fontWeight: t.fontWeight,
    letterSpacing: t.letterSpacing,
  };
}

/** MUI wants 25 shadow strings. Levels 0–5 are the system's; the rest repeat level 5. */
const shadows = (() => {
  const e = tokens.elevation;
  const base = [e['0'], e['1'], e['2'], e['3'], e['4'], e['5']];
  return Array.from({ length: 25 }, (_, i) => base[i] ?? e['5']) as Theme['shadows'];
})();

function base(scheme: 'light' | 'dark'): ThemeOptions {
  const c = tokens.color.scheme[scheme];
  return {
    palette: {
      mode: scheme,
      primary: { main: c.primary, contrastText: c.onPrimary },
      secondary: { main: c.secondary, contrastText: c.onSecondary },
      // Material 3's tertiary role — rescue orange. MUI has no `tertiary`, so it
      // rides on `warning`. It is a signal, never decoration.
      warning: { main: c.tertiary, contrastText: c.onTertiary },
      error: { main: c.error, contrastText: c.onError },
      success: { main: tokens.color.status.resolved.solid },
      info: { main: tokens.color.status.advisory.solid },
      background: { default: c.surface, paper: c.surfaceContainerLowest },
      text: { primary: c.onSurface, secondary: c.onSurfaceVariant },
      divider: c.outlineVariant,
    },
    shape: { borderRadius: px(tokens.shape.md) },
    spacing: px(tokens.space.xs),
    shadows,
    typography: {
      fontFamily: tokens.font.family.body,
      h1: type('displaySmall'),
      h2: type('headlineLarge'),
      h3: type('headlineMedium'),
      h4: type('headlineSmall'),
      h5: type('titleLarge'),
      h6: type('titleMedium'),
      subtitle1: type('titleMedium'),
      subtitle2: type('titleSmall'),
      body1: type('bodyLarge'),
      body2: type('bodyMedium'),
      caption: type('bodySmall'),
      overline: { ...type('labelSmall'), textTransform: 'uppercase' },
      button: { ...type('labelLarge'), textTransform: 'none' },
    },
    transitions: {
      duration: {
        shortest: px(tokens.duration.short),
        shorter: px(tokens.duration.short),
        short: px(tokens.duration.medium),
        standard: px(tokens.duration.medium),
        complex: px(tokens.duration.long),
        enteringScreen: px(tokens.duration.long),
        leavingScreen: px(tokens.duration.medium),
      },
      easing: {
        easeInOut: tokens.easing.standard,
        easeOut: tokens.easing.decelerate,
        easeIn: tokens.easing.accelerate,
        sharp: tokens.easing.standard,
      },
    },
    breakpoints: {
      values: {
        xs: px(tokens.breakpoint.compact),
        sm: px(tokens.breakpoint.medium),
        md: px(tokens.breakpoint.expanded),
        lg: px(tokens.breakpoint.large),
        xl: px(tokens.breakpoint.extraLarge),
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':focus-visible': {
            outline: `2px solid ${c.primary}`,
            outlineOffset: px(tokens.space.xs) / 2,
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true, variant: 'contained' },
        styleOverrides: {
          root: {
            borderRadius: px(tokens.shape.full),
            minHeight: px(tokens.size.buttonHeight),
            paddingInline: px(tokens.space.xl),
          },
          // The emergency action. 48px, always with an icon.
          sizeLarge: {
            minHeight: px(tokens.size.emergencyButtonHeight),
            paddingInline: px(tokens.space.xl) + px(tokens.space.xs),
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { width: px(tokens.size.touchTarget), height: px(tokens.size.touchTarget) },
        },
      },
      MuiTextField: { defaultProps: { variant: 'outlined', fullWidth: true } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { minHeight: px(tokens.size.fieldHeight), borderRadius: px(tokens.shape.md) },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: px(tokens.shape.sm), fontWeight: tokens.font.weight.semibold },
        },
      },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: { root: { borderRadius: px(tokens.shape.lg) } },
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: px(tokens.shape.xl) } },
      },
      MuiTableCell: {
        styleOverrides: { root: { height: px(tokens.size.rowHeight) } },
      },
      MuiTableRow: {
        styleOverrides: { hover: { '&:hover': { backgroundColor: c.surfaceContainerLow } } },
      },
    },
  };
}

export const lightTheme = createTheme(base('light'));
export const darkTheme = createTheme(base('dark'));

/**
 * The status palette, as consumed by StatusChip. `variant: 'solid'` is for
 * dense tables and map pins only.
 */
export function statusColors(status: StatusName, variant: 'tinted' | 'solid' = 'tinted') {
  const s = tokens.color.status[status];
  return variant === 'solid'
    ? { color: tokens.color.palette.text.onColor, backgroundColor: s.solid }
    : { color: s.fg, backgroundColor: s.bg };
}

export default lightTheme;
