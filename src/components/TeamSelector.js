import React, { useState, useMemo } from 'react';
import {
  Autocomplete,
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  Chip,
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { useGameData } from '@/context/DataContext';
import { CURRENT_TEAMS, TEAM_COLORS } from '@/utils/teamMappings';

export default function TeamSelector({ teamA, teamB, onAnalyze }) {
  const { allTeams } = useGameData();
  const [selectedA, setSelectedA] = useState(teamA || null);
  const [selectedB, setSelectedB] = useState(teamB || null);

  const currentSet = useMemo(() => new Set(CURRENT_TEAMS), []);

  const handleAnalyze = () => {
    if (selectedA && selectedB && selectedA !== selectedB) {
      onAnalyze(selectedA, selectedB);
    }
  };

  const getOptionColor = (option) => {
    const colors = TEAM_COLORS[option];
    return colors ? colors.primary : '#555';
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, md: 4 },
        background: 'linear-gradient(145deg, #111827 0%, #1a2332 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
        Select Two Teams to Compare
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Autocomplete
          value={selectedA}
          onChange={(_, val) => setSelectedA(val)}
          options={allTeams}
          groupBy={(option) => (currentSet.has(option) ? 'Current NFL Teams' : 'Historical Teams')}
          sx={{ flex: 1, width: '100%' }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Team A"
              placeholder="Search teams..."
              variant="outlined"
            />
          )}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return (
              <li key={key} {...rest}>
                <Chip
                  size="small"
                  sx={{
                    bgcolor: getOptionColor(option),
                    width: 12,
                    height: 12,
                    mr: 1,
                    minWidth: 12,
                  }}
                />
                {option}
              </li>
            );
          }}
        />

        <CompareArrowsIcon
          sx={{
            fontSize: 40,
            color: 'secondary.main',
            flexShrink: 0,
          }}
        />

        <Autocomplete
          value={selectedB}
          onChange={(_, val) => setSelectedB(val)}
          options={allTeams}
          groupBy={(option) => (currentSet.has(option) ? 'Current NFL Teams' : 'Historical Teams')}
          sx={{ flex: 1, width: '100%' }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Team B"
              placeholder="Search teams..."
              variant="outlined"
            />
          )}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return (
              <li key={key} {...rest}>
                <Chip
                  size="small"
                  sx={{
                    bgcolor: getOptionColor(option),
                    width: 12,
                    height: 12,
                    mr: 1,
                    minWidth: 12,
                  }}
                />
                {option}
              </li>
            );
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleAnalyze}
          disabled={!selectedA || !selectedB || selectedA === selectedB}
          sx={{
            px: 5,
            py: 1.5,
            fontSize: '1.1rem',
            background: 'linear-gradient(135deg, #D50A0A 0%, #8B0000 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #ff1a1a 0%, #a00000 100%)',
            },
            '&.Mui-disabled': {
              background: 'rgba(255,255,255,0.1)',
            },
          }}
          startIcon={<CompareArrowsIcon />}
        >
          Analyze Rivalry
        </Button>
      </Box>

      {selectedA && selectedB && selectedA === selectedB && (
        <Typography
          color="error"
          variant="body2"
          sx={{ mt: 1, textAlign: 'center' }}
        >
          Please select two different teams.
        </Typography>
      )}
    </Paper>
  );
}
