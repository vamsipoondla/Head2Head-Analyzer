import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
} from '@mui/material';
import { cumulativeScore } from '@/utils/espnApi';

/**
 * Displays live score tracking info, linescore table, and game status.
 *
 * Props:
 * - scores: parsed score object from espnApi.parseScores(), or null
 * - loading: boolean — currently fetching
 * - error: string | null — last error message
 * - teamA: string — row team name
 * - teamB: string — col team name
 * - pollingActive: boolean — whether polling is running
 */
export default function ScoreTracker({ scores, loading, error, teamA, teamB, pollingActive }) {
  if (error) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!scores && loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Fetching live scores...
        </Typography>
      </Box>
    );
  }

  if (!scores) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        No live game data available. Scores will appear here once the game is found and in progress.
      </Alert>
    );
  }

  const { homeTeam, awayTeam, homeLinescores, awayLinescores, statusDetail, isComplete, isPreGame } =
    scores;

  // Determine the number of periods to show (4 + overtime if applicable)
  const periods = Math.max(homeLinescores.length, awayLinescores.length, 4);
  const periodHeaders = [];
  for (let i = 1; i <= periods; i++) {
    periodHeaders.push(i <= 4 ? `Q${i}` : `OT${i - 4 > 1 ? i - 4 : ''}`);
  }

  return (
    <Paper
      sx={{
        p: { xs: 1.5, md: 3 },
        mb: 2,
        background: 'linear-gradient(145deg, #111827 0%, #1a2332 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Status bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          Live Scoreboard
        </Typography>
        <Chip
          label={statusDetail || (isPreGame ? 'Pre-Game' : isComplete ? 'Final' : 'Live')}
          size="small"
          color={isComplete ? 'success' : isPreGame ? 'default' : 'error'}
          sx={{ fontWeight: 600 }}
        />
        {pollingActive && !isComplete && (
          <Chip
            label="Auto-updating"
            size="small"
            variant="outlined"
            sx={{ fontWeight: 500, borderColor: 'rgba(255,255,255,0.2)' }}
          />
        )}
      </Box>

      {/* Linescore table */}
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 400 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                Team
              </TableCell>
              {periodHeaders.map((h) => (
                <TableCell
                  key={h}
                  align="center"
                  sx={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {h}
                </TableCell>
              ))}
              <TableCell
                align="center"
                sx={{
                  fontWeight: 700,
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  color: 'secondary.main',
                }}
              >
                Total
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Away team row */}
            <TableRow>
              <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {awayTeam}
              </TableCell>
              {periodHeaders.map((_, i) => (
                <TableCell
                  key={i}
                  align="center"
                  sx={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {awayLinescores[i] !== undefined ? awayLinescores[i] : '-'}
                </TableCell>
              ))}
              <TableCell
                align="center"
                sx={{
                  fontWeight: 700,
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  color: 'secondary.main',
                }}
              >
                {cumulativeScore(awayLinescores, awayLinescores.length)}
              </TableCell>
            </TableRow>

            {/* Home team row */}
            <TableRow>
              <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {homeTeam}
              </TableCell>
              {periodHeaders.map((_, i) => (
                <TableCell
                  key={i}
                  align="center"
                  sx={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {homeLinescores[i] !== undefined ? homeLinescores[i] : '-'}
                </TableCell>
              ))}
              <TableCell
                align="center"
                sx={{
                  fontWeight: 700,
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  color: 'secondary.main',
                }}
              >
                {cumulativeScore(homeLinescores, homeLinescores.length)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
