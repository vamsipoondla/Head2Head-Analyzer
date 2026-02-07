import React from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, CircularProgress, Paper, Grid, Chip } from '@mui/material';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import Layout from '@/components/Layout';
import TeamSelector from '@/components/TeamSelector';
import { useGameData } from '@/context/DataContext';

const POPULAR_RIVALRIES = [
  { a: 'Green Bay Packers', b: 'Chicago Bears', label: 'Packers vs Bears' },
  { a: 'Dallas Cowboys', b: 'Washington Commanders', label: 'Cowboys vs Commanders' },
  { a: 'Pittsburgh Steelers', b: 'Baltimore Ravens', label: 'Steelers vs Ravens' },
  { a: 'San Francisco 49ers', b: 'Dallas Cowboys', label: '49ers vs Cowboys' },
  { a: 'New England Patriots', b: 'New York Jets', label: 'Patriots vs Jets' },
  { a: 'Kansas City Chiefs', b: 'Las Vegas Raiders', label: 'Chiefs vs Raiders' },
  { a: 'Minnesota Vikings', b: 'Green Bay Packers', label: 'Vikings vs Packers' },
  { a: 'Philadelphia Eagles', b: 'New York Giants', label: 'Eagles vs Giants' },
];

export default function Home() {
  const router = useRouter();
  const { loading, error, games } = useGameData();

  const handleAnalyze = (teamA, teamB) => {
    router.push(`/rivalry?teamA=${encodeURIComponent(teamA)}&teamB=${encodeURIComponent(teamB)}`);
  };

  if (error) {
    return (
      <Layout>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="error">
            Failed to load game data: {error}
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
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
          NFL Rivalry Analyzer
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 400 }}>
          Explore head-to-head matchups across NFL history
        </Typography>
        {!loading && (
          <Typography variant="body2" color="text.secondary">
            {games.length.toLocaleString()} games &middot; 1926&ndash;2024 &middot; Regular Season &amp; Playoffs
          </Typography>
        )}
      </Box>

      {/* Team Selector */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <CircularProgress size={48} />
          <Typography sx={{ mt: 2 }} color="text.secondary">
            Loading game data...
          </Typography>
        </Box>
      ) : (
        <>
          <TeamSelector onAnalyze={handleAnalyze} />

          {/* Popular Rivalries */}
          <Paper
            sx={{
              mt: 4,
              p: 3,
              background: 'linear-gradient(145deg, #111827 0%, #1a2332 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
              🔥 Classic Rivalries
            </Typography>
            <Grid container spacing={1} justifyContent="center">
              {POPULAR_RIVALRIES.map((r) => (
                <Grid item key={r.label}>
                  <Chip
                    label={r.label}
                    clickable
                    onClick={() => handleAnalyze(r.a, r.b)}
                    sx={{
                      fontWeight: 600,
                      border: '1px solid rgba(255,255,255,0.15)',
                      '&:hover': {
                        bgcolor: 'rgba(213, 10, 10, 0.15)',
                        borderColor: 'secondary.main',
                      },
                    }}
                    variant="outlined"
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </>
      )}
    </Layout>
  );
}
