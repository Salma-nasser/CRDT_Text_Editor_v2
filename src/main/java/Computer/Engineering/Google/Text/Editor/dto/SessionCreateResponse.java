package Computer.Engineering.Google.Text.Editor.dto;

public class SessionCreateResponse {
  private String sessionId;
  private String sessionName;
  private String viewerCode;
  private String collaboratorCode;

  public SessionCreateResponse(String sessionId, String sessionName, String viewerCode, String collaboratorCode) {
    this.sessionId = sessionId;
    this.sessionName = sessionName;
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
