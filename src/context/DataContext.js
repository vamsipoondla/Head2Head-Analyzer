import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Papa from 'papaparse';
import { parseGames, getUniqueTeams } from '@/utils/dataProcessing';
import { CURRENT_TEAMS } from '@/utils/teamMappings';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { status } = useSession();
  const [games, setGames] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch game data once the user is authenticated
    if (status !== 'authenticated') {
      setLoading(status === 'loading');
      return;
    }

    async function loadData() {
      try {
        const response = await fetch('/api/games');
        if (response.status === 401) throw new Error('Please sign in to access game data');
        if (!response.ok) throw new Error('Failed to fetch game data');
        const csvText = await response.text();

        const result = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });

        if (result.errors.length > 0) {
          console.warn('CSV parse warnings:', result.errors.slice(0, 5));
        }

        const parsed = parseGames(result.data);
        setGames(parsed);

        // Combine current NFL teams with any additional historical teams in the data
        const dataTeams = getUniqueTeams(parsed);
        const currentSet = new Set(CURRENT_TEAMS);
        const historical = dataTeams.filter((t) => !currentSet.has(t));
        // Show current teams first, then historical
        setAllTeams([...CURRENT_TEAMS, ...historical]);
        setLoading(false);
      } catch (err) {
        console.error('Error loading game data:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    loadData();
  }, [status]);

  return (
    <DataContext.Provider value={{ games, allTeams, loading, error }}>
      {children}
    </DataContext.Provider>
  );
}

export function useGameData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useGameData must be used within DataProvider');
  return ctx;
}
