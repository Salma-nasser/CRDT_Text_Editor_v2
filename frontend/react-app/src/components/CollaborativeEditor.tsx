import React, { useEffect, useRef } from 'react';
import { Box, Paper } from '@mui/material';
import { useSession } from '../context/SessionContext';
import RemoteCursor from './RemoteCursor';

interface CollaborativeEditorProps {
  readOnly?: boolean;
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({ readOnly = false }) => {
  const { sendInsert, sendDelete, getDocument, userRole, connectionStatus, documentNodes, remoteCursors, connectedUsers, updateCursor } = useSession();
  const editorRef = useRef<HTMLDivElement>(null);
  const lastContentRef = useRef<string>('');
  const isComposing = useRef(false);
  const cursorUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isReadOnly = readOnly || userRole === 'viewer';

  // Update editor content when CRDT nodes change
  useEffect(() => {
    // Only update if we have a valid CRDT client
    const newContent = getDocument();
    console.log('Document update check. New content length:', newContent.length);
    
    if (editorRef.current && newContent !== lastContentRef.current) {
      console.log('Updating editor content from:', lastContentRef.current, 'to:', newContent);
      
      const selection = window.getSelection();
      let cursorPos = 0;
      
      // Save cursor position before update
      if (selection && selection.rangeCount > 0 && editorRef.current.contains(selection.anchorNode)) {
        try {
          const range = selection.getRangeAt(0);
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(editorRef.current);
          preCaretRange.setEnd(range.startContainer, range.startOffset);
          cursorPos = preCaretRange.toString().length;
        } catch (e) {
          console.warn('Failed to save cursor position', e);
        }
      }
      
      // Update content
      editorRef.current.textContent = newContent;
      lastContentRef.current = newContent;
      
      // Restore cursor position
      if (document.activeElement === editorRef.current && cursorPos <= newContent.length) {
        try {
          const textNode = editorRef.current.firstChild;
          if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(textNode, Math.min(cursorPos, textNode.textContent?.length || 0));
            range.collapse(true);
            sel?.removeAllRanges();
            sel?.addRange(range);
          } else if (newContent.length === 0) {
            // Handle empty content case
            // Focus is enough, caret will be at start
          }
        } catch (e) {
          console.warn('Failed to restore cursor position', e);
        }
      }
    }
  }, [documentNodes, getDocument]);

  const getCursorPosition = (): number => {
    if (!editorRef.current) return 0;
    
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return 0;
    
    const range = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    
    return preCaretRange.toString().length;
  };

  const broadcastCursorPosition = () => {
    if (cursorUpdateTimeoutRef.current) {
      clearTimeout(cursorUpdateTimeoutRef.current);
    }

    cursorUpdateTimeoutRef.current = setTimeout(() => {
      const pos = getCursorPosition();
      // For now we just send the position as both start and end
      // In a full implementation we would calculate the actual selection range
      updateCursor(pos, pos, pos);
    }, 100);
  };

  const handleBeforeInput = (e: any) => {
    if (isReadOnly || connectionStatus !== 'connected' || isComposing.current) return;
    
    const inputType = e.inputType;
    const data = e.data;
    
    if (inputType === 'insertText' && data) {
      e.preventDefault();
      const pos = getCursorPosition();
      console.log('Inserting:', data, 'at position:', pos);
      sendInsert(data, pos);
      // Cursor moves forward
      setTimeout(broadcastCursorPosition, 0);
    } else if (inputType === 'deleteContentBackward') {
      e.preventDefault();
      const pos = getCursorPosition();
      if (pos > 0) {
        console.log('Deleting at position:', pos - 1);
        sendDelete(pos - 1);
        // Cursor moves backward
        setTimeout(broadcastCursorPosition, 0);
      }
    } else if (inputType === 'deleteContentForward') {
      e.preventDefault();
      const pos = getCursorPosition();
      console.log('Deleting forward at position:', pos);
      sendDelete(pos);
      // Cursor stays
      setTimeout(broadcastCursorPosition, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Broadcast cursor movement on navigation keys
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) {
      setTimeout(broadcastCursorPosition, 0);
    }

    if (isReadOnly) {
      e.preventDefault();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const pos = getCursorPosition();
      sendInsert('\n', pos);
      setTimeout(broadcastCursorPosition, 0);
    }
  };

  const handleMouseUp = () => {
    broadcastCursorPosition();
  };

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = () => {
    isComposing.current = false;
  };

  const PADDING = 16; // 2 * 8px spacing

  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          width: '100%',
          overflow: 'auto',
          backgroundColor: '#fff',
          border: '1px solid #e0e0e0',
          position: 'relative', // Ensure cursors are relative to this container
        }}
      >
        <Box
          ref={editorRef}
          contentEditable={!isReadOnly}
          suppressContentEditableWarning
          onBeforeInput={handleBeforeInput}
          onKeyDown={handleKeyDown}
          onMouseUp={handleMouseUp}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          sx={{
            minHeight: '100%',
            padding: `${PADDING}px`,
            outline: 'none',
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            cursor: isReadOnly ? 'not-allowed' : 'text',
            opacity: connectionStatus !== 'connected' ? 0.5 : 1,
          }}
        />
        {remoteCursors.map((cursor) => {
          const user = connectedUsers.find((u) => u.userId === cursor.userId);
          if (!user) return null;
          return (
            <RemoteCursor
              key={cursor.userId}
              userId={cursor.userId}
              username={cursor.username}
              color={user.color}
              position={cursor.position}
              offset={{ top: PADDING, left: PADDING }}
            />
          );
        })}
      </Paper>
    </Box>
  );
};

export default CollaborativeEditor;
