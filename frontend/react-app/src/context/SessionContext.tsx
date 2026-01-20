import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { CrdtNode, UserPresence } from '../services/ApiService';
import WebSocketService, { CursorUpdate } from '../services/WebSocketService';
import { CrdtClient } from '../services/CrdtClient';

interface SessionContextType {
  sessionId: string | null;
  sessionName: string | null;
  userId: string | null;
  userRole: string | null;
  connectedUsers: UserPresence[];
  remoteCursors: CursorUpdate[];
  documentNodes: CrdtNode[];
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  crdtClient: CrdtClient | null;
  
  connectToSession: (sessionId: string, sessionName: string, userId: string, role: string, nodes: CrdtNode[], users: UserPresence[]) => Promise<void>;
  disconnectFromSession: () => void;
  sendInsert: (char: string, position: number) => void;
  sendDelete: (position: number) => void;
  updateCursor: (position: number, selectionStart: number, selectionEnd: number) => void;
  getDocument: () => string;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<UserPresence[]>([]);
  const [documentNodes, setDocumentNodes] = useState<CrdtNode[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<CursorUpdate[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [crdtClient, setCrdtClient] = useState<CrdtClient | null>(null);
  // Use a ref to access the current client inside callbacks without dependency loops
  const clientRef = useRef<CrdtClient | null>(null);

  const connectToSession = useCallback(async (
    sessionId: string,
    sessionName: string,
    userId: string,
    role: string,
    nodes: CrdtNode[],
    users: UserPresence[]
  ) => {
    setConnectionStatus('connecting');
    setSessionId(sessionId);
    setSessionName(sessionName);
    setUserId(userId);
    setUserRole(role);
    setConnectedUsers(users);
    setDocumentNodes(nodes);

    const client = new CrdtClient(userId, nodes);
    setCrdtClient(client);
    clientRef.current = client;

    try {
      await WebSocketService.connect(
        sessionId,
        () => {
          setConnectionStatus('connected');
          console.log('Connected to session:', sessionId);

          // Subscribe to updates
          WebSocketService.subscribeToUpdates(sessionId, (nodes: CrdtNode[]) => {
            console.log('Received nodes update:', nodes.length, 'nodes');
            
            // Update the client immediately using the ref
            if (clientRef.current) {
                clientRef.current.mergeNodes(nodes);
                console.log('After merge:', clientRef.current.getDocument());
            }
            
            // Update state to trigger re-renders in consumers
            setDocumentNodes(nodes);
          });

          // Subscribe to cursors
          WebSocketService.subscribeToCursors(sessionId, (cursor: CursorUpdate) => {
            setRemoteCursors((prev) => {
              const filtered = prev.filter((c) => c.userId !== cursor.userId);
              return [...filtered, cursor];
            });
          });

          // Subscribe to presence
          WebSocketService.subscribeToPresence(sessionId, (user: UserPresence) => {
            setConnectedUsers((prev) => {
              const filtered = prev.filter((u) => u.userId !== user.userId);
              return user.online ? [...filtered, user] : filtered;
            });
          });
        },
        (error) => {
          setConnectionStatus('error');
          console.error('WebSocket error:', error);
        }
      );
    } catch (error) {
      setConnectionStatus('error');
      console.error('Failed to connect to session:', error);
    }
  }, []);

  const disconnectFromSession = useCallback(() => {
    WebSocketService.disconnect();
    setSessionId(null);
    setSessionName(null);
    setUserId(null);
    setUserRole(null);
    setConnectedUsers([]);
    setDocumentNodes([]);
    setCrdtClient(null);
    setConnectionStatus('disconnected');
  }, []);

  const sendInsert = useCallback((char: string, position: number) => {
    if (!sessionId || !userId || !clientRef.current || userRole === 'viewer') {
      console.warn('Cannot insert: not connected or viewer role');
      return;
    }

    const { char: value, parentId } = clientRef.current.insert(char, position);
    WebSocketService.sendInsert(sessionId, userId, value, parentId);
  }, [sessionId, userId, userRole]);

  const sendDelete = useCallback((position: number) => {
    if (!sessionId || !userId || !clientRef.current || userRole === 'viewer') {
      console.warn('Cannot delete: not connected or viewer role');
      return;
    }

    const deleteInfo = clientRef.current.delete(position);
    if (deleteInfo) {
      WebSocketService.sendDelete(sessionId, userId, deleteInfo.siteId, deleteInfo.clock);
    }
  }, [sessionId, userId, userRole]);

  const updateCursor = useCallback((position: number, selectionStart: number, selectionEnd: number) => {
    if (!sessionId || !userId) {
      return;
    }

    const currentUser = connectedUsers.find(u => u.userId === userId);
    const cursor: CursorUpdate = {
      userId,
      username: currentUser?.username || 'Unknown',
      position,
      selectionStart,
      selectionEnd,
    };

    WebSocketService.sendCursorUpdate(sessionId, cursor);
  }, [sessionId, userId, connectedUsers]);

  const getDocument = useCallback(() => {
    return clientRef.current ? clientRef.current.getDocument() : '';
  }, [documentNodes]); // Depend on documentNodes to refresh when updates come in

  const value: SessionContextType = {
    sessionId,
    sessionName,
    userId,
    userRole,
    connectedUsers,
    documentNodes,
    remoteCursors,
    connectionStatus,
    crdtClient,
    connectToSession,
    disconnectFromSession,
    sendInsert,
    sendDelete,
    updateCursor,
    getDocument,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};
