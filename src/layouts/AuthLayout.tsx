/**
 * AuthLayout — sign in, one-time code, password reset, session expired.
 *
 * A single centred card on the navy ground, at 440px. No marketing, no
 * illustration, no second column: a volunteer signing in at 0300 wants one
 * field and one button.
 *
 * Dark scheme by default (`data-scheme="dark"` on the html element) when the
 * app it guards is operational.
 *
 *   <AuthLayout heading="Sign in" description="Use your member number." footer={<Help />}>
 *     <TextField label="Member number" />
 *     <Button variant="contained" fullWidth size="large">Sign in</Button>
 *   </AuthLayout>
 */
import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { tokens } from '../../build/tokens';
import { useWindowSizeClass, gutterFor, type SizeClass } from './useWindowSizeClass';

export interface AuthLayoutProps {
  heading: string;
  description?: string;
  children: React.ReactNode;
  /** The wordmark. `logo-white.svg` on this ground. */
  logo?: React.ReactNode;
  /** Help, service status, contact. Small, below the card. */
  footer?: React.ReactNode;
  /** Error or expiry notice, above the fields. */
  notice?: React.ReactNode;
  sizeClass?: SizeClass;
}

export function AuthLayout({
  heading,
  description,
  children,
  logo,
  footer,
  notice,
  sizeClass,
}: AuthLayoutProps) {
  const auto = useWindowSizeClass();
  const cls = sizeClass ?? auto;
  const gutter = gutterFor(cls);

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: gutter,
        backgroundColor: 'primary.main',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: tokens.layout.authCardMaxWidth,
          display: 'flex',
          flexDirection: 'column',
          gap: tokens.space.xl,
        }}
      >
        {logo && <Box sx={{ display: 'flex', justifyContent: 'center' }}>{logo}</Box>}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.space.lg,
            padding: tokens.space.xl,
            borderRadius: tokens.shape.lg,
            backgroundColor: 'background.paper',
            boxShadow: tokens.elevation['2'],
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="h5" component="h1">
              {heading}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ textWrap: 'pretty' }}>
                {description}
              </Typography>
            )}
          </Box>
          {notice}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: tokens.space.lg }}>{children}</Box>
        </Box>

        {footer && (
          <Box sx={{ display: 'flex', justifyContent: 'center', color: 'primary.contrastText' }}>
            {footer}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default AuthLayout;
