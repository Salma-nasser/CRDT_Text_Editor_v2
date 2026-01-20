# CRDT Text Editor - Implementation Plan

## Project Overview
A collaborative real-time text editor using CRDT (Conflict-free Replicated Data Type) for distributed editing. Built with Spring Boot backend and React frontend.

## Current State Analysis

### ✅ Completed Components

**Backend (Spring Boot):**
- CRDT data structures (CrdtNode, CrdtBuffer) with insert/delete operations
- REST API endpoints for CRDT operations
- WebSocket configuration with STOMP over SockJS
- Basic controller structure for real-time updates
- SQL Server database setup with JPA

**Frontend (React + TypeScript):**
- Project structure with React Router
- Landing page with session creation/join UI
- Document page mockup with sidebar and editor area
- Material-UI integration for components

### ❌ Missing/Incomplete Features

**Backend:**
1. Multi-session support (currently single shared buffer)
2. User management and session assignment
3. Access control (viewer vs collaborator roles)
4. Session/document code generation
5. Cursor position broadcasting
6. User presence tracking

**Frontend:**
1. WebSocket client integration
2. CRDT operation logic on client side
3. Custom collaborative editor component
4. Real-time cursor/selection rendering
5. User connection/disconnection handling
6. Operational transformation between UI events and CRDT operations

**Integration:**
1. Frontend-backend WebSocket communication
2. Session synchronization
3. User authentication flow

---

## Implementation Plan

### Phase 1: Backend Multi-Session Support

#### 1.1 Session Management Service
**File:** `src/main/java/Computer/Engineering/Google/Text/Editor/services/SessionService.java`

**Features:**
- Create new session with unique ID
- Generate viewer and collaborator access codes
- Maintain `Map<sessionId, SessionData>` where SessionData contains:
  - CrdtBuffer
  - List of connected users
  - Viewer code
  - Collaborator code
  - Session metadata (created time, owner)

#### 1.2 User Management
**File:** `src/main/java/Computer/Engineering/Google/Text/Editor/services/UserService.java`

**Features:**
- Assign unique siteId to users on WebSocket connection
- Track user sessions (username, color, role, cursor position)
- Handle user connect/disconnect events
- Broadcast user presence changes

#### 1.3 Update CrdtService for Multi-Session
**File:** `src/main/java/Computer/Engineering/Google/Text/Editor/services/CrdtService.java`

**Changes:**
- Accept sessionId parameter in all methods
- Delegate to SessionService to get appropriate CrdtBuffer
- Remove single shared buffer instance

#### 1.4 DTOs for New Operations
**New Files:**
- `dto/SessionCreateRequest.java` - sessionName
- `dto/SessionCreateResponse.java` - sessionId, collaboratorCode, viewerCode
- `dto/JoinSessionRequest.java` - code, username
- `dto/JoinSessionResponse.java` - sessionId, userId, role, initialDocument, users
- `dto/CursorUpdate.java` - userId, position, selectionStart, selectionEnd
- `dto/UserPresence.java` - userId, username, color, role, isOnline

#### 1.5 Enhanced Controller
**File:** `src/main/java/Computer/Engineering/Google/Text/Editor/controller/CrdtController.java`

**New Endpoints:**
- `POST /api/session/create` - Create new session
- `POST /api/session/join` - Join with code
- `GET /api/session/{sessionId}/document` - Get document for session
- WebSocket mappings:
  - `/app/session/{sessionId}/insert` - Insert character
  - `/app/session/{sessionId}/delete` - Delete character
  - `/app/session/{sessionId}/cursor` - Update cursor position
  - `/topic/session/{sessionId}/updates` - Broadcast changes
  - `/topic/session/{sessionId}/cursors` - Broadcast cursor updates
  - `/topic/session/{sessionId}/presence` - Broadcast user presence

#### 1.6 WebSocket Event Handlers
**File:** `src/main/java/Computer/Engineering/Google/Text/Editor/config/WebSocketEventListener.java`

**Features:**
- Listen for connect/disconnect events
- Assign userId on connection
- Broadcast user presence changes
- Clean up user data on disconnect

---

### Phase 2: Frontend WebSocket Integration

#### 2.1 WebSocket Service
**File:** `frontend/react-app/src/services/WebSocketService.ts`

**Features:**
- Connect to backend WebSocket using SockJS + STOMP
- Subscribe to session-specific topics
- Send insert/delete/cursor operations
- Handle connection lifecycle
- Reconnection logic with exponential backoff

**Dependencies to Add:**
```json
"sockjs-client": "^1.6.1",
"@stomp/stompjs": "^7.0.0"
```

#### 2.2 API Service
**File:** `frontend/react-app/src/services/ApiService.ts`

