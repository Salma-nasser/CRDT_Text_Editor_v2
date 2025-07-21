import React, { useState } from 'react';
import { Button, TextField, Typography, Paper, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const [newSessionName, setNewSessionName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const navigate = useNavigate();

  // Placeholder handlers
  const handleCreateSession = () => {
    // Here you would create the session, then redirect
    // For now, just redirect with session name in URL
    navigate(`/document/${encodeURIComponent(newSessionName)}`);
  };

  const handleJoinSession = () => {
    // Here you would verify the code, then redirect
    // For now, just redirect with code in URL
    navigate(`/document/${encodeURIComponent(joinCode)}`);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
      <Paper elevation={3} sx={{ p: 4, mb: 4, width: 350 }}>
        <Typography variant="h5" gutterBottom>Create a New Session</Typography>
        <TextField
          label="Session Name"
          value={newSessionName}
          onChange={e => setNewSessionName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="primary" fullWidth onClick={handleCreateSession} disabled={!newSessionName}>
          Create Session
        </Button>
      </Paper>
      <Paper elevation={3} sx={{ p: 4, width: 350 }}>
        <Typography variant="h5" gutterBottom>Join Existing Session</Typography>
        <TextField
          label="Session Code"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button variant="contained" color="secondary" fullWidth onClick={handleJoinSession} disabled={!joinCode}>
          Join Session
        </Button>
      </Paper>
    </Box>
  );
};

export default LandingPage;
