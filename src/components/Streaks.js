import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getTeamColors } from '@/utils/teamMappings';
import { computeStreaks, recentGames } from '@/utils/dataProcessing';

function StreakBadge({ team, count, label }) {
  const colors = getTeamColors(team);
  return (
    <Paper
      sx={{
        p: 2.5,
        textAlign: 'center',
        background: `linear-gradient(145deg, ${colors.primary}22 0%, ${colors.primary}11 100%)`,
        border: `1px solid ${colors.primary}44`,
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </Typography>
      <Typography variant="h3" sx={{ color: colors.primary, my: 0.5 }}>
        {count}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {team}
      </Typography>
    </Paper>
  );
}

export default function Streaks({ matchupGames, teamA, teamB }) {
  const streaks = useMemo(
    () => computeStreaks(matchupGames, teamA, teamB),
    [matchupGames, teamA, teamB]
  );

  const recent = useMemo(
    () => recentGames(matchupGames, 10),
    [matchupGames]
  );

  const colorsA = getTeamColors(teamA);
  const colorsB = getTeamColors(teamB);

  if (matchupGames.length === 0) return null;

  // Recent form summary
  const recentAWins = recent.filter((g) => !g.isTie && g.wtNorm === teamA).length;
  const recentBWins = recent.filter((g) => !g.isTie && g.wtNorm === teamB).length;
  const recentTies = recent.filter((g) => g.isTie).length;

  return (
    <Box>
      {/* Streak Records */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: 'linear-gradient(145deg, #111827 0%, #1a2332 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <WhatshotIcon sx={{ color: '#FF6B35' }} />
          <Typography variant="h6">Win Streaks</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <StreakBadge
              team={teamA}
              count={streaks.aLongest}
              label="Longest Streak"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StreakBadge
              team={teamB}
              count={streaks.bLongest}
              label="Longest Streak"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 2.5,
                textAlign: 'center',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                Current Streak
              </Typography>
              {streaks.currentStreak.team ? (
                <>
                  <Typography
                    variant="h3"
                    sx={{
                      color: getTeamColors(streaks.currentStreak.team).primary,
                      my: 0.5,
                    }}
                  >
                    {streaks.currentStreak.count}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {streaks.currentStreak.team} 🔥
                  </Typography>
                </>
              ) : (
                <Typography variant="h4" sx={{ my: 1 }}>
                  —
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Recent Form */}
      <Paper
        sx={{
          p: 3,
          background: 'linear-gradient(145deg, #111827 0%, #1a2332 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TrendingUpIcon sx={{ color: '#4CAF50' }} />
          <Typography variant="h6">
            Last {recent.length} Matchups
          </Typography>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Chip
              label={`${teamA}: ${recentAWins}W`}
              size="small"
              sx={{ bgcolor: colorsA.primary, color: '#fff', fontWeight: 700 }}
            />
            <Chip
              label={`${teamB}: ${recentBWins}W`}
              size="small"
              sx={{ bgcolor: colorsB.primary, color: '#fff', fontWeight: 700 }}
            />
            {recentTies > 0 && (
              <Chip
                label={`${recentTies}T`}
                size="small"
                sx={{ bgcolor: '#555', color: '#fff' }}
              />
            )}
          </Box>
        </Box>

        {/* Visual streak bar for last 10 */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 3, flexWrap: 'wrap' }}>
          {recent.map((g, i) => {
            const isATie = g.isTie;
            const aWon = !isATie && g.wtNorm === teamA;
            return (
              <Box
                key={i}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isATie ? '#555' : aWon ? colorsA.primary : colorsB.primary,
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                title={`${g.date}: ${g.wt} ${g.wts}-${g.lts} ${g.lt}`}
              >
                {isATie ? 'T' : aWon ? 'A' : 'B'}
              </Box>
            );
          })}
          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', ml: 1 }}>
            ← Most recent
          </Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Winner</TableCell>
                <TableCell>Loser</TableCell>
                <TableCell align="center">Score</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recent.map((g, i) => (
                <TableRow key={i}>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{g.date}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {g.isTie ? '—' : g.wt}
                  </TableCell>
                  <TableCell>{g.isTie ? '—' : g.lt}</TableCell>
                  <TableCell align="center">
                    {g.wts} &ndash; {g.lts}
                    {g.isTie && (
                      <Chip label="TIE" size="small" sx={{ ml: 1, height: 18, fontSize: '0.6rem' }} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={g.type === 'Playoff' ? '🏆 Playoff' : 'Regular'}
                      size="small"
                      variant="outlined"
                      sx={{ height: 22, fontSize: '0.7rem' }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