**Features:**
- HTTP methods for REST endpoints
- Create session
- Join session
- Fetch document state
- Error handling with retry logic

#### 2.3 CRDT Client Logic
**File:** `frontend/react-app/src/services/CrdtClient.ts`

**Features:**
- Maintain local CrdtNode array
- Track local clock and siteId
- Generate insert/delete operations from UI events
- Merge remote operations
- Calculate parent IDs for insertions
- Reconstruct document text from nodes

---

### Phase 3: Collaborative Editor Component

#### 3.1 CollaborativeEditor Component
**File:** `frontend/react-app/src/components/CollaborativeEditor.tsx`

**Features:**
- `contentEditable` div for text editing
- Handle keyboard input events (keypress, keydown, paste)
- Convert DOM mutations to CRDT operations
- Track local cursor position
- Render remote cursors with user colors and names
- Handle selection changes
- Prevent race conditions between local and remote updates

**Technical Considerations:**
- Use `suppressContentEditableWarning`
- Store cursor position before applying remote updates
- Restore cursor after DOM updates
- Debounce cursor position broadcasts (100-200ms)

#### 3.2 Remote Cursor Component
**File:** `frontend/react-app/src/components/RemoteCursor.tsx`

**Features:**
- Render colored cursor line at position
- Show username label above cursor
- Render selection highlight for ranges
- CSS animations for smooth movement
- Z-index management for overlapping cursors

#### 3.3 User Sidebar Component
**File:** `frontend/react-app/src/components/UserSidebar.tsx`

**Features:**
- List of connected users with colors
- User status indicators (online/typing)
- Share codes with copy buttons
- User role badges (viewer/collaborator)
- Real-time updates on user join/leave

---

### Phase 4: State Management & Hooks

#### 4.1 Session Context
**File:** `frontend/react-app/src/context/SessionContext.tsx`

**State:**
- sessionId
- userId
- userRole (viewer/collaborator)
- connectedUsers
- documentNodes (CrdtNode[])
- connectionStatus

**Methods:**
- connectToSession
- disconnectFromSession
- sendInsert
- sendDelete
- updateCursor

#### 4.2 Custom Hooks
**Files:**
- `hooks/useWebSocket.ts` - WebSocket connection management
- `hooks/useCrdt.ts` - CRDT operations and state
- `hooks/useCollaboration.ts` - User presence and cursor tracking

---

### Phase 5: Updated Page Components

#### 5.1 LandingPage
**File:** `frontend/react-app/src/pages/LandingPage.tsx`

**Updates:**
- Call API to create session (returns sessionId + codes)
- Call API to join with code (validate and get sessionId)
- Handle errors (invalid code, session full, etc.)
- Loading states during API calls
- Navigate to document page with sessionId

#### 5.2 DocumentPage
**File:** `frontend/react-app/src/pages/DocumentPage.tsx`

**Complete Rewrite:**
- Extract sessionId from URL params
- Initialize WebSocket connection
- Integrate SessionContext provider
- Replace TextField with CollaborativeEditor
- Use UserSidebar component
- Handle connection errors
- Show loading state during initial sync
- Display session name in header
- Add leave/disconnect button

---

### Phase 6: Backend Enhancements

#### 6.1 Access Control
**Implementation:**
- Check user role before processing edit operations
- Reject delete/insert from viewers
- Allow cursor updates from all users
- Return appropriate error messages

#### 6.2 Session Persistence (Optional)
**File:** `src/main/java/Computer/Engineering/Google/Text/Editor/model/Session.java`

**Features:**
- Save sessions to database
- Load session on restart
- Serialize CrdtBuffer nodes
- TTL for inactive sessions

#### 6.3 Code Generation Utility
**File:** `src/main/java/Computer/Engineering/Google/Text/Editor/util/CodeGenerator.java`

**Features:**
- Generate unique short codes (6-8 characters)
- Separate pools for viewer/collaborator codes
- Collision detection
- Human-readable (avoid ambiguous characters)

---

### Phase 7: Error Handling & Edge Cases

#### 7.1 Backend
- Invalid session ID handling
- Concurrent edit conflict resolution (CRDT handles this)
- WebSocket disconnect/reconnect
- Session not found errors
- Invalid access code
- Rate limiting for operations

#### 7.2 Frontend
- Network disconnection handling
- Reconnection with state sync
- Out-of-order message handling
- Local buffering during disconnection
- Conflict-free merge on reconnect
- User feedback for connection status

---

### Phase 8: UI/UX Polish

#### 8.1 Visual Enhancements
- Loading spinners during operations
- Toast notifications for events (user joined, disconnected)
- Connection status indicator
- Typing indicators
- Smooth cursor animations
- Selection highlighting with opacity

