package Computer.Engineering.Google.Text.Editor.services;

import Computer.Engineering.Google.Text.Editor.model.CrdtBuffer;
import Computer.Engineering.Google.Text.Editor.model.CrdtNode;
import Computer.Engineering.Google.Text.Editor.model.SessionData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CrdtService {

    @Autowired
    private SessionService sessionService;

    public synchronized void localInsert(String sessionId, char ch, String parentId) {
        SessionData session = sessionService.getSession(sessionId);
        if (session != null) {
            session.getBuffer().insert(ch, parentId);
        }
    }

    public synchronized void localDelete(String sessionId, String siteId, int clock) {
        SessionData session = sessionService.getSession(sessionId);
        if (session != null) {
            session.getBuffer().delete(siteId, clock);
        }
    }

    public synchronized String getDocument(String sessionId) {
        SessionData session = sessionService.getSession(sessionId);
        return session != null ? session.getBuffer().getDocument() : "";
    }

    public synchronized List<CrdtNode> getAllNodes(String sessionId) {
        SessionData session = sessionService.getSession(sessionId);
        return session != null ? session.getBuffer().getAllNodes() : List.of();
    }

    public synchronized void print(String sessionId) {
        SessionData session = sessionService.getSession(sessionId);
        if (session != null) {
            session.getBuffer().printBuffer();
        }
    }
}