package Computer.Engineering.Google.Text.Editor.model;

import Computer.Engineering.Google.Text.Editor.dto.UserPresence;
import java.util.ArrayList;
import java.util.List;

public class SessionData {
  private String sessionId;
  private String sessionName;
  private CrdtBuffer buffer;
  private String viewerCode;
  private String collaboratorCode;
  private List<UserPresence> users;
  private long createdTime;

  public SessionData(String sessionId, String sessionName, String viewerCode, String collaboratorCode) {
    this.sessionId = sessionId;
    this.sessionName = sessionName;
    this.buffer = new CrdtBuffer(sessionId);
    this.viewerCode = viewerCode;
    this.collaboratorCode = collaboratorCode;
    this.users = new ArrayList<>();
    this.createdTime = System.currentTimeMillis();
  }

  public String getSessionId() {
    return sessionId;
  }

  public String getSessionName() {
    return sessionName;
  }

  public CrdtBuffer getBuffer() {
    return buffer;
  }

  public String getViewerCode() {
    return viewerCode;
  }

  public String getCollaboratorCode() {
    return collaboratorCode;
  }

  public List<UserPresence> getUsers() {
    return users;
  }

  public void addUser(UserPresence user) {
    users.add(user);
  }

  public void removeUser(String userId) {
    users.removeIf(u -> u.getUserId().equals(userId));
  }

  public long getCreatedTime() {
    return createdTime;
  }

  public boolean isCodeValid(String code) {
    return viewerCode.equals(code) || collaboratorCode.equals(code);
  }

  public String getRoleForCode(String code) {
    if (collaboratorCode.equals(code)) {
      return "collaborator";
    } else if (viewerCode.equals(code)) {
      return "viewer";
    }
    return null;
  }
}
