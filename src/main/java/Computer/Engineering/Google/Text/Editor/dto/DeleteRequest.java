package Computer.Engineering.Google.Text.Editor.dto;

public class DeleteRequest {
  private String siteId;
  private int clock;

  // Getters and setters
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
