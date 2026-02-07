import React, { useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { computeRecord } from '@/utils/dataProcessing';

export default function ShareButton({ matchupGames, teamA, teamB }) {
  const [snackOpen, setSnackOpen] = useState(false);

  const record = computeRecord(matchupGames, teamA, teamB);

  const shareText = [
    `🏈 NFL Rivalry: ${teamA} vs ${teamB}`,
    `📊 All-Time Record: ${teamA} ${record.aWins}W - ${record.bWins}W${record.ties > 0 ? ` - ${record.ties}T` : ''}`,
    `📈 ${record.totalGames} total games played`,
    record.aWins > record.bWins
      ? `${teamA} leads the series! 🔥`
      : record.bWins > record.aWins
      ? `${teamB} leads the series! 🔥`
      : `The series is tied! ⚡`,
    '',
    '#NFL #Rivalry #HeadToHead',
  ].join('\n');

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/rivalry?teamA=${encodeURIComponent(teamA)}&teamB=${encodeURIComponent(teamB)}`
    : '';

  const handleShare = async () => {
    // Try Web Share API first
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${teamA} vs ${teamB} - NFL Rivalry`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or not supported — fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setSnackOpen(true);
    } catch {
      // Final fallback
      const textArea = document.createElement('textarea');
      textArea.value = `${shareText}\n${shareUrl}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setSnackOpen(true);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<ShareIcon />}
        onClick={handleShare}
        sx={{
          borderColor: 'rgba(255,255,255,0.2)',
          color: 'text.primary',
          '&:hover': {
            borderColor: 'secondary.main',
            bgcolor: 'rgba(213, 10, 10, 0.1)',
          },
        }}
      >
        Share Rivalry Stats
      </Button>

      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity="success"
          icon={<ContentCopyIcon />}
          sx={{ bgcolor: 'background.paper' }}
        >
          Rivalry stats copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}
