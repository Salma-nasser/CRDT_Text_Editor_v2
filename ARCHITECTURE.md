# CRDT Text Editor Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Client 1                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │              LandingPage.tsx                        │     │
│  │  [Create Session] [Join Session]                   │     │
│  └────────────────────────────────────────────────────┘     │
│                         │                                     │
│                         ▼                                     │
│  ┌────────────────────────────────────────────────────┐     │
│  │              DocumentPage.tsx                       │     │
│  │  ┌──────────────────────────────────────────┐     │     │
│  │  │     CollaborativeEditor.tsx              │     │     │
│  │  │  - ContentEditable                       │     │     │
│  │  │  - Input handling                        │     │     │
│  │  │  - Cursor tracking                       │     │     │
│  │  └──────────────────────────────────────────┘     │     │
│  │  ┌──────────────────────────────────────────┐     │     │
│  │  │     UserSidebar.tsx                      │     │     │
│  │  │  - User list                             │     │     │
│  │  │  - Session codes                         │     │     │
│  │  └──────────────────────────────────────────┘     │     │
│  └────────────────────────────────────────────────────┘     │
│                         │                                     │
│  ┌────────────────────────────────────────────────────┐     │
│  │          SessionContext.tsx                         │     │
│  │  - Session state                                    │     │
│  │  - User management                                  │     │
│  │  - Connection status                                │     │
│  └────────────────────────────────────────────────────┘     │
│              │                        │                      │
│  ┌───────────┴───────┐    ┌──────────┴───────────┐         │
│  │  WebSocketService │    │    ApiService        │         │
│  │  - STOMP client   │    │    - REST client     │         │
│  │  - Reconnect      │    │    - HTTP requests   │         │
│  └───────────────────┘    └──────────────────────┘         │
│              │                        │                      │
│  ┌───────────┴──────────────────────┴───────────┐          │
│  │          CrdtClient.ts                        │          │
│  │  - Local CRDT operations                     │          │
│  │  - Node management                           │          │
│  │  - Document reconstruction                   │          │
│  └──────────────────────────────────────────────┘          │
└──────────────────────┬───────────────────────────────────┘
                       │
                       │ HTTP / WebSocket
                       │
