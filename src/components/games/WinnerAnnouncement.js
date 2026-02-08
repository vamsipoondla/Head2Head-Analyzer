import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { calculatePayouts } from '@/utils/squaresGame';

/**
 * Displays winners for each quarter as they are determined.
 *
 * Props:
 * - winners: Record<string, winnerInfo> — keyed by quarter label
 * - teamA: string — row team name
 * - teamB: string — col team name
 * - wager: number — per-square wager amount
 */
export default function WinnerAnnouncement({ winners, teamA, teamB, wager }) {
  const entries = Object.entries(winners || {});
  if (entries.length === 0) return null;

  const { payouts } = calculatePayouts(wager);

  // Sort by quarter order
  const quarterOrder = { Q1: 1, Q2: 2, Q3: 3, Q4: 4, Final: 5, OT: 5 };
  entries.sort(([a], [b]) => (quarterOrder[a] || 99) - (quarterOrder[b] || 99));

  return (
    <Paper
      sx={{
        p: { xs: 1.5, md: 3 },
        mb: 2,
        background: 'linear-gradient(145deg, #111827 0%, #1a2332 100%)',
        border: '1px solid rgba(76,175,80,0.3)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <EmojiEventsIcon sx={{ color: '#ffd700' }} />
        <Typography variant="h6">Winners</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {entries.map(([quarter, w]) => {
          const prize = payouts[quarter] || payouts['Final'] || 0;
          return (
            <Box
              key={quarter}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(76,175,80,0.08)',
                border: '1px solid rgba(76,175,80,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Chip
                label={quarter}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: quarter === 'Final' ? 'rgba(213,10,10,0.3)' : 'rgba(1,51,105,0.4)',
                  color: '#fff',
                }}
              />
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#4caf50' }}>
                  {w.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {teamA} {w.scoreA} &ndash; {teamB} {w.scoreB} &middot; Last digits: ({w.digitA},{' '}
                  {w.digitB}) &middot; Square ({w.row}, {w.col})
                </Typography>
              </Box>
              {prize > 0 && (
                <Chip
                  label={`$${prize}`}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: 'rgba(255,215,0,0.2)', color: '#ffd700' }}
                />
              )}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
