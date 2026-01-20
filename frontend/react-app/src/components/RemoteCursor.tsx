import React from 'react';
import { Box, Typography } from '@mui/material';

interface RemoteCursorProps {
  userId?: string;
  username?: string;
  color?: string;
  position?: number;
  offset?: { top: number; left: number };
}

const RemoteCursor: React.FC<RemoteCursorProps> = ({ userId, username, color, position, offset = { top: 0, left: 0 } }) => {
  // This is a simplified version - in a full implementation,
  // we would track all remote cursors from the session context
  // and render them at their respective positions
  
  if (!userId || position === undefined) {
    return null;
  }

  // Font metrics for monospace 14px (approximate)
  // Character width is roughly 8.4px for 14px monospace (depends on font)
  // We'll use ch unit but add the offset
  const charWidth = 8.4; 

  return (
    <Box
      sx={{
        position: 'absolute',
        left: `calc(${offset.left}px + ${position}ch)`,
        top: `${offset.top}px`,
        width: '2px',
        height: '22px', // Slightly larger than line-height (1.6 * 14 = 22.4)
        backgroundColor: color || '#000',
        zIndex: 10,
        pointerEvents: 'none', // Allow clicking through the cursor
        animation: 'blink 1s infinite',
        '@keyframes blink': {
          '0%, 49%': { opacity: 1 },
          '50%, 100%': { opacity: 0 },
        },
      }}
    >
      <Typography
        sx={{
          position: 'absolute',
          top: '-20px',
          left: '0',
          fontSize: '10px',
          backgroundColor: color || '#000',
          color: '#fff',
          padding: '2px 4px',
          borderRadius: '2px',
          whiteSpace: 'nowrap',
          fontFamily: 'sans-serif', // Keep name readable
        }}
      >
        {username}
      </Typography>
    </Box>
  );
};

export default RemoteCursor;
