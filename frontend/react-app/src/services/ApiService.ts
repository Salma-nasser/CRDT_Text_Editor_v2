const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export interface SessionCreateRequest {
  sessionName: string;
}

export interface SessionCreateResponse {
  sessionId: string;
  sessionName: string;
  viewerCode: string;
  collaboratorCode: string;
}

export interface JoinSessionRequest {
  code: string;
  username: string;
}

export interface CrdtNode {
  siteId: string;
  clock: number;
  counter: number;
  parentId: string;
  value: string;
  deleted: boolean;
}

export interface UserPresence {
  userId: string;
  username: string;
  color: string;
  role: string;
  online: boolean;
}

export interface JoinSessionResponse {
  sessionId: string;
  sessionName: string;
  userId: string;
  role: string;
  nodes: CrdtNode[];
  users: UserPresence[];
  viewerCode: string;
  collaboratorCode: string;
}

class ApiService {
  async createSession(sessionName: string): Promise<SessionCreateResponse> {
    const response = await fetch(`${API_BASE_URL}/api/session/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create session');
    }

    return response.json();
  }

  async joinSession(code: string, username: string): Promise<JoinSessionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/session/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to join session');
    }

    return response.json();
  }

  async getDocument(sessionId: string): Promise<{ document: string; nodes: CrdtNode[] }> {
    const response = await fetch(`${API_BASE_URL}/api/session/${sessionId}/document`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get document');
    }

    return response.json();
  }
  async getSession(sessionId: string): Promise<JoinSessionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/session/${sessionId}`);
    
    if (!response.ok) {
       const error = await response.json();
       throw new Error(error.error || 'Failed to get session info');
    }
    
    return response.json();
  }
}

export default new ApiService();
