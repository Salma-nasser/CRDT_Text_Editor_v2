import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { CrdtNode, UserPresence } from './ApiService';

const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080';

export interface InsertRequest {
  sessionId: string;
  userId: string;
  value: string;
  parentId: string;
}

export interface DeleteRequest {
  sessionId: string;
  userId: string;
  siteId: string;
  clock: number;
}

export interface CursorUpdate {
  userId: string;
  username: string;
  position: number;
  selectionStart: number;
  selectionEnd: number;
}

type MessageHandler = (message: any) => void;

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private connected = false;

  connect(sessionId: string, onConnected?: () => void, onError?: (error: any) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS(`${WS_BASE_URL}/ws`),
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('WebSocket connected');
          this.connected = true;
          this.reconnectAttempts = 0;
          if (onConnected) onConnected();
          resolve();
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
          this.connected = false;
          if (onError) onError(frame);
          reject(frame);
        },
        onWebSocketError: (event) => {
          console.error('WebSocket error:', event);
          this.connected = false;
          if (onError) onError(event);
        },
        onDisconnect: () => {
          console.log('WebSocket disconnected');
          this.connected = false;
          this.handleReconnect();
        },
      });

      this.client.activate();
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      setTimeout(() => {
        if (this.client && !this.connected) {
          this.client.activate();
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  subscribeToUpdates(sessionId: string, handler: MessageHandler): void {
    if (!this.client || !this.connected) {
      console.error('Cannot subscribe: WebSocket not connected');
      return;
    }

    const destination = `/topic/session/${sessionId}/updates`;
    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      const nodes: CrdtNode[] = JSON.parse(message.body);
      handler(nodes);
    });

    this.subscriptions.set(`updates-${sessionId}`, subscription);
  }

  subscribeToCursors(sessionId: string, handler: MessageHandler): void {
    if (!this.client || !this.connected) {
      console.error('Cannot subscribe: WebSocket not connected');
      return;
    }

    const destination = `/topic/session/${sessionId}/cursors`;
    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      const cursor: CursorUpdate = JSON.parse(message.body);
      handler(cursor);
    });

    this.subscriptions.set(`cursors-${sessionId}`, subscription);
  }

  subscribeToPresence(sessionId: string, handler: MessageHandler): void {
    if (!this.client || !this.connected) {
      console.error('Cannot subscribe: WebSocket not connected');
      return;
    }

    const destination = `/topic/session/${sessionId}/presence`;
    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      const user: UserPresence = JSON.parse(message.body);
      handler(user);
    });

    this.subscriptions.set(`presence-${sessionId}`, subscription);
  }

  sendInsert(sessionId: string, userId: string, value: string, parentId: string): void {
    if (!this.client || !this.connected) {
      console.error('Cannot send: WebSocket not connected');
      return;
    }

    const request: InsertRequest = { sessionId, userId, value, parentId };
    this.client.publish({
      destination: `/app/session/${sessionId}/insert`,
      body: JSON.stringify(request),
    });
  }

  sendDelete(sessionId: string, userId: string, siteId: string, clock: number): void {
    if (!this.client || !this.connected) {
      console.error('Cannot send: WebSocket not connected');
      return;
    }

    const request: DeleteRequest = { sessionId, userId, siteId, clock };
    this.client.publish({
      destination: `/app/session/${sessionId}/delete`,
      body: JSON.stringify(request),
    });
  }

  sendCursorUpdate(sessionId: string, cursor: CursorUpdate): void {
    if (!this.client || !this.connected) {
      console.error('Cannot send: WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: `/app/session/${sessionId}/cursor`,
      body: JSON.stringify(cursor),
    });
  }

  disconnect(): void {
    if (this.client) {
      // Unsubscribe from all topics
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      // Deactivate the client
      this.client.deactivate();
      this.client = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export default new WebSocketService();
