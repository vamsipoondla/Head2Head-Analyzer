import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '@/utils/theme';
import { DataProvider } from '@/context/DataContext';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DataProvider>
        <Component {...pageProps} />
      </DataProvider>
    </ThemeProvider>
  );
}
