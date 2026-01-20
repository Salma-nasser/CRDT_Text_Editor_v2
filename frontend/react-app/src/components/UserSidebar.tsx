import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  IconButton,
  Divider,
  Button,
  TextField,
  Snackbar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useSession } from '../context/SessionContext';

interface UserSidebarProps {
  open: boolean;
  onClose: () => void;
  viewerCode?: string;
  collaboratorCode?: string;
}

const UserSidebar: React.FC<UserSidebarProps> = ({
  open,
  onClose,
  viewerCode,
  collaboratorCode,
}) => {
  const { connectedUsers, sessionName } = useSession();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleCopyCode = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setSnackbarMessage(`${type} code copied to clipboard!`);
    setSnackbarOpen(true);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 300,
            padding: 2,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Session Info</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          Session Name
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold' }}>
          {sessionName || 'Untitled Session'}
        </Typography>

        {viewerCode && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Viewer Code
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                value={viewerCode}
                size="small"
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
              />
              <IconButton
                size="small"
                onClick={() => handleCopyCode(viewerCode, 'Viewer')}
                color="primary"
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}

        {collaboratorCode && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Collaborator Code
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                value={collaboratorCode}
                size="small"
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
              />
              <IconButton
                size="small"
                onClick={() => handleCopyCode(collaboratorCode, 'Collaborator')}
                color="primary"
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Connected Users ({connectedUsers.length})
        </Typography>

        <List>
          {connectedUsers.map((user) => (
            <ListItem key={user.userId} sx={{ px: 0 }}>
              <ListItemIcon>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: user.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                  }}
                >
                  {user.username[0].toUpperCase()}
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={user.username}
                secondary={
                  <Chip
                    icon={user.role === 'viewer' ? <VisibilityIcon /> : <EditIcon />}
                    label={user.role}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                }
              />
              {user.online && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#4caf50',
                  }}
                />
              )}
            </ListItem>
          ))}
        </List>

        {connectedUsers.length === 0 && (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
            No users connected
          </Typography>
        )}
      </Drawer>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </>
  );
};

export default UserSidebar;
