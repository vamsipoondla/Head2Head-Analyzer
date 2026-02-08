import React from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Paper, Grid, Button } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import Layout from '@/components/Layout';

const GAMES = [
  {
    title: 'Super Bowl Squares',
    description:
      'Set up a 10x10 squares pool for the Super Bowl. Track live scores via ESPN and automatically determine quarter and final winners.',
    href: '/games/super-bowl-squares',
    icon: <CasinoIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
  },
];

export default function GamesHub() {
  const router = useRouter();

  return (
    <Layout title="Games">
      <Box sx={{ textAlign: 'center', mb: 5, mt: { xs: 2, md: 4 } }}>
        <SportsFootballIcon sx={{ fontSize: 64, color: 'secondary.main', mb: 2 }} />
        <Typography
          variant="h3"
          sx={{
            mb: 1,
            fontSize: { xs: '1.8rem', md: '2.8rem' },
            background: 'linear-gradient(135deg, #ffffff 0%, #D50A0A 50%, #013369 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Games
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Fun, interactive games for NFL fans
        </Typography>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        {GAMES.map((game) => (
          <Grid item xs={12} sm={6} md={4} key={game.href}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                background: 'linear-gradient(145deg, #111827 0%, #1a2332 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'border-color 0.2s, transform 0.2s',
                '&:hover': {
                  borderColor: 'rgba(213,10,10,0.4)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ mb: 2 }}>{game.icon}</Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {game.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flex: 1 }}>
                {game.description}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => router.push(game.href)}
                fullWidth
              >
                Play
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}
