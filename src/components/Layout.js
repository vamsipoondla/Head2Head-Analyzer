import React from 'react';
import Head from 'next/head';
import { useSession, signOut } from 'next-auth/react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
  Button,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import CasinoIcon from '@mui/icons-material/Casino';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from 'next/link';

export default function Layout({ children, title }) {
  const { data: session, status } = useSession();
  const [anchorEl, setAnchorEl] = React.useState(null);

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
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', flex: 1 }}>
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

            {/* Games link */}
            <Link href="/games" style={{ textDecoration: 'none' }}>
              <Button
                size="small"
                startIcon={<CasinoIcon />}
                sx={{
                  color: '#fff',
                  mr: 1,
                  '&:hover': {
                    bgcolor: 'rgba(213,10,10,0.1)',
                  },
                }}
              >
                Games
              </Button>
            </Link>

            {/* Auth controls */}
            {status !== 'loading' && (
              <>
                {session ? (
                  <>
                    <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
                      <Avatar
                        src={session.user?.image || undefined}
                        alt={session.user?.name || 'User'}
                        sx={{ width: 34, height: 34, border: '2px solid rgba(255,255,255,0.3)' }}
                      >
                        {(session.user?.name || 'U')[0]}
                      </Avatar>
                    </IconButton>
                    <Menu
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={() => setAnchorEl(null)}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      slotProps={{
                        paper: {
                          sx: { bgcolor: 'background.paper', mt: 1, minWidth: 180 },
                        },
                      }}
                    >
                      <MenuItem disabled>
                        <ListItemText
                          primary={session.user?.name || 'User'}
                          secondary={session.user?.email}
                          primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                          secondaryTypographyProps={{ fontSize: '0.75rem' }}
                        />
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setAnchorEl(null);
                          signOut({ callbackUrl: '/' });
                        }}
                      >
                        <ListItemIcon>
                          <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Sign Out</ListItemText>
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<LoginIcon />}
                      sx={{
                        ml: 1,
                        color: '#fff',
                        borderColor: 'rgba(255,255,255,0.3)',
                        '&:hover': {
                          borderColor: '#D50A0A',
                          bgcolor: 'rgba(213,10,10,0.1)',
                        },
                      }}
                    >
                      Sign In
                    </Button>
                  </Link>
                )}
              </>
            )}
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
