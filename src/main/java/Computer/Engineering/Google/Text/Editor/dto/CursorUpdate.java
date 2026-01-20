package Computer.Engineering.Google.Text.Editor.dto;

public class CursorUpdate {
  private String userId;
  private int position;
  private int selectionStart;
  private int selectionEnd;

  public CursorUpdate() {}

  public CursorUpdate(String userId, int position, int selectionStart, int selectionEnd) {
    this.userId = userId;
    this.position = position;
    this.selectionStart = selectionStart;
    this.selectionEnd = selectionEnd;
  }

  public String getUserId() {
    return userId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }

  public int getPosition() {
    return position;
  }

  public void setPosition(int position) {
    this.position = position;
  }

  public int getSelectionStart() {
    return selectionStart;
  }

  public void setSelectionStart(int selectionStart) {
    this.selectionStart = selectionStart;
  }

  public int getSelectionEnd() {
    return selectionEnd;
  }

  public void setSelectionEnd(int selectionEnd) {
    this.selectionEnd = selectionEnd;
  }
}
