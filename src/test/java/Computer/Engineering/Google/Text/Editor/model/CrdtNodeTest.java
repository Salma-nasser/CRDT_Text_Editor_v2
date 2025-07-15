package Computer.Engineering.Google.Text.Editor.model;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CrdtNodeTest {

  @Test
  public void compareTo_shouldSortByParentIdFirst() {
    CrdtNode nodeA = new CrdtNode("site1", 1, 0, "parentA", 'a');
    CrdtNode nodeB = new CrdtNode("site1", 2, 0, "parentB", 'b');
    assertThat(nodeA.compareTo(nodeB)).isLessThan(0);
    assertThat(nodeB.compareTo(nodeA)).isGreaterThan(0);
  }

  @Test
  public void compareTo_shouldSortByCounterAscendingForSameParent() {
    CrdtNode nodeA = new CrdtNode("site1", 1, 0, "parent", 'a'); // counter 0
    CrdtNode nodeB = new CrdtNode("site1", 2, 1, "parent", 'b'); // counter 1
    assertThat(nodeA.compareTo(nodeB)).isLessThan(0);
  }

  @Test
  public void compareTo_shouldUseSiteIdAsTieBreaker() {
    CrdtNode nodeA = new CrdtNode("siteA", 1, 0, "parent", 'a');
    CrdtNode nodeB = new CrdtNode("siteB", 1, 0, "parent", 'b');
    assertThat(nodeA.compareTo(nodeB)).isLessThan(0);
  }

  @Test
  public void compareTo_sortsListOfNodesCorrectly() {
    CrdtNode h = new CrdtNode("site1", 1, 0, "0", 'h');
    CrdtNode e = new CrdtNode("site1", 2, 0, h.getUniqueId(), 'e');
    CrdtNode l1 = new CrdtNode("site1", 3, 0, e.getUniqueId(), 'l');
    CrdtNode o = new CrdtNode("site1", 5, 0, l1.getUniqueId(), 'o');

    // Simulate concurrent edit: another user adds 'l' at the same spot
    CrdtNode l2_concurrent = new CrdtNode("site2", 4, 1, e.getUniqueId(), 'l');

    List<CrdtNode> nodes = new ArrayList<>(List.of(h, e, l1, o, l2_concurrent));
    Collections.sort(nodes);

    // The order should be determined by parent, then counter, then siteId.
    // l1 and l2_concurrent are siblings. l1 has counter 0, l2 has counter 1.
    // So l1 should come before l2_concurrent.
    assertThat(nodes).containsSequence(e, l1, l2_concurrent);
  }

  @Test
  public void compareTo_handlesIdenticalNodes() {
    CrdtNode nodeA = new CrdtNode("site1", 1, 0, "parent", 'a');
    CrdtNode nodeB = new CrdtNode("site1", 1, 0, "parent", 'a');
    assertThat(nodeA.compareTo(nodeB)).isEqualTo(0);
  }

  @Test
  public void compareTo_handlesClockAsTieBreaker() {
    CrdtNode nodeA = new CrdtNode("site1", 1, 0, "parent", 'a');
    CrdtNode nodeB = new CrdtNode("site1", 2, 0, "parent", 'b');
    assertThat(nodeA.compareTo(nodeB)).isLessThan(0);
  }

  @Test
  public void compareTo_handlesSpecialCharacters() {
    CrdtNode spaceNode = new CrdtNode("site1", 1, 0, "parent", ' ');
    CrdtNode newlineNode = new CrdtNode("site1", 2, 1, "parent", '\n');
    CrdtNode tabNode = new CrdtNode("site1", 3, 2, "parent", '\t');

    List<CrdtNode> nodes = new ArrayList<>(List.of(tabNode, newlineNode, spaceNode));
    Collections.sort(nodes);

    assertThat(nodes).containsExactly(spaceNode, newlineNode, tabNode);
  }

  @Test
  public void equals_worksCorrectlyWithSameIdAndClock() {
    CrdtNode nodeA = new CrdtNode("site1", 5, 0, "parent", 'a');
    CrdtNode nodeB = new CrdtNode("site1", 5, 1, "different", 'b'); // Different counter and parent
    assertThat(nodeA.equals(nodeB)).isTrue(); // Should be equal because same siteId and clock
  }

  @Test
  public void equals_worksCorrectlyWithDifferentIdOrClock() {
    CrdtNode nodeA = new CrdtNode("site1", 5, 0, "parent", 'a');
    CrdtNode nodeB = new CrdtNode("site2", 5, 0, "parent", 'a'); // Different siteId
    CrdtNode nodeC = new CrdtNode("site1", 6, 0, "parent", 'a'); // Different clock

    assertThat(nodeA.equals(nodeB)).isFalse();
    assertThat(nodeA.equals(nodeC)).isFalse();
  }

  @Test
  public void hashCode_consistentWithEquals() {
    CrdtNode nodeA = new CrdtNode("site1", 5, 0, "parent", 'a');
    CrdtNode nodeB = new CrdtNode("site1", 5, 1, "different", 'b');

    assertThat(nodeA.equals(nodeB)).isTrue();
    assertThat(nodeA.hashCode()).isEqualTo(nodeB.hashCode());
  }
}
