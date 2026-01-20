package Computer.Engineering.Google.Text.Editor.dto;

public class InsertRequest {
  private String sessionId;
  private String userId;
  private char value;
  private String parentId;

  public String getSessionId() {
    return sessionId;
  }

  public void setSessionId(String sessionId) {
    this.sessionId = sessionId;
  }

  public String getUserId() {
    return userId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }

  public char getValue() {
    return value;
  }

  public void setValue(char value) {
    this.value = value;
  }

  public String getParentId() {
    return parentId;
  }

  public void setParentId(String parentId) {
    this.parentId = parentId;
  }
}