┌──────────────────────▼───────────────────────────────────┐
│                 Spring Boot Backend                       │
│  ┌────────────────────────────────────────────────┐     │
│  │         CrdtController.java                     │     │
│  │  REST: /api/session/create                     │     │
│  │        /api/session/join                       │     │
│  │        /api/session/{id}/document              │     │
│  │  WS:   /app/session/{id}/insert                │     │
│  │        /app/session/{id}/delete                │     │
│  │        /app/session/{id}/cursor                │     │
│  │  TOPIC: /topic/session/{id}/updates            │     │
│  │         /topic/session/{id}/cursors            │     │
│  │         /topic/session/{id}/presence           │     │
│  └────────────────────────────────────────────────┘     │
│              │                                             │
│  ┌───────────┴─────────────────────────────┐             │
│  │     Service Layer                        │             │
│  │  ┌─────────────────┐  ┌──────────────┐ │             │
│  │  │ SessionService  │  │ UserService  │ │             │
│  │  │ - Manage        │  │ - User       │ │             │
│  │  │   sessions      │  │   lifecycle  │ │             │
│  │  │ - Codes         │  │ - Presence   │ │             │
│  │  └─────────────────┘  └──────────────┘ │             │
│  │  ┌─────────────────┐  ┌──────────────┐ │             │
│  │  │  CrdtService    │  │ UserRegistry │ │             │
│  │  │ - Insert/Delete │  │ - Colors     │ │             │
│  │  │ - Multi-session │  │ - Roles      │ │             │
│  │  └─────────────────┘  └──────────────┘ │             │
│  └──────────────────────────────────────────┘            │
│              │                                             │
│  ┌───────────┴─────────────────────────────┐             │
│  │     Model/Data Layer                     │             │
│  │  ┌─────────────────┐  ┌──────────────┐ │             │
│  │  │  SessionData    │  │  CrdtBuffer  │ │             │
│  │  │ - ID, name      │  │ - Nodes      │ │             │
│  │  │ - Codes         │  │ - Insert     │ │             │
│  │  │ - Users         │  │ - Delete     │ │             │
│  │  │ - Buffer        │  │ - Document   │ │             │
│  │  └─────────────────┘  └──────────────┘ │             │
│  └──────────────────────────────────────────┘            │
│              │                                             │
│  ┌───────────┴─────────────────────────────┐             │
│  │     Utilities                            │             │
│  │  ┌─────────────────────────────────────┐│             │
│  │  │  CodeGenerator.java                 ││             │
│  │  │  - Generate unique codes            ││             │
│  │  │  - Collision detection              ││             │
│  │  └─────────────────────────────────────┘│             │
│  └──────────────────────────────────────────┘            │
│              │                                             │
│  ┌───────────┴─────────────────────────────┐             │
│  │     Configuration                        │             │
│  │  ┌─────────────────────────────────────┐│             │
│  │  │  WebSocketConfig.java               ││             │
│  │  │  - STOMP config                     ││             │
│  │  │  - SockJS fallback                  ││             │
│  │  └─────────────────────────────────────┘│             │
│  │  ┌─────────────────────────────────────┐│             │
│  │  │  WebSocketEventListener.java        ││             │
│  │  │  - Connect/Disconnect events        ││             │
│  │  │  - User cleanup                     ││             │
│  │  └─────────────────────────────────────┘│             │
│  └──────────────────────────────────────────┘            │
└───────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### Session Creation Flow
```
User            LandingPage     ApiService      Backend         SessionService
 │                  │               │               │                  │
 │  Enter name      │               │               │                  │
 │─────────────────>│               │               │                  │
 │                  │               │               │                  │
 │  Click Create    │               │               │                  │
 │─────────────────>│               │               │                  │
 │                  │ createSession()│              │                  │
 │                  │──────────────>│ POST /api/   │                  │
 │                  │               │  session/    │                  │
 │                  │               │  create      │                  │
 │                  │               │─────────────>│ createSession()  │
 │                  │               │              │─────────────────>│
 │                  │               │              │   Generate codes │
 │                  │               │              │   Create session │
 │                  │               │              │<─────────────────│
 │                  │               │   Response   │                  │
 │                  │               │<─────────────│                  │
 │                  │   Response    │              │                  │
 │                  │<──────────────│              │                  │
 │  Navigate to     │               │              │                  │
 │  /document/{id}  │               │              │                  │
 │<─────────────────│               │              │                  │
```

### Real-time Edit Flow
```
User 1        Editor        SessionContext   WebSocket    Backend       User 2
  │             │                 │              │            │            │
  │ Type 'a'    │                 │              │            │            │
  │────────────>│                 │              │            │            │
  │             │ sendInsert()    │              │            │            │
  │             │────────────────>│              │            │            │
  │             │                 │ sendInsert() │            │            │
  │             │                 │─────────────>│ Insert    │            │
  │             │                 │              │ operation │            │
  │             │                 │              │──────────>│            │
  │             │                 │              │  Process  │            │
  │             │                 │              │  in CRDT  │            │
  │             │                 │              │  Buffer   │            │
  │             │                 │              │<──────────│            │
  │             │                 │              │ Broadcast │            │
  │             │                 │              │ /topic/   │            │
  │             │                 │              │ updates   │            │
  │             │                 │   Update     │──────────>│            │
  │             │                 │<─────────────│            │            │
  │             │  Re-render      │              │            │  Update    │
  │             │<────────────────│              │            │───────────>│
  │  See 'a'    │                 │              │            │ See 'a'    │
  │<────────────│                 │              │            │            │
```

