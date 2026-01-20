package Computer.Engineering.Google.Text.Editor.services;

import Computer.Engineering.Google.Text.Editor.dto.SessionCreateResponse;
import Computer.Engineering.Google.Text.Editor.model.SessionData;
import Computer.Engineering.Google.Text.Editor.util.CodeGenerator;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionService {
  private final Map<String, SessionData> sessions = new ConcurrentHashMap<>();
  private final Map<String, String> codeToSessionId = new ConcurrentHashMap<>();

  public SessionCreateResponse createSession(String sessionName) {
    String sessionId = UUID.randomUUID().toString();
    String viewerCode = CodeGenerator.generateUniqueCode();
    String collaboratorCode = CodeGenerator.generateUniqueCode();

    SessionData sessionData = new SessionData(sessionId, sessionName, viewerCode, collaboratorCode);
    sessions.put(sessionId, sessionData);
    codeToSessionId.put(viewerCode, sessionId);
    codeToSessionId.put(collaboratorCode, sessionId);

    return new SessionCreateResponse(sessionId, sessionName, viewerCode, collaboratorCode);
  }

  public SessionData getSession(String sessionId) {
    return sessions.get(sessionId);
  }

  public SessionData getSessionByCode(String code) {
    String sessionId = codeToSessionId.get(code);
    return sessionId != null ? sessions.get(sessionId) : null;
  }

  public boolean sessionExists(String sessionId) {
    return sessions.containsKey(sessionId);
  }

  public void removeSession(String sessionId) {
    SessionData session = sessions.remove(sessionId);
    if (session != null) {
      codeToSessionId.remove(session.getViewerCode());
      codeToSessionId.remove(session.getCollaboratorCode());
      CodeGenerator.releaseCode(session.getViewerCode());
      CodeGenerator.releaseCode(session.getCollaboratorCode());
    }
  }

  public Map<String, SessionData> getAllSessions() {
    return sessions;
  }
}