#### 8.2 Responsive Design
- Mobile-friendly layout
- Collapsible sidebar on small screens
- Touch-friendly controls
- Keyboard shortcuts

---

## Technical Architecture Summary

### Data Flow

**User Types Character:**
1. Editor captures input event
2. CrdtClient calculates parent ID from cursor position
3. Send InsertRequest via WebSocket to backend
4. Backend processes insert in session's CrdtBuffer
5. Backend broadcasts updated nodes to all session subscribers
6. All clients (including sender) receive update
7. Clients merge nodes and re-render document

**User Moves Cursor:**
1. Editor captures selection change
2. Debounced cursor update sent via WebSocket
3. Backend broadcasts to other users in session
4. RemoteCursor components update positions

**User Joins Session:**
1. Frontend calls /api/session/join with code
2. Backend validates code, assigns userId and role
3. Returns full document state + user list
4. Frontend establishes WebSocket connection
5. Backend broadcasts new user to existing users
6. UserSidebar updates on all clients

### Message Protocol

**Insert Message:**
```json
{
  "type": "INSERT",
  "sessionId": "abc123",
  "userId": "user-uuid",
  "char": "a",
  "parentId": "user1-5"
}
```

**Delete Message:**
```json
{
  "type": "DELETE",
  "sessionId": "abc123", 
  "userId": "user-uuid",
  "siteId": "user1",
  "clock": 6
}
```

**Cursor Update:**
```json
{
  "type": "CURSOR",
  "sessionId": "abc123",
  "userId": "user-uuid",
  "position": 42,
  "selectionStart": 42,
  "selectionEnd": 50
}
```

**Document Sync:**
```json
{
  "type": "SYNC",
  "nodes": [ /* CrdtNode array */ ],
  "users": [ /* UserPresence array */ ]
}
```

---

## Implementation Order (Priority)

### Sprint 1: Core Functionality (Week 1)
1. Backend session management (multi-session support)
2. Backend user assignment on connection
3. Frontend WebSocket integration
4. Frontend CRDT client logic
5. Basic text synchronization without cursors

### Sprint 2: Editor & Collaboration (Week 2)
6. Custom CollaborativeEditor component
7. Remote cursor rendering
8. Cursor position synchronization
9. User presence in sidebar
10. Access control (viewer/collaborator)

### Sprint 3: Polish & Testing (Week 3)
11. Error handling and edge cases
12. Connection status indicators
13. UI/UX improvements
14. Code generation and validation
15. End-to-end testing

---

## Technology Stack

**Backend:**
- Java 21
- Spring Boot 3.3.10
- Spring WebSocket with STOMP
- SockJS fallback
- SQL Server (optional persistence)
- Maven

**Frontend:**
- React 19
- TypeScript 4.9
- Material-UI 7.2
- React Router 7.7
- SockJS Client 1.6
- STOMP.js 7.0
- npm

---

## Testing Strategy

### Backend Tests
- Unit tests for CrdtBuffer operations
- Integration tests for WebSocket messaging
- Session management tests
- Concurrent edit scenarios

### Frontend Tests
- Component unit tests
- CRDT client logic tests
- WebSocket mock tests
- Integration tests with Test Renderer

### E2E Tests
- Multi-user editing scenarios
- Network disconnection/reconnection
- Access control validation
- Cross-browser compatibility

---

## Success Criteria

✅ **Functional Requirements:**
- Multiple users can edit same document simultaneously
- Changes appear in real-time for all users
- No conflicts or data loss with concurrent edits
- Viewers can only read, collaborators can edit
- Users see each other's cursors and selections
- Session codes work for joining documents

✅ **Performance Requirements:**
- < 100ms latency for operation propagation
- Smooth typing experience (60fps)
- Support 10+ concurrent users per session

✅ **Quality Requirements:**
- No crashes or data corruption
- Graceful handling of network issues
- Clear error messages for users
- Consistent state across all clients

---

## Deployment Considerations

1. **CORS Configuration:** Ensure frontend origin is allowed
2. **WebSocket Proxy:** Configure reverse proxy (Nginx) for WebSocket upgrade
3. **Environment Variables:** Backend URL configurable in frontend
4. **Database:** SQL Server connection for production
5. **Session Cleanup:** Background job to remove inactive sessions
6. **Logging:** Comprehensive logging for debugging distributed issues

---

## Future Enhancements (Post-MVP)

- Rich text formatting (bold, italic, lists)
- Document versioning and history
- Undo/redo with CRDT awareness
- Document export (PDF, Word)
- User authentication and profiles
- Private/public document settings
- File attachments
- Comments and mentions
- Presence indicators (typing status)
- Document search
- Performance optimization for large documents

---

**Document Version:** 1.0  
**Date:** 2026-01-18  
**Status:** Ready for Implementation
