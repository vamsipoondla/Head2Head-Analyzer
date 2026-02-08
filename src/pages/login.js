import React from 'react';
import { signIn, getCsrfToken } from 'next-auth/react';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Avatar,
} from '@mui/material';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import FacebookIcon from '@mui/icons-material/Facebook';
import Layout from '@/components/Layout';

const PROVIDER_META = {
  google: {
    icon: <GoogleIcon />,
    label: 'Continue with Google',
    bgcolor: '#ffffff',
    color: '#1f1f1f',
    hoverBg: '#f2f2f2',
  },
  github: {
    icon: <GitHubIcon />,
    label: 'Continue with GitHub',
    bgcolor: '#24292f',
    color: '#ffffff',
    hoverBg: '#32383f',
  },
  apple: {
    icon: <AppleIcon />,
    label: 'Continue with Apple',
    bgcolor: '#000000',
    color: '#ffffff',
    hoverBg: '#1a1a1a',
  },
  facebook: {
    icon: <FacebookIcon />,
    label: 'Continue with Meta',
    bgcolor: '#1877F2',
    color: '#ffffff',
    hoverBg: '#166fe5',
  },
};

// Fixed display order
const PROVIDER_ORDER = ['google', 'apple', 'facebook', 'github'];

export default function LoginPage({ providers, csrfToken }) {
  const sortedProviders = PROVIDER_ORDER
    .map((id) => providers?.[id])
    .filter(Boolean);

  return (
    <Layout title="Sign In">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 200px)',
          px: 2,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, md: 5 },
            maxWidth: 440,
            width: '100%',
            background: 'linear-gradient(145deg, #111827 0%, #1a2332 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
          }}
        >
          {/* Logo */}
          <Avatar
            sx={{
              mx: 'auto',
              mb: 2,
              width: 64,
              height: 64,
              bgcolor: 'secondary.main',
            }}
          >
            <SportsFootballIcon sx={{ fontSize: 36 }} />
          </Avatar>

          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to save your favorite rivalries and preferences
          </Typography>

          <Divider sx={{ mb: 3, borderColor: 'rgba(255,255,255,0.08)' }}>
            <Typography variant="caption" color="text.secondary">
              SIGN IN WITH
            </Typography>
          </Divider>

          {/* Social login buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {sortedProviders.map((provider) => {
              const meta = PROVIDER_META[provider.id] || {
                icon: null,
                label: `Continue with ${provider.name}`,
                bgcolor: '#333',
                color: '#fff',
                hoverBg: '#444',
              };
              return (
                <Button
                  key={provider.id}
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={meta.icon}
                  onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                  sx={{
                    bgcolor: meta.bgcolor,
                    color: meta.color,
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    py: 1.3,
                    textTransform: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    '&:hover': {
                      bgcolor: meta.hoverBg,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                    },
                  }}
                >
                  {meta.label}
                </Button>
              );
            })}

            {/* Fallback when no providers are configured yet */}
            {sortedProviders.length === 0 && (
              <Box sx={{ py: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No OAuth providers are configured yet. Add credentials to{' '}
                  <code>.env.local</code> to enable social login.
                </Typography>
                {PROVIDER_ORDER.map((id) => {
                  const meta = PROVIDER_META[id];
                  return (
                    <Button
                      key={id}
                      variant="contained"
                      fullWidth
                      size="large"
                      startIcon={meta.icon}
                      disabled
                      sx={{
                        mb: 1.5,
                        bgcolor: meta.bgcolor,
                        color: meta.color,
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        py: 1.3,
                        textTransform: 'none',
                        '&.Mui-disabled': {
                          bgcolor: `${meta.bgcolor}88`,
                          color: `${meta.color}88`,
                        },
                      }}
                    >
                      {meta.label}
                    </Button>
                  );
                })}
              </Box>
            )}
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 3, lineHeight: 1.5 }}
          >
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </Typography>
        </Paper>
      </Box>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  // Build providers map directly from authOptions instead of making an
  // internal HTTP call via getProviders(), which fails on Vercel because
  // the server cannot reliably reach itself at NEXTAUTH_URL during SSR.
  const providers = {};
  for (const provider of authOptions.providers) {
    const p = typeof provider === 'function' ? provider() : provider;
    if (p.options?.clientId || p.clientId) {
      providers[p.id] = { id: p.id, name: p.name, type: p.type };
    }
  }

  const csrfToken = await getCsrfToken(context);
  return {
    props: {
      providers,
      csrfToken: csrfToken ?? null,
    },
  };
}
