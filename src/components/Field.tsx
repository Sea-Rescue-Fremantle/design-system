/**
 * Field — the only text input in the system.
 *
 * Fields are outlined, 56px tall, labelled and spaced for a gloved hand on a
 * wet tablet. MUI's `TextField` allows a dozen combinations this system does
 * not: filled and standard variants, `size="small"`, floating placeholders
 * standing in for labels, helper text that appears only on error and shifts
 * the page as it does. This wrapper closes those off.
 *
 * The contract, in one place:
 *   - outlined variant, always. Filled and standard are not used.
 *   - the label is always visible. A placeholder is an example, never a label.
 *   - helper-text space is reserved whether or not there is helper text, so an
 *     error never moves the fields below it.
 *   - required fields are marked; optional ones are not. Most fields in an
 *     incident report are required, so mark the exceptions with `optional`.
 *   - `kind` sets the keyboard, autocomplete and casing. A crew member typing
 *     a position on a phone gets a numeric keypad, not a QWERTY.
 *   - identifiers (callsign, position, time, record ID) render mono with
 *     tabular numerals.
 *
 *   <Field label="Callsign" kind="callsign" value={cs} onChange={…} />
 *   <Field label="Position" kind="position" helperText="Decimal degrees" />
 *   <Field label="Notes" kind="multiline" optional />
 */
import * as React from 'react';
import TextField, { type TextFieldProps } from '@mui/material/TextField';
import Box from '@mui/material/Box';

import { tokens } from '../../build/tokens';

/** Input kinds. Each one fixes keyboard, autocomplete, casing and alignment. */
export type FieldKind =
  | 'text'
  | 'multiline'
  | 'number'
  | 'callsign'
  | 'position'
  | 'time'
  | 'date'
  | 'phone'
  | 'email'
  | 'search';

interface KindSpec {
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  mono?: boolean;
  uppercase?: boolean;
  multiline?: boolean;
  type?: string;
  placeholder?: string;
}

const KINDS: Record<FieldKind, KindSpec> = {
  text: { autoComplete: 'off' },
  multiline: { multiline: true, autoComplete: 'off' },
  number: { inputMode: 'numeric', mono: true, autoComplete: 'off' },
  callsign: { inputMode: 'text', mono: true, uppercase: true, autoComplete: 'off', placeholder: 'FR1' },
  position: { inputMode: 'decimal', mono: true, autoComplete: 'off', placeholder: '-32.0561, 115.7386' },
  time: { inputMode: 'numeric', mono: true, autoComplete: 'off', placeholder: '1442' },
  date: { type: 'date', mono: true, autoComplete: 'off' },
  phone: { inputMode: 'tel', mono: true, autoComplete: 'tel' },
  email: { inputMode: 'email', autoComplete: 'email', type: 'email' },
  search: { inputMode: 'search', type: 'search', autoComplete: 'off' },
};

export type FieldProps = Omit<
  TextFieldProps,
  'variant' | 'size' | 'label' | 'hiddenLabel' | 'multiline' | 'margin'
> & {
  /** Sentence case, always visible. Not a placeholder. */
  label: string;
  kind?: FieldKind;
  /** Optional fields are marked; required is the default in operational forms. */
  optional?: boolean;
  /** Units, formats and examples live here — not in the label. */
  helperText?: React.ReactNode;
  /** Rows for `kind="multiline"`. */
  rows?: number;
};

export function Field({
  label,
  kind = 'text',
  optional = false,
  helperText,
  error,
  rows = 4,
  inputProps,
  slotProps,
  sx,
  ...rest
}: FieldProps) {
  const spec = KINDS[kind];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <TextField
        {...rest}
        label={label}
        variant="outlined"
        required={!optional}
        error={error}
        multiline={spec.multiline}
        minRows={spec.multiline ? rows : undefined}
        type={spec.type}
        placeholder={rest.placeholder ?? spec.placeholder}
        autoComplete={rest.autoComplete ?? spec.autoComplete}
        inputProps={{ inputMode: spec.inputMode, ...inputProps }}
        slotProps={slotProps}
        sx={{
          '& .MuiInputBase-root': {
            minHeight: spec.multiline ? undefined : tokens.size.fieldHeight,
            ...(spec.mono && {
              fontFamily: tokens.font.family.mono,
              fontVariantNumeric: 'tabular-nums',
            }),
            ...(spec.uppercase && { textTransform: 'uppercase' }),
          },
          ...sx,
        }}
      />
      {/* Reserved, whether or not there is text in it. An error must never
          move the field below it — people re-key the wrong row when it does. */}
      <Box
        aria-live={error ? 'polite' : undefined}
        sx={{
          minHeight: tokens.size.helperTextHeight,
          paddingInline: tokens.space.md,
          paddingTop: tokens.space.xs,
          fontFamily: tokens.type.bodyMedium.fontFamily,
          fontSize: tokens.type.bodyMedium.fontSize,
          lineHeight: tokens.type.bodyMedium.lineHeight,
          color: error ? 'error.main' : 'text.secondary',
        }}
      >
        {helperText}
      </Box>
    </Box>
  );
}

/**
 * FieldGroup — vertical stack of fields at the system's field spacing.
 * Fields are never placed side by side: two inputs on one line is how a
 * latitude ends up in a longitude.
 */
export function FieldGroup({
  legend,
  children,
}: {
  legend?: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      component={legend ? 'fieldset' : 'div'}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.space.sm,
        border: 'none',
        margin: 0,
        padding: 0,
        minWidth: 0,
      }}
    >
      {legend && (
        <Box
          component="legend"
          sx={{
            fontFamily: tokens.type.titleSmall.fontFamily,
            fontSize: tokens.type.titleSmall.fontSize,
            fontWeight: tokens.type.titleSmall.fontWeight,
            paddingBottom: tokens.space.sm,
          }}
        >
          {legend}
        </Box>
      )}
      {children}
    </Box>
  );
}

export default Field;
