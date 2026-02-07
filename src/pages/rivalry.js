import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Button,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout from '@/components/Layout';
import TeamSelector from '@/components/TeamSelector';
import RecordSummary from '@/components/RecordSummary';
import Timeline from '@/components/Timeline';
import Streaks from '@/components/Streaks';
import ShareButton from '@/components/ShareButton';
import { useGameData } from '@/context/DataContext';
import { filterMatchup } from '@/utils/dataProcessing';
import { getTeamColors } from '@/utils/teamMappings';

function TabPanel({ children, value, index }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  );
}

export default function RivalryPage() {
  const router = useRouter();
  const { teamA: qA, teamB: qB } = router.query;
  const { games, loading, error } = useGameData();
  const [tab, setTab] = useState(0);

  const teamA = qA ? decodeURIComponent(qA) : null;
  const teamB = qB ? decodeURIComponent(qB) : null;

  const matchupGames = useMemo(() => {
    if (!teamA || !teamB || !games.length) return [];
    return filterMatchup(games, teamA, teamB);
  }, [games, teamA, teamB]);

  const handleAnalyze = (newA, newB) => {
    setTab(0);
    router.push(
      `/rivalry?teamA=${encodeURIComponent(newA)}&teamB=${encodeURIComponent(newB)}`,
      undefined,
      { shallow: false }
    );
  };

  const colorsA = teamA ? getTeamColors(teamA) : { primary: '#013369' };
  const colorsB = teamB ? getTeamColors(teamB) : { primary: '#D50A0A' };

  if (error) {
    return (
      <Layout title="Error">
        <Typography variant="h5" color="error" sx={{ textAlign: 'center', py: 8 }}>
          Failed to load data: {error}
        </Typography>
      </Layout>
    );
  }

  const title = teamA && teamB ? `${teamA} vs ${teamB}` : 'Rivalry';

  return (
    <Layout title={title}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/')}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Back to Home
      </Button>

      <TeamSelector teamA={teamA} teamB={teamB} onAnalyze={handleAnalyze} />

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CircularProgress size={48} />
          <Typography sx={{ mt: 2 }} color="text.secondary">
            Loading game data...
          </Typography>
        </Box>
      ) : teamA && teamB ? (
        <Box sx={{ mt: 3 }}>
          {/* Header */}
          <Paper
            sx={{
              p: 3,
              mb: 2,
              background: `linear-gradient(135deg, ${colorsA.primary}33 0%, #111827 50%, ${colorsB.primary}33 100%)`,
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h4"
              sx={{ fontSize: { xs: '1.3rem', md: '2rem' } }}
            >
              <Box component="span" sx={{ color: colorsA.primary, fontWeight: 800 }}>
                {teamA}
              </Box>
              {' '}
              <Box component="span" sx={{ color: 'text.secondary' }}>vs</Box>
              {' '}
              <Box component="span" sx={{ color: colorsB.primary, fontWeight: 800 }}>
                {teamB}
              </Box>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {matchupGames.length > 0
                ? `${matchupGames.length} all-time matchups`
                : 'No matchups found between these teams'}
            </Typography>
            {matchupGames.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <ShareButton matchupGames={matchupGames} teamA={teamA} teamB={teamB} />
              </Box>
            )}
          </Paper>

          {matchupGames.length > 0 ? (
            <>
              {/* Tabs */}
              <Paper
                sx={{
                  bgcolor: 'background.paper',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <Tabs
                  value={tab}
                  onChange={(_, v) => setTab(v)}
                  variant="fullWidth"
                  textColor="inherit"
                  TabIndicatorProps={{
                    sx: { bgcolor: 'secondary.main', height: 3 },
                  }}
                >
                  <Tab label="Summary" />
                  <Tab label="Timeline" />
                  <Tab label="Streaks" />
                </Tabs>
              </Paper>

              <TabPanel value={tab} index={0}>
                <RecordSummary matchupGames={matchupGames} teamA={teamA} teamB={teamB} />
              </TabPanel>
              <TabPanel value={tab} index={1}>
                <Timeline matchupGames={matchupGames} teamA={teamA} teamB={teamB} />
              </TabPanel>
              <TabPanel value={tab} index={2}>
                <Streaks matchupGames={matchupGames} teamA={teamA} teamB={teamB} />
              </TabPanel>
            </>
          ) : (
            <Paper sx={{ p: 4, mt: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                These teams have never played each other.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try selecting different teams or check if a franchise was renamed.
              </Typography>
            </Paper>
          )}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary">
            Select two teams above to analyze their rivalry.
          </Typography>
        </Box>
      )}
    </Layout>
  );
}
