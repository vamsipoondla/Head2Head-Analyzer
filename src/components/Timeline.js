import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { getTeamColors } from '@/utils/teamMappings';
import { prepareTimeline } from '@/utils/dataProcessing';

function CustomTooltip({ active, payload, teamA, teamB }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <Paper
      sx={{
        p: 1.5,
        bgcolor: 'background.paper',
        border: '1px solid rgba(255,255,255,0.2)',
        maxWidth: 280,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {d.wt} {d.wts} &ndash; {d.lts} {d.lt}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        {d.date} &middot; {d.dow} &middot; {d.type}
      </Typography>
      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
        {d.isTie
          ? 'Tie game'
          : d.margin > 0
          ? `${teamA} won by ${d.margin}`
          : `${teamB} won by ${Math.abs(d.margin)}`}
      </Typography>
    </Paper>
  );
}

export default function Timeline({ matchupGames, teamA, teamB }) {
  const [showRegular, setShowRegular] = useState(true);
  const [showPlayoff, setShowPlayoff] = useState(true);

  const colorsA = getTeamColors(teamA);
  const colorsB = getTeamColors(teamB);

  const timelineData = useMemo(
    () => prepareTimeline(matchupGames, teamA),
    [matchupGames, teamA]
  );

  const filteredData = useMemo(() => {
    return timelineData.filter((d) => {
      if (d.type === 'Regular Season' && !showRegular) return false;
      if (d.type === 'Playoff' && !showPlayoff) return false;
      return true;
    });
  }, [timelineData, showRegular, showPlayoff]);

  if (matchupGames.length === 0) {
    return null;
  }

  return (
    <Paper
      sx={{
        p: 3,
        background: 'linear-gradient(145deg, #111827 0%, #1a2332 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Game-by-Game Timeline</Typography>
        <FormGroup row>
          <FormControlLabel
            control={
              <Checkbox
                checked={showRegular}
                onChange={(e) => setShowRegular(e.target.checked)}
                size="small"
              />
            }
            label="Regular Season"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={showPlayoff}
                onChange={(e) => setShowPlayoff(e.target.checked)}
                size="small"
                color="secondary"
              />
            }
            label="Playoff"
          />
        </FormGroup>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Points above the line = {teamA} win &middot; Below = {teamB} win &middot; Margin of victory shown
      </Typography>

      <Box sx={{ width: '100%', height: { xs: 300, md: 400 } }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="season"
              name="Season"
              type="number"
              domain={['dataMin', 'dataMax']}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={{ stroke: '#94a3b8' }}
            />
            <YAxis
              dataKey="margin"
              name="Margin"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={{ stroke: '#94a3b8' }}
              label={{
                value: 'Point Margin',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#94a3b8', fontSize: 12 },
              }}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
            <Tooltip content={<CustomTooltip teamA={teamA} teamB={teamB} />} />
            <Scatter data={filteredData} shape="circle">
              {filteredData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.isTie
                      ? '#888'
                      : entry.margin > 0
                      ? colorsA.primary
                      : colorsB.primary
                  }
                  opacity={entry.type === 'Playoff' ? 1 : 0.7}
                  r={entry.type === 'Playoff' ? 6 : 4}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: colorsA.primary }} />
          <Typography variant="caption">{teamA} win</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: colorsB.primary }} />
          <Typography variant="caption">{teamB} win</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#888' }} />
          <Typography variant="caption">Tie</Typography>
        </Box>
      </Box>
    </Paper>
  );
}
