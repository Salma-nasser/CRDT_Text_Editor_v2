import React, { useEffect, useState } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ExitToApp as ExitToAppIcon,
  People as PeopleIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { SessionProvider, useSession } from '../context/SessionContext';
import CollaborativeEditor from '../components/CollaborativeEditor';
import UserSidebar from '../components/UserSidebar';

import ApiService from '../services/ApiService';

const DocumentPageContent: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { connectToSession, disconnectFromSession, connectionStatus, sessionName, userRole } = useSession();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionCodes, setSessionCodes] = useState<{
    viewerCode?: string;
    collaboratorCode?: string;
  }>({});

  useEffect(() => {
    const initializeSession = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        // Get session data from sessionStorage
        const sessionDataStr = sessionStorage.getItem('sessionData');
        let sessionData: any;

        if (sessionDataStr) {
          sessionData = JSON.parse(sessionDataStr);
        } else {
          // If not in storage, we need to fetch basic info or ask user to re-join
          // But since we can't join without a code, we can't just fetch.
          // However, if the user is already here, they might just need the codes if they are valid.
          // Wait, if sessionData is missing, we don't have userId or role either.
          // The user MUST go through the join process to get a userId and role.
          setError('Session data not found. Please rejoin the session.');
          setLoading(false);
          return;
        }
        
        // Ensure codes are present. If missing (e.g. from older sessionData), try to fetch them
        // Note: fetch will fail if we don't have a new endpoint, but we added one.
        if (!sessionData.viewerCode || !sessionData.collaboratorCode) {
           try {
             const info = await ApiService.getSession(sessionId);
             sessionData.viewerCode = info.viewerCode;
             sessionData.collaboratorCode = info.collaboratorCode;
             // Update storage
             sessionStorage.setItem('sessionData', JSON.stringify(sessionData));
           } catch (e) {
             console.warn('Could not fetch session codes', e);
           }
        }
        
        // Store codes
        setSessionCodes({
          viewerCode: sessionData.viewerCode,
          collaboratorCode: sessionData.collaboratorCode,
        });

        // Connect to session
        await connectToSession(
          sessionData.sessionId,
          sessionData.sessionName,
          sessionData.userId || 'creator-' + Date.now(),
          sessionData.role || 'collaborator',
          sessionData.nodes || [],
          sessionData.users || []
        );

        setLoading(false);
      } catch (err: any) {
        console.error('Failed to initialize session:', err);
        setError(err.message || 'Failed to connect to session');
        setLoading(false);
      }
    };

    initializeSession();

    return () => {
      disconnectFromSession();
    };
  }, [sessionId]);

  const handleLeave = () => {
    disconnectFromSession();
    sessionStorage.removeItem('sessionData');
    navigate('/');
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh" p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <IconButton onClick={() => navigate('/')}>
          Go Back
        </IconButton>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setSidebarOpen(true)}
            sx={{ mr: 2 }}
          >
            <PeopleIcon />
          </IconButton>

          <IconButton
            color="inherit"
            aria-label="share"
            onClick={() => setSidebarOpen(true)}
            sx={{ mr: 2 }}
          >
            <ShareIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {sessionName || 'Untitled Document'}
          </Typography>

          <Chip
            label={userRole === 'viewer' ? 'Viewer' : 'Collaborator'}
            color={userRole === 'viewer' ? 'default' : 'primary'}
            size="small"
            sx={{ mr: 2 }}
          />

          <Chip
            label={connectionStatus}
            color={connectionStatus === 'connected' ? 'success' : 'warning'}
            size="small"
            sx={{ mr: 2 }}
          />

          <IconButton color="inherit" onClick={handleLeave}>
            <ExitToAppIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflow: 'hidden', p: 2 }}>
        <CollaborativeEditor readOnly={userRole === 'viewer'} />
      </Box>

      <UserSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        viewerCode={sessionCodes.viewerCode}
        collaboratorCode={sessionCodes.collaboratorCode}
      />
    </Box>
  );
};

const DocumentPage: React.FC = () => {
  return (
    <SessionProvider>
      <DocumentPageContent />
    </SessionProvider>
  );
};

export default DocumentPage;

