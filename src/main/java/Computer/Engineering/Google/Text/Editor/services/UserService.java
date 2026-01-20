package Computer.Engineering.Google.Text.Editor.services;

import Computer.Engineering.Google.Text.Editor.dto.UserPresence;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService {
  private static final String[] COLORS = {
    "#FF5733", "#33C1FF", "#8E44AD", "#16A085", "#F39C12",
    "#E74C3C", "#3498DB", "#2ECC71", "#E67E22", "#9B59B6"
  };

  private final Map<String, UserPresence> users = new ConcurrentHashMap<>();
  private final Map<String, String> sessionIdByUserId = new ConcurrentHashMap<>();
  private int colorIndex = 0;

  public synchronized UserPresence createUser(String userId, String username, String role, String sessionId) {
    String color = COLORS[colorIndex % COLORS.length];
    colorIndex++;

    UserPresence user = new UserPresence(userId, username, color, role, true);
    users.put(userId, user);
    sessionIdByUserId.put(userId, sessionId);

    return user;
  }

  public UserPresence getUser(String userId) {
    return users.get(userId);
  }

  public void removeUser(String userId) {
    users.remove(userId);
    sessionIdByUserId.remove(userId);
  }

  public void setUserOnline(String userId, boolean online) {
    UserPresence user = users.get(userId);
    if (user != null) {
      user.setOnline(online);
    }
  }

  public String getSessionIdForUser(String userId) {
    return sessionIdByUserId.get(userId);
  }

  public List<UserPresence> getUsersInSession(String sessionId) {
    List<UserPresence> sessionUsers = new ArrayList<>();
    for (Map.Entry<String, String> entry : sessionIdByUserId.entrySet()) {
      if (sessionId.equals(entry.getValue())) {
        UserPresence user = users.get(entry.getKey());
        if (user != null) {
          sessionUsers.add(user);
        }
      }
    }
    return sessionUsers;
  }
}
