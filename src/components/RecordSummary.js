import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { getTeamColors } from '@/utils/teamMappings';
import {
  computeRecord,
  computeRecordByType,
  computeRecordByDay,
  biggestBlowouts,
} from '@/utils/dataProcessing';

function RecordBar({ aWins, bWins, ties, teamA, teamB }) {
  const total = aWins + bWins + ties;
  if (total === 0) return null;
  const aPct = (aWins / total) * 100;
  const tPct = (ties / total) * 100;
  const colorsA = getTeamColors(teamA);
  const colorsB = getTeamColors(teamB);

  return (
    <Box sx={{ width: '100%', mt: 1, mb: 2 }}>
      <Box
        sx={{
          display: 'flex',
          height: 32,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        {aWins > 0 && (
          <Box
            sx={{
              width: `${aPct}%`,
              bgcolor: colorsA.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'width 0.5s ease',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#fff', fontSize: '0.7rem' }}>
              {aWins}
            </Typography>
          </Box>
        )}
        {ties > 0 && (
          <Box
            sx={{
              width: `${tPct}%`,
              bgcolor: '#555',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#fff', fontSize: '0.7rem' }}>
              {ties}
            </Typography>
          </Box>
        )}
        {bWins > 0 && (
          <Box
            sx={{
              flex: 1,
              bgcolor: colorsB.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'width 0.5s ease',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#fff', fontSize: '0.7rem' }}>
              {bWins}
            </Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography variant="caption" sx={{ color: colorsA.primary, fontWeight: 600 }}>
          {teamA}
        </Typography>
        {ties > 0 && (
          <Typography variant="caption" sx={{ color: '#888' }}>
            Ties
          </Typography>
        )}
        <Typography variant="caption" sx={{ color: colorsB.primary, fontWeight: 600 }}>
          {teamB}
        </Typography>
      </Box>
    </Box>
  );
}

function StatCard({ label, value, sublabel }) {
  return (
    <Paper
      sx={{
        p: 2,
        textAlign: 'center',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ my: 0.5 }}>
        {value}
      </Typography>
      {sublabel && (
        <Typography variant="caption" color="text.secondary">
          {sublabel}
        </Typography>
      )}
    </Paper>
  );
}

export default function RecordSummary({ matchupGames, teamA, teamB }) {
  const record = useMemo(() => computeRecord(matchupGames, teamA, teamB), [matchupGames, teamA, teamB]);
  const byType = useMemo(() => computeRecordByType(matchupGames, teamA, teamB), [matchupGames, teamA, teamB]);
  const byDay = useMemo(() => computeRecordByDay(matchupGames, teamA, teamB), [matchupGames, teamA, teamB]);
  const blowouts = useMemo(() => biggestBlowouts(matchupGames, 3), [matchupGames]);

  if (matchupGames.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No games found between these two teams.
        </Typography>
      </Paper>
    );
  }

  const leader =
    record.aWins > record.bWins
      ? teamA
      : record.bWins > record.aWins
      ? teamB
      : null;

  const colorsA = getTeamColors(teamA);
  const colorsB = getTeamColors(teamB);

  return (
    <Box>
      {/* Overall Record */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(145deg, #111827 0%, #1a2332 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <EmojiEventsIcon sx={{ color: '#FFB612' }} />
          <Typography variant="h5">All-Time Record</Typography>
          {leader && (
            <Chip
              label={`${leader} leads`}
              size="small"
              sx={{
                ml: 'auto',
                bgcolor: getTeamColors(leader).primary,
                color: '#fff',
                fontWeight: 700,
              }}
            />
          )}
        </Box>

        <RecordBar
          aWins={record.aWins}
          bWins={record.bWins}
          ties={record.ties}
          teamA={teamA}
          teamB={teamB}
        />

        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <StatCard label="Total Games" value={record.totalGames} />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard
              label={`${teamA} Wins`}
              value={record.aWins}
              sublabel={`Avg score: ${record.aAvgWinScore} pts`}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard
              label={`${teamB} Wins`}
              value={record.bWins}
              sublabel={`Avg score: ${record.bAvgWinScore} pts`}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <StatCard label="Ties" value={record.ties} />
          </Grid>
        </Grid>
      </Paper>

      {/* Record by Type */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(145deg, #111827 0%, #1a2332 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Regular Season vs. Playoff
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              Regular Season ({byType.regular.totalGames} games)
            </Typography>
            <RecordBar
              aWins={byType.regular.aWins}
              bWins={byType.regular.bWins}
              ties={byType.regular.ties}
              teamA={teamA}
              teamB={teamB}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              Playoffs ({byType.playoff.totalGames} games)
            </Typography>
            {byType.playoff.totalGames > 0 ? (
              <RecordBar
                aWins={byType.playoff.aWins}
                bWins={byType.playoff.bWins}
                ties={byType.playoff.ties}
                teamA={teamA}
                teamB={teamB}
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No playoff matchups
              </Typography>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Record by Day */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(145deg, #111827 0%, #1a2332 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Performance by Day
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Day</TableCell>
                <TableCell align="center">Games</TableCell>
                <TableCell align="center" sx={{ color: colorsA.primary }}>{teamA}</TableCell>
                <TableCell align="center" sx={{ color: colorsB.primary }}>{teamB}</TableCell>
                <TableCell align="center">Ties</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(byDay)
                .sort(([a], [b]) => {
                  const order = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                  return order.indexOf(a) - order.indexOf(b);
                })
                .map(([day, rec]) => (
                  <TableRow key={day}>
                    <TableCell>{day}</TableCell>
                    <TableCell align="center">{rec.totalGames}</TableCell>
                    <TableCell align="center">{rec.aWins}</TableCell>
                    <TableCell align="center">{rec.bWins}</TableCell>
                    <TableCell align="center">{rec.ties}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Biggest Blowouts */}
      {blowouts.length > 0 && (
        <Paper sx={{ p: 3, background: 'linear-gradient(145deg, #111827 0%, #1a2332 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Biggest Blowouts 💥
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Winner</TableCell>
                  <TableCell align="center">Score</TableCell>
                  <TableCell align="center">Margin</TableCell>
                  <TableCell>Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {blowouts.map((g, i) => (
                  <TableRow key={i}>
                    <TableCell>{g.date}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{g.wt}</TableCell>
                    <TableCell align="center">
                      {g.wts} &ndash; {g.lts}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`+${g.margin}`}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(213, 10, 10, 0.2)',
                          color: '#ff6b6b',
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell>{g.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
