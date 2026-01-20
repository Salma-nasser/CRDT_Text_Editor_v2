package Computer.Engineering.Google.Text.Editor.controller;

import Computer.Engineering.Google.Text.Editor.dto.*;
import Computer.Engineering.Google.Text.Editor.model.CrdtNode;
import Computer.Engineering.Google.Text.Editor.model.SessionData;
import Computer.Engineering.Google.Text.Editor.services.CrdtService;
import Computer.Engineering.Google.Text.Editor.services.SessionService;
import Computer.Engineering.Google.Text.Editor.services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class CrdtController {
  private static final Logger logger = LoggerFactory.getLogger(CrdtController.class);

  @Autowired
  private CrdtService crdtService;

  @Autowired
  private SessionService sessionService;

  @Autowired
  private UserService userService;

  @Autowired
  private SimpMessagingTemplate messagingTemplate;

  @PostMapping("/api/session/create")
  public ResponseEntity<?> createSession(@RequestBody SessionCreateRequest request) {
    try {
      SessionCreateResponse response = sessionService.createSession(request.getSessionName());
      logger.info("Session created: {}", response.getSessionId());
      return ResponseEntity.ok(response);
    } catch (Exception e) {
      logger.error("Error creating session", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", e.getMessage()));
    }
  }

  @PostMapping("/api/session/join")
  public ResponseEntity<?> joinSession(@RequestBody JoinSessionRequest request) {
    try {
      SessionData session = sessionService.getSessionByCode(request.getCode());
      if (session == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", "Invalid session code"));
      }

      String role = session.getRoleForCode(request.getCode());
      UserPresence user = userService.createUser(
          java.util.UUID.randomUUID().toString(),
          request.getUsername(),
          role,
          session.getSessionId()
      );

      session.addUser(user);

      JoinSessionResponse response = new JoinSessionResponse(
          session.getSessionId(),
          session.getSessionName(),
          user.getUserId(),
          role,
          crdtService.getAllNodes(session.getSessionId()),
          session.getUsers(),
          session.getViewerCode(),
          session.getCollaboratorCode()
      );

      // Broadcast new user to existing users
      messagingTemplate.convertAndSend(
          "/topic/session/" + session.getSessionId() + "/presence",
          user
      );

      logger.info("User {} joined session {} as {}", user.getUsername(), session.getSessionId(), role);
      return ResponseEntity.ok(response);
    } catch (Exception e) {
      logger.error("Error joining session", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/api/session/{sessionId}")
  public ResponseEntity<?> getSessionInfo(@PathVariable String sessionId) {
    try {
      SessionData session = sessionService.getSession(sessionId);
      if (session == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", "Session not found"));
      }

      // We return the session info. Note: We're reusing JoinSessionResponse structure for convenience
      // but in a real app we might want a dedicated DTO.
      // We don't need to return nodes/users here as they are fetched via other means or WebSocket
      // but to keep it consistent with the frontend expectations for "sessionData" we can populate it.
      // However, for just getting codes, we can be simpler.
      
      // Let's stick to returning the JoinSessionResponse format to make frontend reuse easier
      JoinSessionResponse response = new JoinSessionResponse(
          session.getSessionId(),
          session.getSessionName(),
          null, // userId is unknown here
          null, // role is unknown here
          null, // nodes not needed for just info
          session.getUsers(),
          session.getViewerCode(),
          session.getCollaboratorCode()
      );
      
      return ResponseEntity.ok(response);
    } catch (Exception e) {
      logger.error("Error getting session info", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", e.getMessage()));
    }
  }

  @GetMapping("/api/session/{sessionId}/document")
  public ResponseEntity<?> getDocument(@PathVariable String sessionId) {
    try {
      if (!sessionService.sessionExists(sessionId)) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", "Session not found"));
      }

      String document = crdtService.getDocument(sessionId);
      List<CrdtNode> nodes = crdtService.getAllNodes(sessionId);
      
      Map<String, Object> response = new HashMap<>();
      response.put("document", document);
      response.put("nodes", nodes);
      
      return ResponseEntity.ok(response);
    } catch (Exception e) {
      logger.error("Error getting document", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", e.getMessage()));
    }
  }

  @MessageMapping("/session/{sessionId}/insert")
  public void handleInsert(@DestinationVariable String sessionId, @Payload InsertRequest request) {
    try {
      // Check if user has permission
      UserPresence user = userService.getUser(request.getUserId());
      if (user == null || "viewer".equals(user.getRole())) {
        logger.warn("User {} attempted to insert without permission", request.getUserId());
        return;
      }

      crdtService.localInsert(sessionId, request.getValue(), request.getParentId());
      
      // Broadcast the change to all clients in the session
      List<CrdtNode> nodes = crdtService.getAllNodes(sessionId);
      messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/updates", nodes);
      
      logger.debug("Insert broadcasted for session {}", sessionId);
    } catch (Exception e) {
      logger.error("Error handling insert", e);
    }
  }

  @MessageMapping("/session/{sessionId}/delete")
  public void handleDelete(@DestinationVariable String sessionId, @Payload DeleteRequest request) {
    try {
      // Check if user has permission
      UserPresence user = userService.getUser(request.getUserId());
      if (user == null || "viewer".equals(user.getRole())) {
        logger.warn("User {} attempted to delete without permission", request.getUserId());
        return;
      }

      crdtService.localDelete(sessionId, request.getSiteId(), request.getClock());
      
      // Broadcast the change to all clients in the session
      List<CrdtNode> nodes = crdtService.getAllNodes(sessionId);
      messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/updates", nodes);
      
      logger.debug("Delete broadcasted for session {}", sessionId);
    } catch (Exception e) {
      logger.error("Error handling delete", e);
    }
  }

  @MessageMapping("/session/{sessionId}/cursor")
  public void handleCursorUpdate(@DestinationVariable String sessionId, @Payload CursorUpdate cursor) {
    try {
      // Broadcast cursor update to all other clients in the session
      messagingTemplate.convertAndSend("/topic/session/" + sessionId + "/cursors", cursor);
      logger.debug("Cursor update broadcasted for user {} in session {}", cursor.getUserId(), sessionId);
    } catch (Exception e) {
      logger.error("Error handling cursor update", e);
    }
  }
}