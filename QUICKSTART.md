# CRDT Text Editor - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Java 21 or higher
- Node.js 16+ and npm
- SQL Server (optional, for persistence)

---

## 📦 Installation

### 1. Backend Setup

```bash
# Navigate to project root
cd CRDT_Text_Editor_v2

# Install and run backend
./mvnw spring-boot:run
```

Backend will start on `http://localhost:8080`

### 2. Frontend Setup

```bash
# Navigate to React app
cd frontend/react-app

# Install dependencies
npm install

# Start development server
npm start
```

Frontend will start on `http://localhost:3000`

---

## 🎮 Using the Application

### Creating a New Session

1. Open `http://localhost:3000` in your browser
2. Enter a session name (e.g., "My Document")
3. Click **Create Session**
4. You'll be redirected to the editor
5. Click the **People icon** in the toolbar to open the sidebar
6. Copy the **Collaborator Code** or **Viewer Code** to share

### Joining an Existing Session

1. Open `http://localhost:3000` in a new browser window/tab
2. Enter your name
3. Paste the session code you received
4. Click **Join Session**
5. Start collaborating!

### Editing the Document

- **Collaborators** can type and edit text freely
- **Viewers** can only read (editor is read-only)
- All changes sync in real-time across all users
- Connection status is shown in the toolbar

---

## 🔍 What to Test

### Basic Functionality
1. Create a session and verify you can type
2. Open sidebar and see your user listed
3. Copy the collaborator code
4. Join from another window with the code
5. Type in both windows and watch real-time sync

### Concurrent Editing
1. Have two collaborators join the same session
2. Both type at different positions
3. Verify text merges correctly without conflicts

### Viewer Mode
1. Copy the viewer code
2. Join with the viewer code
3. Verify you can see edits but cannot type

### Connection Status
1. Watch the connection status chip in the toolbar
2. It should show "connected" when active
3. Try disconnecting network to see status change

---

## 🐛 Troubleshooting

### Backend won't start
- Ensure Java 21 is installed: `java -version`
- Check if port 8080 is already in use
- Check for compilation errors in the output

### Frontend won't start
- Ensure Node.js is installed: `node -version`
- Check if port 3000 is already in use
- Run `npm install` again if dependencies are missing

### WebSocket connection fails
- Verify backend is running on port 8080
- Check browser console for error messages
- Ensure CORS is properly configured

### Real-time sync not working
- Check WebSocket connection status in toolbar
- Open browser console and look for errors
- Verify both users are in the same session

---

## 📁 Project Structure

```
CRDT_Text_Editor_v2/
├── src/main/java/.../
│   ├── config/
│   │   ├── WebSocketConfig.java
│   │   └── WebSocketEventListener.java ✨
│   ├── controller/
│   │   └── CrdtController.java ✨
│   ├── dto/
│   │   ├── SessionCreateRequest.java
│   │   ├── SessionCreateResponse.java
│   │   ├── JoinSessionRequest.java
│   │   ├── JoinSessionResponse.java
│   │   ├── CursorUpdate.java
│   │   ├── UserPresence.java
│   │   ├── InsertRequest.java
│   │   └── DeleteRequest.java
│   ├── model/
│   │   ├── CrdtBuffer.java
│   │   ├── CrdtNode.java
│   │   └── SessionData.java
│   ├── services/
│   │   ├── CrdtService.java
│   │   ├── SessionService.java
│   │   └── UserService.java
│   └── util/
│       └── CodeGenerator.java ✨
└── frontend/react-app/src/
    ├── services/
    │   ├── ApiService.ts ✨
    │   ├── WebSocketService.ts ✨
    │   └── CrdtClient.ts ✨
    ├── components/
    │   ├── CollaborativeEditor.tsx ✨
    │   ├── RemoteCursor.tsx ✨
    │   └── UserSidebar.tsx ✨
    ├── context/
    │   └── SessionContext.tsx ✨
    ├── pages/
    │   ├── LandingPage.tsx ✨ (updated)
    │   └── DocumentPage.tsx ✨ (updated)
    └── App.tsx ✨ (updated)

✨ = New or significantly updated in this implementation
```

---

## 🌐 API Reference

### Create Session
```http
POST /api/session/create
Content-Type: application/json

{
  "sessionName": "My Document"
}
```

**Response:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "sessionName": "My Document",
  "viewerCode": "ABC123",
  "collaboratorCode": "XYZ789"
}
```

### Join Session
```http
POST /api/session/join
Content-Type: application/json

{
  "code": "XYZ789",
  "username": "Alice"
}
```

**Response:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "sessionName": "My Document",
  "userId": "user-uuid",
  "role": "collaborator",
  "nodes": [],
  "users": []
}
```

---

## 💡 Tips

1. **Share Codes Safely**: Only share collaborator codes with people you trust to edit
2. **Multiple Windows**: Test by opening multiple browser windows or tabs
3. **Incognito Mode**: Use incognito/private windows to simulate different users
4. **Network Tab**: Watch WebSocket connection in browser DevTools Network tab
5. **Console Logs**: Check browser console for debugging information

---

## 📊 Session Codes

Each session has two types of codes:

- **Viewer Code**: Read-only access, can see edits but cannot type
- **Collaborator Code**: Full access, can edit and collaborate

Codes are 6 characters long and use human-readable characters (no O/0 confusion).

---

## 🔐 Security Note

This is a development/demonstration implementation. For production use, consider:
- User authentication
- Session encryption
- Rate limiting
- Input sanitization
- Session expiration
- Access logging

---

## 📞 Support

For issues or questions:
1. Check `IMPLEMENTATION_SUMMARY.md` for detailed documentation
2. Review `IMPLEMENTATION_PLAN.md` for architecture details
3. Check browser console for error messages
4. Verify backend logs for server-side issues

---

**Happy Collaborating! 🎉**
