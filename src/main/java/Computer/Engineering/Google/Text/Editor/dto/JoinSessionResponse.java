package Computer.Engineering.Google.Text.Editor.dto;

import Computer.Engineering.Google.Text.Editor.model.CrdtNode;
import java.util.List;

public class JoinSessionResponse {
  private String sessionId;
  private String sessionName;
  private String userId;
  private String role;
  private List<CrdtNode> nodes;
  private List<UserPresence> users;
  private String viewerCode;
  private String collaboratorCode;

  public JoinSessionResponse(String sessionId, String sessionName, String userId, String role, 
                             List<CrdtNode> nodes, List<UserPresence> users, String viewerCode, String collaboratorCode) {
    this.sessionId = sessionId;
    this.sessionName = sessionName;
    this.userId = userId;
    this.role = role;
    this.nodes = nodes;
    this.users = users;
    this.viewerCode = viewerCode;
    this.collaboratorCode = collaboratorCode;
  }

  public String getSessionId() {
    return sessionId;
  }

  public void setSessionId(String sessionId) {
    this.sessionId = sessionId;
  }

  public String getSessionName() {
    return sessionName;
  }

  public void setSessionName(String sessionName) {
    this.sessionName = sessionName;
  }

  public String getUserId() {
    return userId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }

  public String getRole() {
    return role;
  }

  public void setRole(String role) {
    this.role = role;
  }

  public List<CrdtNode> getNodes() {
    return nodes;
  }

  public void setNodes(List<CrdtNode> nodes) {
    this.nodes = nodes;
  }

  public List<UserPresence> getUsers() {
    return users;
  }

  public void setUsers(List<UserPresence> users) {
    this.users = users;
  }

  public String getViewerCode() {
    return viewerCode;
  }

  public void setViewerCode(String viewerCode) {
    this.viewerCode = viewerCode;
  }

  public String getCollaboratorCode() {
    return collaboratorCode;
  }

  public void setCollaboratorCode(String collaboratorCode) {
    this.collaboratorCode = collaboratorCode;
  }
}
