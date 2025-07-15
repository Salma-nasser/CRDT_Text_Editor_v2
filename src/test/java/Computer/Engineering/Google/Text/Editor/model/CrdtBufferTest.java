package Computer.Engineering.Google.Text.Editor.model;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class CrdtBufferTest {

  private CrdtBuffer buffer;

  @BeforeEach
  public void setUp() {
    buffer = new CrdtBuffer("site1");
  }

  @Test
  public void testInsert_simpleAppend() {
    buffer.insert('h', "0");
    buffer.insert('e', buffer.getLastInsertedId());
    buffer.insert('l', buffer.getLastInsertedId());
    buffer.insert('l', buffer.getLastInsertedId());
    buffer.insert('o', buffer.getLastInsertedId());

    assertThat(buffer.getDocument()).isEqualTo("hello");
  }

  @Test
  public void testInsert_inMiddle() {
    // Initial: "ct"
    buffer.insert('c', "0");
    String c_id = buffer.getLastInsertedId();
    buffer.insert('t', c_id);
    assertThat(buffer.getDocument()).isEqualTo("ct");

    // Insert 'a' between 'c' and 't'
    buffer.insert('a', c_id);
    assertThat(buffer.getDocument()).isEqualTo("cat");
  }

  @Test
  public void testDelete_reparentsChild() {
    // Initial: "cat"
    buffer.insert('c', "0");
    String c_id = buffer.getLastInsertedId();
    buffer.insert('a', c_id);
    String a_id = buffer.getLastInsertedId();
    buffer.insert('t', a_id);
    assertThat(buffer.getDocument()).isEqualTo("cat");

    // Delete 'a'
    String[] a_parts = a_id.split("-");
    buffer.delete(a_parts[0], Integer.parseInt(a_parts[1]));

    // 't' should now be a child of 'c'
    assertThat(buffer.getDocument()).isEqualTo("ct");
  }

  @Test
  public void testConcurrentInsert_samePath() {
    CrdtBuffer bufferUser1 = new CrdtBuffer("userA");
    CrdtBuffer bufferUser2 = new CrdtBuffer("userB");

    // User 1 creates initial document "CT"
    bufferUser1.insert('C', "0");
    String c_id = bufferUser1.getLastInsertedId();
    bufferUser1.insert('T', c_id);

    // User 2 gets the same initial state by merging
    bufferUser2.merge(bufferUser1.getAllNodes(), bufferUser1.getDeletedNodes());

    // Now both users insert at the same position (between C and T)
    // User 1 inserts 'A' between C and T
    bufferUser1.insert('A', c_id);

    // User 2 inserts 'B' between C and T (same parent)
    bufferUser2.insert('B', c_id);

    // Now merge the changes
    bufferUser1.merge(bufferUser2.getAllNodes(), bufferUser2.getDeletedNodes());
    bufferUser2.merge(bufferUser1.getAllNodes(), bufferUser1.getDeletedNodes());

    // Both users should see the same final state with consistent ordering
    String finalDoc1 = bufferUser1.getDocument();
    String finalDoc2 = bufferUser2.getDocument();

    assertThat(finalDoc1).isEqualTo(finalDoc2); // Both should be identical
    assertThat(finalDoc1).contains("C");
    assertThat(finalDoc1).contains("A");
    assertThat(finalDoc1).contains("B");
    assertThat(finalDoc1).contains("T");
  }

  @Test
  public void getDocument_shouldHandleComplexTree() {
    // "cat"
    buffer.insert('c', "0");
    String c_id = buffer.getLastInsertedId();
    buffer.insert('a', c_id);
    String a_id = buffer.getLastInsertedId();
    buffer.insert('t', a_id); // insert 'r' after 'a' -> "cart"
    buffer.insert('r', a_id);
    assertThat(buffer.getDocument()).isEqualTo("cart");

    // delete 'a' -> "crt"
    String[] a_parts = a_id.split("-");
    buffer.delete(a_parts[0], Integer.parseInt(a_parts[1]));
    assertThat(buffer.getDocument()).isEqualTo("crt");
  }

  @Test
  public void testEmptyBuffer() {
    assertThat(buffer.getDocument()).isEmpty();
    assertThat(buffer.getAllNodes()).isEmpty();
    assertThat(buffer.getDeletedNodes()).isEmpty();
    assertThat(buffer.getLastInsertedId()).isEqualTo("0");
  }

  @Test
  public void testSingleCharacter() {
    buffer.insert('x', "0");
    assertThat(buffer.getDocument()).isEqualTo("x");
    assertThat(buffer.getAllNodes()).hasSize(1);
  }

  @Test
  public void testSpecialCharacters() {
    buffer.insert(' ', "0");
    String space_id = buffer.getLastInsertedId();
    buffer.insert('\n', space_id);
    String newline_id = buffer.getLastInsertedId();
    buffer.insert('\t', newline_id);

    assertThat(buffer.getDocument()).isEqualTo(" \n\t");
  }

  @Test
  public void testMultipleMiddleInsertions() {
    // Start with "ab"
    buffer.insert('a', "0");
    String a_id = buffer.getLastInsertedId();
    buffer.insert('b', a_id);
    assertThat(buffer.getDocument()).isEqualTo("ab");

    // Insert multiple characters in the middle: "a123b"
    buffer.insert('1', a_id);
    buffer.insert('2', a_id);
    buffer.insert('3', a_id);
    assertThat(buffer.getDocument()).isEqualTo("a321b");
  }

  @Test
  public void testDeleteNonExistentNode() {
    buffer.insert('a', "0");
    assertThat(buffer.getDocument()).isEqualTo("a");

    // Try to delete a node that doesn't exist
    buffer.delete("nonexistent", 999);
    assertThat(buffer.getDocument()).isEqualTo("a"); // Should remain unchanged
  }

  @Test
  public void testDeleteAllCharacters() {
    // Create "hello"
    buffer.insert('h', "0");
    String h_id = buffer.getLastInsertedId();
    buffer.insert('e', h_id);
    String e_id = buffer.getLastInsertedId();
    buffer.insert('l', e_id);
    String l1_id = buffer.getLastInsertedId();
    buffer.insert('l', l1_id);
    String l2_id = buffer.getLastInsertedId();
    buffer.insert('o', l2_id);

    assertThat(buffer.getDocument()).isEqualTo("hello");

    // Delete all characters one by one
    String[] h_parts = h_id.split("-");
    buffer.delete(h_parts[0], Integer.parseInt(h_parts[1]));
    assertThat(buffer.getDocument()).isEqualTo("ello");

    String[] e_parts = e_id.split("-");
    buffer.delete(e_parts[0], Integer.parseInt(e_parts[1]));
    assertThat(buffer.getDocument()).isEqualTo("llo");

    String[] l1_parts = l1_id.split("-");
    buffer.delete(l1_parts[0], Integer.parseInt(l1_parts[1]));
    assertThat(buffer.getDocument()).isEqualTo("lo");

    String[] l2_parts = l2_id.split("-");
    buffer.delete(l2_parts[0], Integer.parseInt(l2_parts[1]));
    assertThat(buffer.getDocument()).isEqualTo("o");

    String o_id = buffer.getLastInsertedId();
    String[] o_parts = o_id.split("-");
    buffer.delete(o_parts[0], Integer.parseInt(o_parts[1]));
    assertThat(buffer.getDocument()).isEmpty();
  }

  @Test
  public void testComplexConcurrentScenario() {
    CrdtBuffer user1 = new CrdtBuffer("user1");
    CrdtBuffer user2 = new CrdtBuffer("user2");
    CrdtBuffer user3 = new CrdtBuffer("user3");

    // User1 creates "Hello"
    user1.insert('H', "0");
    String h_id = user1.getLastInsertedId();
    user1.insert('e', h_id);
    String e_id = user1.getLastInsertedId();
    user1.insert('l', e_id);
    String l1_id = user1.getLastInsertedId();
    user1.insert('l', l1_id);
    String l2_id = user1.getLastInsertedId();
    user1.insert('o', l2_id);

    // All users sync to the same state
    user2.merge(user1.getAllNodes(), user1.getDeletedNodes());
    user3.merge(user1.getAllNodes(), user1.getDeletedNodes());

    // User2 inserts " World" after "Hello"
    String o_id = user2.getLastInsertedId();
    user2.insert(' ', o_id);
    String space_id = user2.getLastInsertedId();
    user2.insert('W', space_id);
    String w_id = user2.getLastInsertedId();
    user2.insert('o', w_id);
    String wo_id = user2.getLastInsertedId();
    user2.insert('r', wo_id);
    String wr_id = user2.getLastInsertedId();
    user2.insert('l', wr_id);
    String wl_id = user2.getLastInsertedId();
    user2.insert('d', wl_id);

    // User3 inserts " there" at the same position (after original "Hello")
    user3.insert(' ', o_id);
    String space3_id = user3.getLastInsertedId();
    user3.insert('t', space3_id);
    String t_id = user3.getLastInsertedId();
    user3.insert('h', t_id);
    String th_id = user3.getLastInsertedId();
    user3.insert('e', th_id);
    String the_id = user3.getLastInsertedId();
    user3.insert('r', the_id);
    String ther_id = user3.getLastInsertedId();
    user3.insert('e', ther_id);

    // Merge all changes
    user1.merge(user2.getAllNodes(), user2.getDeletedNodes());
    user1.merge(user3.getAllNodes(), user3.getDeletedNodes());
    user2.merge(user1.getAllNodes(), user1.getDeletedNodes());
    user2.merge(user3.getAllNodes(), user3.getDeletedNodes());
    user3.merge(user1.getAllNodes(), user1.getDeletedNodes());
    user3.merge(user2.getAllNodes(), user2.getDeletedNodes());

    // All users should converge to the same final state
    String finalDoc1 = user1.getDocument();
    String finalDoc2 = user2.getDocument();
    String finalDoc3 = user3.getDocument();

    assertThat(finalDoc1).isEqualTo(finalDoc2);
    assertThat(finalDoc2).isEqualTo(finalDoc3);

    // The document should contain all the text
    assertThat(finalDoc1).contains("Hello");
    assertThat(finalDoc1).contains("World");
    assertThat(finalDoc1).contains("there");
  }

  @Test
  public void testLargeDocument() {
    // Create a document with 26 characters (one full alphabet)
    String currentParent = "0";
    for (int i = 0; i < 26; i++) {
      char c = (char) ('a' + i);
      buffer.insert(c, currentParent);
      currentParent = buffer.getLastInsertedId();
    }

    String document = buffer.getDocument();
    assertThat(document).hasSize(26);
    assertThat(buffer.getAllNodes()).hasSize(26);

    // For CRDT with sequential end insertion, we expect linear ordering
    assertThat(document).isEqualTo("abcdefghijklmnopqrstuvwxyz");
  }

  @Test
  public void testClearBuffer() {
    buffer.insert('a', "0");
    buffer.insert('b', buffer.getLastInsertedId());
    buffer.insert('c', buffer.getLastInsertedId());

    assertThat(buffer.getDocument()).isEqualTo("abc");
    assertThat(buffer.getAllNodes()).hasSize(3);

    buffer.clear();

    assertThat(buffer.getDocument()).isEmpty();
    assertThat(buffer.getAllNodes()).isEmpty();
    assertThat(buffer.getDeletedNodes()).isEmpty();
    assertThat(buffer.getLastInsertedId()).isEqualTo("0");
  }

  @Test
  public void testGetNodeIdAtPosition() {
    buffer.insert('a', "0");
    String a_id = buffer.getLastInsertedId();
    buffer.insert('b', a_id);
    String b_id = buffer.getLastInsertedId();
    buffer.insert('c', b_id);
    String c_id = buffer.getLastInsertedId();

    assertThat(buffer.getNodeIdAtPosition(0)).isEqualTo(a_id);
    assertThat(buffer.getNodeIdAtPosition(1)).isEqualTo(b_id);
    assertThat(buffer.getNodeIdAtPosition(2)).isEqualTo(c_id);
    assertThat(buffer.getNodeIdAtPosition(-1)).isEqualTo("0"); // Out of bounds
    assertThat(buffer.getNodeIdAtPosition(10)).isEqualTo("0"); // Out of bounds
  }

  @Test
  public void testMergeWithDeletedNodes() {
    CrdtBuffer buffer1 = new CrdtBuffer("user1");
    CrdtBuffer buffer2 = new CrdtBuffer("user2");

    // Buffer1 creates "abc"
    buffer1.insert('a', "0");
    String a_id = buffer1.getLastInsertedId();
    buffer1.insert('b', a_id);
    String b_id = buffer1.getLastInsertedId();
    buffer1.insert('c', b_id);

    // Buffer2 gets the same state
    buffer2.merge(buffer1.getAllNodes(), buffer1.getDeletedNodes());
    assertThat(buffer2.getDocument()).isEqualTo("abc");

    // Buffer1 deletes 'b'
    String[] b_parts = b_id.split("-");
    buffer1.delete(b_parts[0], Integer.parseInt(b_parts[1]));
    assertThat(buffer1.getDocument()).isEqualTo("ac");

    // Buffer2 merges the deletion
    buffer2.merge(buffer1.getAllNodes(), buffer1.getDeletedNodes());
    assertThat(buffer2.getDocument()).isEqualTo("ac");

    // Both should have the same number of total nodes (including deleted)
    assertThat(buffer1.getAllNodes()).hasSize(buffer2.getAllNodes().size());
  }

  @Test
  public void testStressTestRapidInsertions() {
    // Simulate rapid typing at the end of document
    String currentParent = "0";

    for (int i = 0; i < 26; i++) { // Use 26 instead of 50 to avoid cycling
      char c = (char) ('A' + i);
      buffer.insert(c, currentParent);
      currentParent = buffer.getLastInsertedId();
    }

    // For sequential end insertions in CRDT, expect linear ordering
    assertThat(buffer.getDocument()).isEqualTo("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    assertThat(buffer.getAllNodes()).hasSize(26);
  }
}
