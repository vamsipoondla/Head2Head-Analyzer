import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '@/utils/theme';
import { DataProvider } from '@/context/DataContext';
import '@/styles/globals.css';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <DataProvider>
          <Component {...pageProps} />
        </DataProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
