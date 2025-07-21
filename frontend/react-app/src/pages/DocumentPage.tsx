import React from 'react';
import { Box, Paper, Typography, TextField, List, ListItem, ListItemText, Divider, InputAdornment, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

// Dummy data for users and codes
const users = [
  { name: 'Alice', color: '#FF5733', role: 'editor' },
  { name: 'Bob', color: '#33C1FF', role: 'viewer' },
];
const viewerCode = 'VIEW123';
const collaboratorCode = 'EDIT456';

const DocumentPage: React.FC = () => {
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Copied: ${code}`);
  };

  return (
    <Box display="flex" height="100vh">
      {/* Sidebar */}
      <Paper elevation={3} sx={{ width: 250, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h6" gutterBottom>Collaborators</Typography>
        <List sx={{ width: '100%' }}>
          {users.map((user, idx) => (
            <ListItem key={idx}>
              <Box sx={{ width: 16, height: 16, bgcolor: user.color, borderRadius: '50%', mr: 1 }} />
              <ListItemText primary={user.name} secondary={user.role} />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1">Share Codes</Typography>
        <Box sx={{ mt: 1, width: '100%' }}>
          <Typography variant="body2">Viewer Code</Typography>
          <Box display="flex" alignItems="center" mb={1}>
            <TextField
              value={viewerCode}
              size="small"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => handleCopy(viewerCode)} edge="end">
                      <ContentCopyIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mr: 1 }}
            />
          </Box>
          <Typography variant="body2">Collaborator Code</Typography>
          <Box display="flex" alignItems="center">
            <TextField
              value={collaboratorCode}
              size="small"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => handleCopy(collaboratorCode)} edge="end">
                      <ContentCopyIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mr: 1 }}
            />
          </Box>
        </Box>
      </Paper>
      {/* Main Editor */}
      <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Typography variant="h4" gutterBottom>Document Title</Typography>
        <TextField
          multiline
          minRows={15}
          maxRows={30}
          variant="outlined"
          placeholder="Start editing..."
          sx={{ width: '80%' }}
        />
      </Box>
    </Box>
  );
};

export default DocumentPage;