### User Join Flow
```
User 2      LandingPage    ApiService    Backend     UserService   SessionData
  │             │              │             │              │            │
  │ Enter code  │              │             │              │            │
  │────────────>│              │             │              │            │
  │             │ joinSession()│             │              │            │
  │             │─────────────>│ POST /api/ │              │            │
  │             │              │ session/   │              │            │
  │             │              │ join       │              │            │
  │             │              │───────────>│ Validate    │            │
  │             │              │            │ code        │            │
  │             │              │            │────────────>│            │
  │             │              │            │             │ Get session│
  │             │              │            │             │───────────>│
  │             │              │            │             │<───────────│
  │             │              │            │ Create user │            │
  │             │              │            │────────────>│            │
  │             │              │            │<────────────│            │
  │             │              │            │ Add to      │            │
  │             │              │            │ session     │            │
  │             │              │            │────────────────────────>│
  │             │              │  Response  │             │            │
  │             │              │<───────────│             │            │
  │             │  Response    │            │             │            │
  │             │<─────────────│            │             │            │
  │ Navigate    │              │            │ Broadcast   │            │
  │<────────────│              │            │ new user    │            │
  │             │              │            │ to others   │            │
```

## Component Interaction

### Frontend Component Hierarchy
```
App
├── Router
    ├── Route: "/"
    │   └── LandingPage
    │       ├── Create Session Form
    │       └── Join Session Form
    │
    └── Route: "/document/:sessionId"
        └── SessionProvider
            └── DocumentPage
                ├── AppBar
                │   ├── Session name
                │   ├── Role indicator
                │   └── Connection status
                ├── CollaborativeEditor
                │   ├── ContentEditable div
                │   └── RemoteCursor (placeholder)
                └── UserSidebar (drawer)
                    ├── User list
                    └── Session codes
```

### Backend Component Hierarchy
```
Spring Boot Application
├── Controllers
│   └── CrdtController
│       ├── REST endpoints
│       └── WebSocket handlers
├── Services
│   ├── SessionService
│   ├── UserService
│   ├── CrdtService
│   └── UserRegistry (singleton)
├── Models
│   ├── SessionData
│   ├── CrdtBuffer
│   └── CrdtNode
├── DTOs
│   ├── Request DTOs
│   └── Response DTOs
├── Configuration
│   ├── WebSocketConfig
│   └── WebSocketEventListener
└── Utilities
    └── CodeGenerator
```

## Technology Stack Details

### Frontend
- **React 19**: UI framework
- **TypeScript 4.9**: Type safety
- **Material-UI 7.2**: Component library
- **React Router 7.7**: Routing
- **SockJS Client 1.6**: WebSocket with fallback
- **STOMP.js 7.0**: WebSocket protocol

### Backend
- **Java 21**: Programming language
- **Spring Boot 3.3.10**: Application framework
- **Spring WebSocket**: WebSocket support
- **STOMP**: Messaging protocol
- **SockJS**: WebSocket fallback
- **Maven**: Build tool

### Communication Protocols
- **HTTP/REST**: Session management
- **WebSocket/STOMP**: Real-time updates
- **SockJS**: WebSocket fallback for older browsers

## Security Considerations

### Current Implementation
- No authentication (demo/dev mode)
- Session codes for access control
- Role-based permissions (viewer/collaborator)
- In-memory session storage

### Production Recommendations
- Add user authentication (JWT/OAuth)
- Encrypt WebSocket connections (WSS)
- Rate limiting on operations
- Input sanitization
- Session persistence
- Audit logging
- CORS configuration
- CSRF protection

## Scalability Considerations

### Current Limitations
- In-memory storage (lost on restart)
- Single server (no horizontal scaling)
- No load balancing
- No session persistence

### Future Improvements
- Database persistence (SQL Server ready)
- Redis for session state
- Horizontal scaling with sticky sessions
- Message queue for event distribution
- CDN for static assets
- Caching layer

## Performance Optimization

### Current Optimizations
- Debounced cursor updates (100ms)
- Efficient CRDT tree traversal
- WebSocket for low-latency updates
- Minimal re-renders in React

### Future Optimizations
- Virtual scrolling for large documents
- Text compression
- Batch operations
- Lazy loading of historical data
- Worker threads for CRDT operations

---

**Architecture Version**: 1.0  
**Last Updated**: January 18, 2026
