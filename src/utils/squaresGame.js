/**
 * Super Bowl Squares game logic utilities.
 * Handles grid creation, shuffling, winner detection, and state persistence.
 */

const STORAGE_KEY = 'sbSquaresGame';

/**
 * Fisher-Yates shuffle — returns a new shuffled copy of the array.
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Create a fresh game state with randomised digit assignments.
 *
 * @param {string} teamA - Row team name
 * @param {string} teamB - Column team name
 * @param {number} wager - Dollar amount per square
 * @returns {object} Initial game state
 */
export function createGame(teamA, teamB, wager = 1) {
  const rowDigits = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const colDigits = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

  // 10x10 grid initialised with empty names
  const grid = Array.from({ length: 10 }, () => Array(10).fill(''));

  return {
    id: Date.now().toString(36),
    teamA,
    teamB,
    rowDigits, // teamA's score last-digit assignments (row headers)
    colDigits, // teamB's score last-digit assignments (col headers)
    grid, // grid[row][col] = assigned player name
    wager,
    winners: {}, // keyed by quarter label: { quarter, row, col, digit pair, name }
    gameId: null, // ESPN event ID, populated after finding game
    createdAt: new Date().toISOString(),
  };
}

/**
 * Given cumulative scores and the grid config, find the winner for a quarter.
 *
 * @param {object} gameState - The squares game state
 * @param {number} teamAScore - Cumulative score for teamA (row team)
 * @param {number} teamBScore - Cumulative score for teamB (col team)
 * @param {string} quarterLabel - e.g. "Q1", "Q2", "Q3", "Q4", "OT", "Final"
 * @returns {object} Winner info
 */
export function findWinner(gameState, teamAScore, teamBScore, quarterLabel) {
  const lastDigitA = teamAScore % 10;
  const lastDigitB = teamBScore % 10;

  // Find row index where rowDigits[row] === lastDigitA
  const row = gameState.rowDigits.indexOf(lastDigitA);
  // Find col index where colDigits[col] === lastDigitB
  const col = gameState.colDigits.indexOf(lastDigitB);

  const name = gameState.grid[row]?.[col] || '(unassigned)';

  return {
    quarter: quarterLabel,
    row,
    col,
    digitA: lastDigitA,
    digitB: lastDigitB,
    scoreA: teamAScore,
    scoreB: teamBScore,
    name,
  };
}

/**
 * Count how many squares have been assigned a name.
 */
export function countAssigned(grid) {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell.trim()) count++;
    }
  }
  return count;
}

/**
 * Save game state to localStorage.
 */
export function saveGame(gameState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

/**
 * Load game state from localStorage.
 * @returns {object|null}
 */
export function loadGame() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clear saved game state.
 */
export function clearGame() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Quarter labels including overtime.
 */
export const QUARTER_LABELS = ['Q1', 'Q2', 'Q3', 'Q4', 'OT'];

/**
 * Default payout percentages per quarter.
 * Q1: 20%, Q2: 20%, Q3: 20%, Final: 40%
 */
export const DEFAULT_PAYOUTS = {
  Q1: 0.2,
  Q2: 0.2,
  Q3: 0.2,
  Final: 0.4,
};

/**
 * Calculate the prize pool and per-quarter payouts.
 *
 * @param {number} wager - Dollar amount per square
 * @returns {{ total: number, payouts: Record<string, number> }}
 */
export function calculatePayouts(wager) {
  const total = wager * 100;
  const payouts = {};
  for (const [q, pct] of Object.entries(DEFAULT_PAYOUTS)) {
    payouts[q] = Math.round(total * pct * 100) / 100;
  }
  return { total, payouts };
}
