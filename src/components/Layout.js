import React from 'react';
import Head from 'next/head';
import { AppBar, Toolbar, Typography, Container, Box, IconButton } from '@mui/material';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import Link from 'next/link';

export default function Layout({ children, title }) {
  const pageTitle = title
    ? `${title} | NFL Rivalry Analyzer`
    : 'NFL Rivalry Analyzer';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Analyze NFL head-to-head rivalries from 1926 to 2024" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar
          position="sticky"
          sx={{
            background: 'linear-gradient(135deg, #013369 0%, #0a1628 100%)',
            borderBottom: '3px solid #D50A0A',
          }}
        >
          <Toolbar>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              <IconButton edge="start" color="inherit" sx={{ mr: 1 }}>
                <SportsFootballIcon />
              </IconButton>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  background: 'linear-gradient(90deg, #ffffff 0%, #D50A0A 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                NFL Rivalry Analyzer
              </Typography>
            </Link>
          </Toolbar>
        </AppBar>

        <Container
          maxWidth="lg"
          sx={{
            flex: 1,
            py: 4,
          }}
        >
          {children}
        </Container>

        <Box
          component="footer"
          sx={{
            py: 2,
            px: 2,
            textAlign: 'center',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            color: 'text.secondary',
            fontSize: '0.8rem',
          }}
        >
          NFL Rivalry Analyzer &middot; 14,870+ games from 1926&ndash;2024
        </Box>
      </Box>
    </>
  );
}
