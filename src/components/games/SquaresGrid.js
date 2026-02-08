import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Tooltip,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
} from '@mui/material';

/**
 * 10x10 Super Bowl Squares grid component.
 *
 * Props:
 * - gameState: the full game state object
 * - onCellChange(row, col, name): callback when a cell name changes
 * - onBulkAssign(names[][]): callback for bulk assignment
 * - winners: Record<string, winnerInfo> keyed by quarter label
 * - highlightCell: { row, col } | null — currently highlighted winner cell
 */
export default function SquaresGrid({
  gameState,
  onCellChange,
  onBulkAssign,
  winners,
  highlightCell,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const { teamA, teamB, rowDigits, colDigits, grid } = gameState;

  // Build a set of winning cells for quick lookup
  const winningCells = new Set();
  Object.values(winners || {}).forEach((w) => {
    winningCells.add(`${w.row}-${w.col}`);
  });

  const handleCellEdit = useCallback(
    (row, col, value) => {
      onCellChange(row, col, value);
    },
    [onCellChange]
  );

  const handleBulkAssign = () => {
    // Parse comma or newline separated names into a flat list, then fill grid
    const names = bulkText
      .split(/[,\n]/)
      .map((n) => n.trim())
      .filter(Boolean);

    if (names.length === 0) return;

    const newGrid = grid.map((row) => [...row]);
    let idx = 0;
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (idx < names.length) {
          newGrid[r][c] = names[idx];
          idx++;
        }
      }
    }
    onBulkAssign(newGrid);
    setBulkOpen(false);
    setBulkText('');
  };

  const cellSize = isMobile ? 52 : 64;
  const headerSize = isMobile ? 32 : 40;
  const fontSize = isMobile ? '0.55rem' : '0.7rem';

  return (
    <Paper
      sx={{
        p: { xs: 1.5, md: 3 },
        background: 'linear-gradient(145deg, #111827 0%, #1a2332 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        overflowX: 'auto',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Squares Grid</Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setBulkOpen(true)}
          sx={{
            color: '#fff',
            borderColor: 'rgba(255,255,255,0.2)',
            '&:hover': { borderColor: 'secondary.main', bgcolor: 'rgba(213,10,10,0.1)' },
          }}
        >
          Bulk Assign Names
        </Button>
      </Box>

      {/* Grid container */}
      <Box sx={{ display: 'inline-block', minWidth: 'fit-content' }}>
        {/* Column team label */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: `${headerSize + 4}px` }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: 'secondary.main',
              fontWeight: 700,
              textAlign: 'center',
              width: `${cellSize * 10}px`,
              mb: 0.5,
            }}
          >
            {teamB} (last digit)
          </Typography>
        </Box>

        {/* Column digit headers */}
        <Box sx={{ display: 'flex', ml: `${headerSize + 4}px` }}>
          {colDigits.map((digit, ci) => (
            <Box
              key={ci}
              sx={{
                width: cellSize,
                height: headerSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(1,51,105,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {digit}
            </Box>
          ))}
        </Box>

        {/* Rows */}
        {grid.map((row, ri) => (
          <Box key={ri} sx={{ display: 'flex' }}>
            {/* Row digit header */}
            <Box
              sx={{
                width: headerSize,
                height: cellSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(213,10,10,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontWeight: 700,
                fontSize: '0.85rem',
                mr: '4px',
                ...(ri === 0 && {
                  position: 'relative',
                }),
              }}
            >
              {/* Row team label (vertical, first cell only) */}
              {ri === 0 && (
                <Typography
                  variant="subtitle2"
                  sx={{
                    position: 'absolute',
                    left: -headerSize - 8,
                    top: '50%',
                    transform: 'rotate(-90deg) translateX(-50%)',
                    transformOrigin: 'top left',
                    color: 'secondary.main',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    fontSize: '0.7rem',
                    display: { xs: 'none', md: 'block' },
                  }}
                >
                  {teamA}
                </Typography>
              )}
              {rowDigits[ri]}
            </Box>

            {/* Grid cells */}
            {row.map((cellName, ci) => {
              const isWinner = winningCells.has(`${ri}-${ci}`);
              const isHighlighted =
                highlightCell && highlightCell.row === ri && highlightCell.col === ci;

              return (
                <Tooltip
                  key={ci}
                  title={`${teamA} last digit: ${rowDigits[ri]}, ${teamB} last digit: ${colDigits[ci]}`}
                  arrow
                  placement="top"
                >
                  <Box
                    sx={{
                      width: cellSize,
                      height: cellSize,
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isHighlighted
                        ? 'rgba(213,10,10,0.4)'
                        : isWinner
                          ? 'rgba(76,175,80,0.25)'
                          : 'rgba(255,255,255,0.02)',
                      transition: 'background-color 0.3s',
                      '&:hover': {
                        bgcolor: isHighlighted
                          ? 'rgba(213,10,10,0.5)'
                          : 'rgba(255,255,255,0.06)',
                      },
                      position: 'relative',
                    }}
                  >
                    <TextField
                      value={cellName}
                      onChange={(e) => handleCellEdit(ri, ci, e.target.value)}
                      variant="standard"
                      inputProps={{
                        style: {
                          textAlign: 'center',
                          fontSize,
                          padding: 2,
                          color: isWinner ? '#4caf50' : '#f1f5f9',
                          fontWeight: isWinner ? 700 : 400,
                        },
                      }}
                      InputProps={{ disableUnderline: true }}
                      sx={{ width: '100%', height: '100%' }}
                      placeholder="..."
                    />
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        ))}
      </Box>

      {/* Row team label for mobile */}
      <Typography
        variant="caption"
        sx={{
          display: { xs: 'block', md: 'none' },
          mt: 1,
          color: 'secondary.main',
          fontWeight: 700,
        }}
      >
        Rows: {teamA} (last digit)
      </Typography>

      {/* Bulk assign dialog */}
      <Dialog open={bulkOpen} onClose={() => setBulkOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'background.paper' }}>Bulk Assign Names</DialogTitle>
        <DialogContent sx={{ bgcolor: 'background.paper' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter up to 100 names separated by commas or new lines. Names will be assigned
            left-to-right, top-to-bottom across the grid.
          </Typography>
          <TextField
            multiline
            rows={8}
            fullWidth
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Alice, Bob, Charlie, ..."
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'background.paper' }}>
          <Button onClick={() => setBulkOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleBulkAssign} color="secondary">
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
