/**
 * Maps historical team names to their current franchise name.
 * Defunct teams that have no modern successor keep their original name.
 */
export const FRANCHISE_MAP = {
  // Arizona Cardinals lineage
  'Chicago Cardinals': 'Arizona Cardinals',
  'St. Louis Cardinals': 'Arizona Cardinals',
  'Phoenix Cardinals': 'Arizona Cardinals',
  'Chi/Pit Cards/Steelers': 'Arizona Cardinals', // 1944 Card-Pitt merger

  // Indianapolis Colts lineage
  'Baltimore Colts': 'Indianapolis Colts',

  // Detroit Lions lineage
  'Portsmouth Spartans': 'Detroit Lions',

  // Washington Commanders lineage
  'Boston Braves': 'Washington Commanders',
  'Boston Redskins': 'Washington Commanders',
  'Washington Redskins': 'Washington Commanders',
  'Washington Football Team': 'Washington Commanders',

  // Tennessee Titans lineage
  'Houston Oilers': 'Tennessee Titans',
  'Tennessee Oilers': 'Tennessee Titans',

  // New England Patriots lineage
  'Boston Patriots': 'New England Patriots',

  // Las Vegas Raiders lineage
  'Oakland Raiders': 'Las Vegas Raiders',
  'Los Angeles Raiders': 'Las Vegas Raiders',

  // Los Angeles Chargers lineage
  'San Diego Chargers': 'Los Angeles Chargers',

  // Los Angeles Rams lineage
  'Cleveland Rams': 'Los Angeles Rams',
  'St. Louis Rams': 'Los Angeles Rams',

  // Pittsburgh Steelers lineage
  'Pittsburgh Pirates': 'Pittsburgh Steelers',

  // Steagles (1943) — credit to Eagles
  'Phi/Pit Eagles/Steelers': 'Philadelphia Eagles',

  // Boston Yanks lineage (defunct — became NY Bulldogs, then NY Yanks, then folded)
  'Boston Yanks': 'Boston Yanks',
  'New York Bulldogs': 'New York Bulldogs',
  'New York Yanks': 'New York Yanks',
  'Bos/Bkn Yanks/Tigers': 'Bos/Bkn Yanks/Tigers',

  // New York Jets lineage (AFL)
  'New York Titans': 'New York Jets',

  // Kansas City Chiefs lineage
  'Dallas Texans': 'Kansas City Chiefs',
};

/**
 * Normalize a team name to its current franchise name.
 * If no mapping exists, returns the original name.
 */
export function normalizeName(name) {
  return FRANCHISE_MAP[name] || name;
}

/**
 * NFL team colors for theming — keyed by current franchise name.
 */
export const TEAM_COLORS = {
  'Arizona Cardinals': { primary: '#97233F', secondary: '#FFB612' },
  'Atlanta Falcons': { primary: '#A71930', secondary: '#000000' },
  'Baltimore Ravens': { primary: '#241773', secondary: '#9E7C0C' },
  'Buffalo Bills': { primary: '#00338D', secondary: '#C60C30' },
  'Carolina Panthers': { primary: '#0085CA', secondary: '#101820' },
  'Chicago Bears': { primary: '#0B162A', secondary: '#C83803' },
  'Cincinnati Bengals': { primary: '#FB4F14', secondary: '#000000' },
  'Cleveland Browns': { primary: '#311D00', secondary: '#FF3C00' },
  'Dallas Cowboys': { primary: '#003594', secondary: '#869397' },
  'Denver Broncos': { primary: '#FB4F14', secondary: '#002244' },
  'Detroit Lions': { primary: '#0076B6', secondary: '#B0B7BC' },
  'Green Bay Packers': { primary: '#203731', secondary: '#FFB612' },
  'Houston Texans': { primary: '#03202F', secondary: '#A71930' },
  'Indianapolis Colts': { primary: '#002C5F', secondary: '#A2AAAD' },
  'Jacksonville Jaguars': { primary: '#006778', secondary: '#9F792C' },
  'Kansas City Chiefs': { primary: '#E31837', secondary: '#FFB81C' },
  'Las Vegas Raiders': { primary: '#000000', secondary: '#A5ACAF' },
  'Los Angeles Chargers': { primary: '#0080C6', secondary: '#FFC20E' },
  'Los Angeles Rams': { primary: '#003594', secondary: '#FFA300' },
  'Miami Dolphins': { primary: '#008E97', secondary: '#FC4C02' },
  'Minnesota Vikings': { primary: '#4F2683', secondary: '#FFC62F' },
  'New England Patriots': { primary: '#002244', secondary: '#C60C30' },
  'New Orleans Saints': { primary: '#D3BC8D', secondary: '#101820' },
  'New York Giants': { primary: '#0B2265', secondary: '#A71930' },
  'New York Jets': { primary: '#125740', secondary: '#000000' },
  'Philadelphia Eagles': { primary: '#004C54', secondary: '#A5ACAF' },
  'Pittsburgh Steelers': { primary: '#FFB612', secondary: '#101820' },
  'San Francisco 49ers': { primary: '#AA0000', secondary: '#B3995D' },
  'Seattle Seahawks': { primary: '#002244', secondary: '#69BE28' },
  'Tampa Bay Buccaneers': { primary: '#D50A0A', secondary: '#FF7900' },
  'Tennessee Titans': { primary: '#0C2340', secondary: '#4B92DB' },
  'Washington Commanders': { primary: '#5A1414', secondary: '#FFB612' },
};

/**
 * Get the list of all 32 current NFL franchises (sorted).
 */
export const CURRENT_TEAMS = Object.keys(TEAM_COLORS).sort();

/**
 * Given a raw team name from the CSV, get the franchise's primary/secondary colors.
 * Falls back to generic NFL colors.
 */
export function getTeamColors(rawName) {
  const normalized = normalizeName(rawName);
  return TEAM_COLORS[normalized] || { primary: '#013369', secondary: '#D50A0A' };
}
