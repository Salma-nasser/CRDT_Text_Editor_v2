package Computer.Engineering.Google.Text.Editor.controller;

import Computer.Engineering.Google.Text.Editor.dto.DeleteRequest;
import Computer.Engineering.Google.Text.Editor.dto.InsertRequest;
import Computer.Engineering.Google.Text.Editor.model.CrdtNode;
import Computer.Engineering.Google.Text.Editor.services.CrdtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crdt")
public class CrdtController {

  @Autowired
  private CrdtService crdtService;

  @Autowired
  private SimpMessagingTemplate messagingTemplate;

  @GetMapping("/document")
  public ResponseEntity<String> getDocument() {
    return ResponseEntity.ok(crdtService.getDocument());
  }

  @PostMapping("/insert")
  public ResponseEntity<?> insert(@RequestBody InsertRequest request) {
    crdtService.localInsert(request.getValue(), request.getParentId());
    // Broadcast the change to all clients
    messagingTemplate.convertAndSend("/topic/updates", crdtService.getAllNodes());
    return ResponseEntity.ok().build();
  }

  @PostMapping("/delete")
  public ResponseEntity<?> delete(@RequestBody DeleteRequest request) {
    crdtService.localDelete(request.getSiteId(), request.getClock());
    // Broadcast the change to all clients
    messagingTemplate.convertAndSend("/topic/updates", crdtService.getAllNodes());
    return ResponseEntity.ok().build();
  }

  @MessageMapping("/edit")
  @SendTo("/topic/updates")
  public List<CrdtNode> handleEdit(List<CrdtNode> nodes) {
    // This is for when a client sends a full list of nodes, e.g. on initial
    // connection
    // Or for a more complex merge strategy.
    // For now, we just broadcast it back out.
    return nodes;
  }
}