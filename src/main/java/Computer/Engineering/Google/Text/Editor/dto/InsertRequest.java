package Computer.Engineering.Google.Text.Editor.dto;

public class InsertRequest {
  private char value;
  private String parentId;

  // Getters and setters
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
