package Computer.Engineering.Google.Text.Editor.dto;

public class DeleteRequest {
  private String sessionId;
  private String userId;
  private String siteId;
  private int clock;

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

  public String getSiteId() {
    return siteId;
  }

  public void setSiteId(String siteId) {
    this.siteId = siteId;
  }

  public int getClock() {
    return clock;
  }

  public void setClock(int clock) {
    this.clock = clock;
  }
}
