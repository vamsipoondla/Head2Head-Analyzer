import { normalizeName } from './teamMappings';

/**
 * Parse raw CSV rows into cleaned game objects.
 * Each row: { date, dow, wt, lt, wts, lts, type, season, margin, totalPoints, isTie }
 */
export function parseGames(rawRows) {
  return rawRows
    .filter((row) => row.Date && row.WT && row.LT)
    .map((row) => {
      const wts = parseInt(row.WTS, 10);
      const lts = parseInt(row.LTS, 10);
      return {
        date: row.Date,
        dow: row.DOW,
        wt: row.WT.trim(),
        lt: row.LT.trim(),
        wtNorm: normalizeName(row.WT.trim()),
        ltNorm: normalizeName(row.LT.trim()),
        wts,
        lts,
        type: row.Type ? row.Type.trim() : 'Regular Season',
        season: parseInt(row.Season, 10),
        margin: wts - lts,
        totalPoints: wts + lts,
        isTie: wts === lts,
      };
    });
}

/**
 * Extract all unique franchise names from the dataset (normalized).
 */
export function getUniqueTeams(games) {
  const teams = new Set();
  games.forEach((g) => {
    teams.add(g.wtNorm);
    teams.add(g.ltNorm);
  });
  return [...teams].sort();
}

/**
 * Filter games for a specific head-to-head matchup between two franchises.
 * Uses normalized names so historical games are included.
 */
export function filterMatchup(games, teamA, teamB) {
  return games.filter(
    (g) =>
      (g.wtNorm === teamA && g.ltNorm === teamB) ||
      (g.wtNorm === teamB && g.ltNorm === teamA)
  );
}

/**
 * Compute the full record summary for teamA vs teamB.
 */
export function computeRecord(matchupGames, teamA, teamB) {
  let aWins = 0;
  let bWins = 0;
  let ties = 0;
  let aPointsWhenWinning = 0;
  let aPointsWhenLosing = 0;
  let bPointsWhenWinning = 0;
  let bPointsWhenLosing = 0;
  let aWinCount = 0;
  let aLossCount = 0;
  let bWinCount = 0;
  let bLossCount = 0;

  matchupGames.forEach((g) => {
    if (g.isTie) {
      ties++;
    } else if (g.wtNorm === teamA) {
      aWins++;
      aPointsWhenWinning += g.wts;
      bPointsWhenLosing += g.lts;
      aWinCount++;
      bLossCount++;
    } else {
      bWins++;
      bPointsWhenWinning += g.wts;
      aPointsWhenLosing += g.lts;
      bWinCount++;
      aLossCount++;
    }
  });

  return {
    totalGames: matchupGames.length,
    aWins,
    bWins,
    ties,
    aAvgWinScore: aWinCount > 0 ? (aPointsWhenWinning / aWinCount).toFixed(1) : '0',
    aAvgLossScore: aLossCount > 0 ? (aPointsWhenLosing / aLossCount).toFixed(1) : '0',
    bAvgWinScore: bWinCount > 0 ? (bPointsWhenWinning / bWinCount).toFixed(1) : '0',
    bAvgLossScore: bLossCount > 0 ? (bPointsWhenLosing / bLossCount).toFixed(1) : '0',
  };
}

/**
 * Compute record split by game type (Regular Season / Playoff).
 */
export function computeRecordByType(matchupGames, teamA, teamB) {
  const regular = matchupGames.filter((g) => g.type === 'Regular Season');
  const playoff = matchupGames.filter((g) => g.type === 'Playoff');
  return {
    regular: computeRecord(regular, teamA, teamB),
    playoff: computeRecord(playoff, teamA, teamB),
  };
}

/**
 * Compute record split by day of week.
 */
export function computeRecordByDay(matchupGames, teamA, teamB) {
  const days = {};
  matchupGames.forEach((g) => {
    if (!days[g.dow]) days[g.dow] = [];
    days[g.dow].push(g);
  });
  const result = {};
  Object.entries(days).forEach(([day, games]) => {
    result[day] = computeRecord(games, teamA, teamB);
  });
  return result;
}

/**
 * Find the top N biggest blowouts in the matchup.
 */
export function biggestBlowouts(matchupGames, n = 3) {
  return [...matchupGames]
    .filter((g) => !g.isTie)
    .sort((a, b) => b.margin - a.margin)
    .slice(0, n);
}

/**
 * Compute win streaks for a head-to-head matchup.
 * Returns: { aLongest, bLongest, currentStreak }
 * currentStreak: { team, count }
 */
export function computeStreaks(matchupGames, teamA, teamB) {
  // Sort by date ascending
  const sorted = [...matchupGames].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  let aLongest = 0;
  let bLongest = 0;
  let aCurrent = 0;
  let bCurrent = 0;

  sorted.forEach((g) => {
    if (g.isTie) {
      // Ties reset both streaks
      aCurrent = 0;
      bCurrent = 0;
    } else if (g.wtNorm === teamA) {
      aCurrent++;
      bCurrent = 0;
      if (aCurrent > aLongest) aLongest = aCurrent;
    } else {
      bCurrent++;
      aCurrent = 0;
      if (bCurrent > bLongest) bLongest = bCurrent;
    }
  });

  const currentStreak =
    aCurrent > 0
      ? { team: teamA, count: aCurrent }
      : bCurrent > 0
      ? { team: teamB, count: bCurrent }
      : { team: null, count: 0 };

  return { aLongest, bLongest, currentStreak };
}

/**
 * Get the last N games of a matchup sorted by most recent first.
 */
export function recentGames(matchupGames, n = 10) {
  return [...matchupGames]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, n);
}

/**
 * Prepare timeline data for charting.
 * Returns array of { date, season, margin, totalPoints, winner, wt, lt, wts, lts, type }
 * margin is positive when teamA wins, negative when teamB wins.
 */
export function prepareTimeline(matchupGames, teamA) {
  return [...matchupGames]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((g) => {
      const aIsWinner = g.wtNorm === teamA;
      return {
        date: g.date,
        season: g.season,
        margin: aIsWinner ? g.margin : -g.margin,
        totalPoints: g.totalPoints,
        winner: g.isTie ? 'Tie' : aIsWinner ? teamA : g.wtNorm,
        wt: g.wt,
        lt: g.lt,
        wts: g.wts,
        lts: g.lts,
        type: g.type,
        dow: g.dow,
        isTie: g.isTie,
      };
    });
}
