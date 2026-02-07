# NFL Rivalry Analyzer

A web app for exploring NFL head-to-head matchups and rivalries across nearly a century of football history — 16,700+ games from 1926 to 2024.

Built with React, Next.js, Material UI, and Recharts.

![Dark themed NFL rivalry analysis dashboard](https://img.shields.io/badge/Games-16%2C700%2B-013369?style=for-the-badge) ![Season range](https://img.shields.io/badge/Seasons-1926--2024-D50A0A?style=for-the-badge)

## Features

- **Team Pair Selector** — searchable dropdowns covering all 32 current NFL franchises plus ~50 historical teams, with popular rivalry shortcuts
- **Record Summary** — all-time win/loss record with visual bar, average scores, splits by game type (Regular Season / Playoff) and day of week, top 3 biggest blowouts
- **Timeline Chart** — interactive scatter plot of every matchup by season, colored by winner, with margin of victory on the y-axis and filters for game type
- **Streaks** — longest win streak per team, current streak, and a visual breakdown of the last 10 matchups
- **Franchise Normalization** — historical team names (e.g. Oakland Raiders, St. Louis Rams, Washington Redskins) are automatically mapped to their current franchise
- **Shareable Links** — every matchup has a direct URL (`/rivalry?teamA=...&teamB=...`) and a share button using the Web Share API with clipboard fallback
- **Dark NFL Theme** — team-specific accent colors, responsive layout for desktop and mobile
- **PWA Support** — web app manifest for home screen installation

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm (included with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/vamsipoondla/Head2Head-Analyzer.git
cd Head2Head-Analyzer

# Install dependencies
npm install
```

### Running in Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

The production server runs on port 3000 by default.

## Project Structure

```
├── public/
│   ├── data/
│   │   └── 1926-2024_COMBINED_NFL_SCORES.csv   # Game dataset
│   └── manifest.json                           # PWA manifest
├── src/
│   ├── components/
│   │   ├── Layout.js            # App shell (navbar + footer)
│   │   ├── TeamSelector.js      # Dual team Autocomplete dropdowns
│   │   ├── RecordSummary.js     # Win/loss record, splits, blowouts
│   │   ├── Timeline.js          # Recharts scatter chart
│   │   ├── Streaks.js           # Streak records and recent form
│   │   └── ShareButton.js       # Web Share / clipboard sharing
│   ├── context/
│   │   └── DataContext.js       # Global data loading via PapaParse
│   ├── pages/
│   │   ├── _app.js              # Theme + data providers
│   │   ├── _document.js         # HTML document setup
│   │   ├── index.js             # Home page
│   │   └── rivalry.js           # Rivalry analysis page
│   ├── styles/
│   │   └── globals.css          # Global styles
│   └── utils/
│       ├── dataProcessing.js    # CSV parsing, filtering, computations
│       ├── teamMappings.js      # Franchise name normalization + team colors
│       └── theme.js             # MUI dark theme
├── package.json
├── next.config.js
└── jsconfig.json
```

## Dataset

The CSV file (`1926-2024_COMBINED_NFL_SCORES.csv`) contains every NFL game result with these columns:

| Column | Description |
|--------|-------------|
| `Date` | Game date (YYYY-MM-DD) |
| `DOW` | Day of week (Sun, Mon, etc.) |
| `WT` | Winning team (full name) |
| `LT` | Losing team (full name) |
| `WTS` | Winning team score |
| `LTS` | Losing team score |
| `Type` | Regular Season or Playoff |
| `Season` | NFL season year |

Ties are represented as rows where `WTS` equals `LTS`.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 14](https://nextjs.org/) (Pages Router) |
| UI | [React 18](https://react.dev/) |
| Components | [Material UI 5](https://mui.com/) |
| Charts | [Recharts](https://recharts.org/) |
| CSV Parsing | [PapaParse](https://www.papaparse.com/) |
| Styling | MUI theme + CSS |

## Usage

1. **Select teams** — use the search dropdowns on the home page or click a popular rivalry chip
2. **Explore the Summary tab** — see overall record, type/day splits, and biggest blowouts
3. **View the Timeline tab** — hover over points for game details, toggle Regular Season / Playoff filters
4. **Check the Streaks tab** — see all-time longest streaks, current streak, and the last 10 games
5. **Share** — click "Share Rivalry Stats" to copy or share a formatted summary with a direct link
