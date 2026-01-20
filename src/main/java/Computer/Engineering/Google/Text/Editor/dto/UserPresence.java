package Computer.Engineering.Google.Text.Editor.dto;

public class UserPresence {
  private String userId;
  private String username;
  private String color;
  private String role;
  private boolean online;

  public UserPresence(String userId, String username, String color, String role, boolean online) {
    this.userId = userId;
    this.username = username;
    this.color = color;
    this.role = role;
    this.online = online;
  }

  public String getUserId() {
    return userId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getColor() {
    return color;
  }

  public void setColor(String color) {
    this.color = color;
  }

  public String getRole() {
    return role;
  }

  public void setRole(String role) {
    this.role = role;
  }

  public boolean isOnline() {
    return online;
  }

  public void setOnline(boolean online) {
    this.online = online;
  }
}
