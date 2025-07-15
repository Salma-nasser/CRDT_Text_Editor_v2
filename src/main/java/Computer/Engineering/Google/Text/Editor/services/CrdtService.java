package Computer.Engineering.Google.Text.Editor.services;

import Computer.Engineering.Google.Text.Editor.model.CrdtBuffer;
import Computer.Engineering.Google.Text.Editor.model.CrdtNode;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CrdtService {

    private final CrdtBuffer buffer = new CrdtBuffer("server"); // Server as siteId

    public synchronized void localInsert(char ch, String parentId) {
        buffer.insert(ch, parentId);
    }

    public synchronized void localDelete(String siteId, int clock) {
        buffer.delete(siteId, clock);
    }

    public synchronized String getDocument() {
        return buffer.getDocument();
    }

    public synchronized List<CrdtNode> getAllNodes() {
        return buffer.getAllNodes();
    }

    public synchronized void print() {
        buffer.printBuffer();
    }
}