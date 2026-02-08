import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Snackbar,
  Divider,
  Chip,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CasinoIcon from '@mui/icons-material/Casino';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import Layout from '@/components/Layout';
import SquaresGrid from '@/components/games/SquaresGrid';
import ScoreTracker from '@/components/games/ScoreTracker';
import WinnerAnnouncement from '@/components/games/WinnerAnnouncement';
import {
  createGame,
  findWinner,
  countAssigned,
  saveGame,
  loadGame,
  clearGame,
  calculatePayouts,
} from '@/utils/squaresGame';
import {
  findSuperBowlGame,
  fetchGameSummary,
  parseScores,
  cumulativeScore,
} from '@/utils/espnApi';

const POLL_INTERVAL = 60_000; // 60 seconds

export default function SuperBowlSquares() {
  const { data: session } = useSession();

  // --- Setup state ---
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [wager, setWager] = useState(1);

  // --- Game state ---
  const [gameState, setGameState] = useState(null);
  const [scores, setScores] = useState(null);
  const [highlightCell, setHighlightCell] = useState(null);

  // --- Polling state ---
  const [polling, setPolling] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const pollingRef = useRef(null);
  const gameIdRef = useRef(null);

  // --- Notifications ---
  const [notification, setNotification] = useState(null);

  // Load saved game on mount
  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      setGameState(saved);
      setTeamA(saved.teamA);
      setTeamB(saved.teamB);
      setWager(saved.wager);
      if (saved.gameId) {
        gameIdRef.current = saved.gameId;
      }
    }
  }, []);

  // Persist game state on changes
  useEffect(() => {
    if (gameState) {
      saveGame(gameState);
    }
  }, [gameState]);

  // --- Game creation ---
  const handleCreateGame = () => {
    if (!teamA.trim() || !teamB.trim()) return;
    const newGame = createGame(teamA.trim(), teamB.trim(), Math.max(0.01, wager));
    setGameState(newGame);
    setScores(null);
    setHighlightCell(null);
    gameIdRef.current = null;
    setNotification('Game created! Assign names to the squares, then start score tracking.');
  };

  const handleResetGame = () => {
    clearGame();
    setGameState(null);
    setScores(null);
    setHighlightCell(null);
    setPolling(false);
    if (pollingRef.current) clearInterval(pollingRef.current);
    gameIdRef.current = null;
    setTeamA('');
    setTeamB('');
    setWager(1);
  };

  // --- Grid editing ---
  const handleCellChange = useCallback((row, col, value) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const newGrid = prev.grid.map((r) => [...r]);
      newGrid[row][col] = value;
      return { ...prev, grid: newGrid };
    });
  }, []);

  const handleBulkAssign = useCallback((newGrid) => {
    setGameState((prev) => (prev ? { ...prev, grid: newGrid } : prev));
    setNotification('Names assigned to the grid.');
  }, []);

  // --- Score fetching & winner detection ---
  const detectWinners = useCallback(
    (parsedScores, currentGameState) => {
      if (!parsedScores || !currentGameState) return currentGameState;

      const { homeTeam, awayTeam, homeLinescores, awayLinescores, isComplete } = parsedScores;
      let updated = { ...currentGameState };
      let newWinnerFound = false;

      // Determine which team is teamA (row) and which is teamB (col)
      // Try to match by name
      const norm = (s) => s.toLowerCase();
      const isTeamAHome =
        norm(homeTeam).includes(norm(currentGameState.teamA)) ||
        norm(currentGameState.teamA).includes(norm(homeTeam));

      const teamAScores = isTeamAHome ? homeLinescores : awayLinescores;
      const teamBScores = isTeamAHome ? awayLinescores : homeLinescores;

      // Check each completed quarter
      const quartersToCheck = Math.min(teamAScores.length, teamBScores.length);
      const labels = ['Q1', 'Q2', 'Q3', 'Q4'];

      for (let q = 0; q < quartersToCheck && q < 4; q++) {
        const label = labels[q];
        if (updated.winners[label]) continue; // Already announced

        // Only announce if the quarter data is present
        const cumA = cumulativeScore(teamAScores, q + 1);
        const cumB = cumulativeScore(teamBScores, q + 1);
        const winner = findWinner(updated, cumA, cumB, label);
        updated = {
          ...updated,
          winners: { ...updated.winners, [label]: winner },
        };
        newWinnerFound = true;
        setHighlightCell({ row: winner.row, col: winner.col });
      }

      // Check overtime quarters
      for (let q = 4; q < quartersToCheck; q++) {
        const label = `OT${q - 3 > 1 ? q - 3 : ''}`;
        if (updated.winners[label]) continue;

        const cumA = cumulativeScore(teamAScores, q + 1);
        const cumB = cumulativeScore(teamBScores, q + 1);
        const winner = findWinner(updated, cumA, cumB, label);
        updated = {
          ...updated,
          winners: { ...updated.winners, [label]: winner },
        };
        newWinnerFound = true;
      }

      // Check final
      if (isComplete && !updated.winners['Final']) {
        const totalA = cumulativeScore(teamAScores, teamAScores.length);
        const totalB = cumulativeScore(teamBScores, teamBScores.length);
        const winner = findWinner(updated, totalA, totalB, 'Final');
        updated = {
          ...updated,
          winners: { ...updated.winners, Final: winner },
        };
        newWinnerFound = true;
        setHighlightCell({ row: winner.row, col: winner.col });
      }

      if (newWinnerFound) {
        const latestWinner = Object.values(updated.winners).pop();
        setNotification(
          `${latestWinner.quarter} Winner: ${latestWinner.name} (${currentGameState.teamA} ${latestWinner.scoreA} - ${currentGameState.teamB} ${latestWinner.scoreB})`
        );
      }

      return updated;
    },
    []
  );

  const fetchScores = useCallback(async () => {
    if (!gameState) return;
    setFetchLoading(true);
    setFetchError(null);

    try {
      // Find the game if we don't have an ID yet
      if (!gameIdRef.current) {
        const result = await findSuperBowlGame(gameState.teamA, gameState.teamB);
        if (!result) {
          setFetchError(
            `Could not find a matching game for ${gameState.teamA} vs ${gameState.teamB} on the current ESPN scoreboard. The game may not be scheduled today.`
          );
          setFetchLoading(false);
          return;
        }
        gameIdRef.current = result.gameId;
        setGameState((prev) => (prev ? { ...prev, gameId: result.gameId } : prev));
      }

      // Fetch the game summary
      const summary = await fetchGameSummary(gameIdRef.current);
      const parsed = parseScores(summary);

      if (!parsed) {
        setFetchError('Could not parse game data from ESPN.');
        setFetchLoading(false);
        return;
      }

      setScores(parsed);

      // Detect winners
      setGameState((prev) => {
        if (!prev) return prev;
        return detectWinners(parsed, prev);
      });

      // Stop polling if game is complete
      if (parsed.isComplete) {
        setPolling(false);
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    } catch (err) {
      setFetchError(`Error fetching scores: ${err.message}`);
    } finally {
      setFetchLoading(false);
    }
  }, [gameState, detectWinners]);

  // --- Polling controls ---
  const startPolling = useCallback(() => {
    if (!gameState) return;
    setPolling(true);
    fetchScores(); // Fetch immediately
    pollingRef.current = setInterval(fetchScores, POLL_INTERVAL);
  }, [gameState, fetchScores]);

  const stopPolling = useCallback(() => {
    setPolling(false);
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // --- Computed values ---
  const assigned = gameState ? countAssigned(gameState.grid) : 0;
  const { total: prizePool, payouts } = calculatePayouts(gameState?.wager || wager);

  return (
    <Layout title="Super Bowl Squares">
      <Box sx={{ mb: 4 }}>
        {/* Page Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CasinoIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
          <Typography
            variant="h4"
            sx={{
              mb: 1,
              fontSize: { xs: '1.5rem', md: '2rem' },
              background: 'linear-gradient(135deg, #ffffff 0%, #D50A0A 50%, #013369 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Super Bowl Squares
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Set up your squares pool, track live scores, and find winners automatically.
          </Typography>
        </Box>

        {/* Game Setup or Active Game */}
        {!gameState ? (
          <Paper
            sx={{
              p: { xs: 2, md: 4 },
              maxWidth: 600,
              mx: 'auto',
              background: 'linear-gradient(145deg, #111827 0%, #1a2332 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Typography variant="h6" sx={{ mb: 3 }}>
              Create a New Game
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                label="Team A (Rows)"
                value={teamA}
                onChange={(e) => setTeamA(e.target.value)}
                placeholder="e.g. Kansas City Chiefs"
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Team B (Columns)"
                value={teamB}
                onChange={(e) => setTeamB(e.target.value)}
                placeholder="e.g. San Francisco 49ers"
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Wager per Square"
                type="number"
                value={wager}
                onChange={(e) => setWager(Math.max(0.01, Number(e.target.value) || 0.01))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                helperText={`Total prize pool: $${(wager * 100).toFixed(2)}`}
                fullWidth
                variant="outlined"
              />
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={handleCreateGame}
                disabled={!teamA.trim() || !teamB.trim()}
                startIcon={<CasinoIcon />}
                sx={{ mt: 1 }}
              >
                Create Game
              </Button>
            </Box>
          </Paper>
        ) : (
          <>
            {/* Game controls bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 3,
                flexWrap: 'wrap',
              }}
            >
              <Typography variant="h6" sx={{ flex: 1 }}>
                {gameState.teamA} vs {gameState.teamB}
              </Typography>
              <Chip
                label={`${assigned}/100 assigned`}
                size="small"
                sx={{ fontWeight: 600 }}
                color={assigned === 100 ? 'success' : 'default'}
                variant="outlined"
              />
              <Chip
                label={`$${gameState.wager}/sq`}
                size="small"
                sx={{ fontWeight: 600 }}
                variant="outlined"
              />
              <Chip
                label={`Pool: $${prizePool}`}
                size="small"
                sx={{ fontWeight: 600, color: '#ffd700', borderColor: 'rgba(255,215,0,0.3)' }}
                variant="outlined"
              />
            </Box>

            {/* Score tracking controls */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              {!polling ? (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PlayArrowIcon />}
                  onClick={startPolling}
                  size="small"
                >
                  Start Live Tracking
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<StopIcon />}
                  onClick={stopPolling}
                  size="small"
                  sx={{
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.2)',
                    '&:hover': { borderColor: 'secondary.main' },
                  }}
                >
                  Stop Tracking
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchScores}
                disabled={fetchLoading}
                size="small"
                sx={{
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.2)',
                  '&:hover': { borderColor: 'secondary.main' },
                }}
              >
                Refresh Now
              </Button>
              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={handleResetGame}
                size="small"
                sx={{
                  color: '#ef5350',
                  borderColor: 'rgba(239,83,80,0.3)',
                  '&:hover': { borderColor: '#ef5350', bgcolor: 'rgba(239,83,80,0.1)' },
                }}
              >
                Reset Game
              </Button>
            </Box>

            {/* Wager adjustment */}
            <Box sx={{ mb: 3, maxWidth: 250 }}>
              <TextField
                label="Wager per Square"
                type="number"
                size="small"
                value={gameState.wager}
                onChange={(e) => {
                  const val = Math.max(0.01, Number(e.target.value) || 0.01);
                  setGameState((prev) => (prev ? { ...prev, wager: val } : prev));
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                variant="outlined"
                fullWidth
              />
            </Box>

            {/* Winner announcements */}
            <WinnerAnnouncement
              winners={gameState.winners}
              teamA={gameState.teamA}
              teamB={gameState.teamB}
              wager={gameState.wager}
            />

            {/* Live scores */}
            <ScoreTracker
              scores={scores}
              loading={fetchLoading}
              error={fetchError}
              teamA={gameState.teamA}
              teamB={gameState.teamB}
              pollingActive={polling}
            />

            {/* The grid */}
            <SquaresGrid
              gameState={gameState}
              onCellChange={handleCellChange}
              onBulkAssign={handleBulkAssign}
              winners={gameState.winners}
              highlightCell={highlightCell}
            />

            {/* Rules & Payouts */}
            <Accordion
              sx={{
                mt: 3,
                bgcolor: 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Game Rules & Payouts
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" component="div">
                  <Box component="ol" sx={{ pl: 2, '& li': { mb: 1 } }}>
                    <li>
                      Each square costs <strong>${gameState.wager}</strong>. The total prize pool is{' '}
                      <strong>${prizePool}</strong> (100 squares).
                    </li>
                    <li>
                      Row and column numbers represent the <strong>last digit</strong> of each
                      team&apos;s score. Digits are randomly shuffled for fairness.
                    </li>
                    <li>
                      At the end of each quarter, the last digit of each team&apos;s{' '}
                      <strong>cumulative score</strong> determines the winning square.
                    </li>
                    <li>
                      <strong>Payouts:</strong>
                      <Box component="ul" sx={{ pl: 2, mt: 0.5 }}>
                        <li>Q1: {payouts.Q1 ? `$${payouts.Q1}` : '20%'} (20%)</li>
                        <li>Q2: {payouts.Q2 ? `$${payouts.Q2}` : '20%'} (20%)</li>
                        <li>Q3: {payouts.Q3 ? `$${payouts.Q3}` : '20%'} (20%)</li>
                        <li>Final: {payouts.Final ? `$${payouts.Final}` : '40%'} (40%)</li>
                      </Box>
                    </li>
                    <li>
                      If the game goes to overtime, the OT period is treated as an additional quarter
                      with the Final payout applied to the final score.
                    </li>
                    <li>
                      Winners are announced automatically when live score tracking is active.
                    </li>
                  </Box>
                </Typography>
              </AccordionDetails>
            </Accordion>
          </>
        )}
      </Box>

      {/* Notification snackbar */}
      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification(null)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
