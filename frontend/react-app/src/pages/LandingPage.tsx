import React, { useState } from 'react';
import { Button, TextField, Typography, Paper, Box, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';

const LandingPage: React.FC = () => {
  const [newSessionName, setNewSessionName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Create session
      const createResponse = await ApiService.createSession(newSessionName);
      
      // Automatically join as creator with collaborator permissions
      const joinResponse = await ApiService.joinSession(
        createResponse.collaboratorCode,
        'Creator'
      );
      
      // Store session info in sessionStorage for DocumentPage
      sessionStorage.setItem('sessionData', JSON.stringify({
        sessionId: joinResponse.sessionId,
        sessionName: joinResponse.sessionName,
        userId: joinResponse.userId,
        role: joinResponse.role,
        nodes: joinResponse.nodes,
        users: joinResponse.users,
        viewerCode: joinResponse.viewerCode,
        collaboratorCode: joinResponse.collaboratorCode,
      }));
      navigate(`/document/${joinResponse.sessionId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!joinCode.trim() || !username.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.joinSession(joinCode, username);
      // Store session info in sessionStorage for DocumentPage
      sessionStorage.setItem('sessionData', JSON.stringify({
        sessionId: response.sessionId,
        sessionName: response.sessionName,
        userId: response.userId,
        role: response.role,
        nodes: response.nodes,
        users: response.users,
        viewerCode: response.viewerCode,
        collaboratorCode: response.collaboratorCode,
      }));
      navigate(`/document/${response.sessionId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" sx={{ backgroundColor: '#f5f5f5' }}>
      <Typography variant="h3" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        CRDT Text Editor
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2, width: 350 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 4, mb: 4, width: 350 }}>
        <Typography variant="h5" gutterBottom>Create a New Session</Typography>
        <TextField
          label="Session Name"
          value={newSessionName}
          onChange={e => setNewSessionName(e.target.value)}
          fullWidth
          margin="normal"
          disabled={loading}
        />
        <Button 
          variant="contained" 
          color="primary" 
          fullWidth 
          onClick={handleCreateSession} 
          disabled={!newSessionName.trim() || loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Create Session'}
        </Button>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 4, width: 350 }}>
        <Typography variant="h5" gutterBottom>Join Existing Session</Typography>
        <TextField
          label="Your Name"
          value={username}
          onChange={e => setUsername(e.target.value)}
          fullWidth
          margin="normal"
          disabled={loading}
        />
        <TextField
          label="Session Code"
          value={joinCode}
          onChange={e => setJoinCode(e.target.value)}
          fullWidth
          margin="normal"
          disabled={loading}
        />
        <Button 
          variant="contained" 
          color="secondary" 
          fullWidth 
          onClick={handleJoinSession} 
          disabled={!joinCode.trim() || !username.trim() || loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Join Session'}
        </Button>
      </Paper>
    </Box>
  );
};

export default LandingPage;
