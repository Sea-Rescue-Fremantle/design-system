/**
 * FormLayout — single-column forms and multi-step ones.
 *
 * One column, 720px measure, at every size class. Two-column forms cause
 * mis-keyed data, and this system is used to log incidents.
 *
 * Actions sit in a bar pinned to the bottom of the viewport on compact (thumbs)
 * and after the fields on wider screens. The submit is the view's single filled
 * button; cancel is text and sits on the left of it.
 *
 * Multi-step: pass `steps` and `activeStep`. The stepper is a plain progress
 * line, not a wizard — crews abandon and resume, so every step is reachable
 * and nothing is lost by going back.
 *
 *   <FormLayout
 *     heading="Log an incident"
 *     description="Times in 24-hour local. Position as decimal degrees."
 *     steps={['Report', 'Position', 'Response', 'Review']}
 *     activeStep={1}
 *     actions={<><Button>Cancel</Button><Button variant="contained">Continue</Button></>}
 *   >
 *     <PositionFields />
 *   </FormLayout>
 */
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { tokens } from '../../build/tokens';
import { useWindowSizeClass, gutterFor, type SizeClass } from './useWindowSizeClass';

export interface FormLayoutProps {
  heading: string;
  /** One or two calm sentences. Units and formats belong here, not in labels. */
  description?: string;
  children: React.ReactNode;
  /** Submit and cancel. One filled button. */
  actions?: React.ReactNode;
  /** Step labels for a multi-step form. Omit for a single form. */
  steps?: string[];
  activeStep?: number;
  /** Error summary rendered above the fields, focused on failed submit. */
  error?: React.ReactNode;
  sizeClass?: SizeClass;
}

export function FormLayout({
  heading,
  description,
  children,
  actions,
  steps,
  activeStep = 0,
  error,
  sizeClass,
}: FormLayoutProps) {
  const auto = useWindowSizeClass();
  const cls = sizeClass ?? auto;
  const gutter = gutterFor(cls);
  const pinned = cls === 'compact';

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: tokens.layout.formMaxWidth,
        marginInline: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: gutter,
        minWidth: 0,
        flex: 1,
        paddingBottom: pinned ? `calc(${tokens.size.touchTarget} + ${gutter})` : undefined,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h5" component="h2" sx={{ textWrap: 'pretty' }}>
          {heading}
        </Typography>
        {description && (
          <Typography variant="body1" color="text.secondary" sx={{ textWrap: 'pretty' }}>
            {description}
          </Typography>
        )}
      </Box>

      {steps && steps.length > 1 && (
        <Box
          component="ol"
          aria-label="Progress"
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
            gap: 1,
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          {steps.map((label, i) => (
            <Box
              component="li"
              key={label}
              aria-current={i === activeStep ? 'step' : undefined}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
                fontFamily: tokens.type.labelMedium.fontFamily,
                fontSize: tokens.type.labelMedium.fontSize,
                color: i <= activeStep ? 'text.primary' : 'text.secondary',
              }}
            >
              <Box
                sx={{
                  height: tokens.space.xs,
                  borderRadius: tokens.shape.full,
                  backgroundColor: i <= activeStep ? 'primary.main' : 'divider',
                }}
              />
              <Box component="span" sx={{ minWidth: 0 }}>
                {label}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {error}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: tokens.space.lg, minWidth: 0 }}>
        {children}
      </Box>

      {actions && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 1,
            ...(pinned && {
              position: 'fixed',
              insetInline: 0,
              bottom: 0,
              padding: gutter,
              backgroundColor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider',
            }),
          }}
        >
          {actions}
        </Box>
      )}
    </Box>
  );
}

export default FormLayout;
