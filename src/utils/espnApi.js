/**
 * ESPN public API utilities for fetching live NFL scores.
 * No API keys required — these are public endpoints.
 */

const SCOREBOARD_URL =
  'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';

const SUMMARY_URL =
  'https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary';

/**
 * Fetch the current NFL scoreboard and locate the Super Bowl event.
 * Searches by shortName containing team abbreviations or by the
 * event name containing "Super Bowl".
 *
 * @param {string} teamA - Full team name (e.g. "Kansas City Chiefs")
 * @param {string} teamB - Full team name (e.g. "San Francisco 49ers")
 * @returns {Promise<{gameId: string, event: object} | null>}
 */
export async function findSuperBowlGame(teamA, teamB) {
  const res = await fetch(SCOREBOARD_URL);
  if (!res.ok) throw new Error(`Scoreboard fetch failed: ${res.status}`);

  const data = await res.json();
  const events = data?.events || [];

  // Normalise strings for matching
  const norm = (s) => s.toLowerCase().trim();
  const teamANorm = norm(teamA);
  const teamBNorm = norm(teamB);

  for (const event of events) {
    const name = norm(event.name || '');
    const shortName = norm(event.shortName || '');
    const seasonType = event.season?.type; // 3 = postseason

    // Check if this event is the Super Bowl by name
    const isSuperBowl = name.includes('super bowl');

    // Check if teams match
    const competitors = event.competitions?.[0]?.competitors || [];
    const eventTeams = competitors.map((c) => norm(c.team?.displayName || ''));
    const teamsMatch =
      eventTeams.some((t) => teamANorm.includes(t) || t.includes(teamANorm)) &&
      eventTeams.some((t) => teamBNorm.includes(t) || t.includes(teamBNorm));

    if (isSuperBowl || teamsMatch) {
      return { gameId: event.id, event };
    }
  }

  return null;
}

/**
 * Fetch the game summary (boxscore) for a given event ID.
 *
 * @param {string} gameId - ESPN event ID
 * @returns {Promise<object>} - Full summary response
 */
export async function fetchGameSummary(gameId) {
  const res = await fetch(`${SUMMARY_URL}?event=${gameId}`);
  if (!res.ok) throw new Error(`Summary fetch failed: ${res.status}`);
  return res.json();
}

/**
 * Parse the summary response into a structured score object.
 *
 * @param {object} summary - Response from fetchGameSummary
 * @returns {{
 *   homeTeam: string,
 *   awayTeam: string,
 *   homeAbbr: string,
 *   awayAbbr: string,
 *   homeLinescores: number[],
 *   awayLinescores: number[],
 *   homeTotalScore: number,
 *   awayTotalScore: number,
 *   quarter: number,
 *   status: string,
 *   statusDetail: string,
 *   isComplete: boolean,
 *   isInProgress: boolean,
 *   isPreGame: boolean,
 * }}
 */
export function parseScores(summary) {
  const competition = summary?.header?.competitions?.[0];
  if (!competition) {
    return null;
  }

  const competitors = competition.competitors || [];
  const home = competitors.find((c) => c.homeAway === 'home') || competitors[0];
  const away = competitors.find((c) => c.homeAway === 'away') || competitors[1];

  const homeLinescores = (home?.linescores || []).map((ls) => Number(ls.displayValue) || 0);
  const awayLinescores = (away?.linescores || []).map((ls) => Number(ls.displayValue) || 0);

  const statusObj = competition.status || {};
  const statusType = statusObj.type || {};
  const statusState = statusType.state || ''; // pre, in, post
  const statusDetail = statusType.shortDetail || statusType.detail || '';
  const quarter = statusObj.period || 0;

  const sum = (arr) => arr.reduce((a, b) => a + b, 0);

  return {
    homeTeam: home?.team?.displayName || 'Home',
    awayTeam: away?.team?.displayName || 'Away',
    homeAbbr: home?.team?.abbreviation || 'HME',
    awayAbbr: away?.team?.abbreviation || 'AWY',
    homeLinescores,
    awayLinescores,
    homeTotalScore: sum(homeLinescores),
    awayTotalScore: sum(awayLinescores),
    quarter,
    status: statusState, // "pre" | "in" | "post"
    statusDetail,
    isComplete: statusState === 'post',
    isInProgress: statusState === 'in',
    isPreGame: statusState === 'pre',
  };
}

/**
 * Compute cumulative scores through a given quarter.
 *
 * @param {number[]} linescores - Array of per-quarter scores
 * @param {number} throughQuarter - 1-based quarter number (1-4, or 5+ for OT)
 * @returns {number}
 */
export function cumulativeScore(linescores, throughQuarter) {
  return linescores.slice(0, throughQuarter).reduce((a, b) => a + b, 0);
}
