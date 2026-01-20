import { CrdtNode } from './ApiService';

export class CrdtClient {
  private nodes: CrdtNode[] = [];
  private siteId: string;
  private clock: number = 0;

  constructor(siteId: string, initialNodes: CrdtNode[] = []) {
    this.siteId = siteId;
    this.nodes = [...initialNodes]; // Create a copy
    // Calculate max clock from initial nodes to ensure monotonicity
    if (this.nodes.length > 0) {
      this.nodes.forEach(node => {
        if (node.siteId === this.siteId && node.clock > this.clock) {
          this.clock = node.clock;
        }
      });
    }
  }

  insert(char: string, position: number): { char: string; parentId: string } {
    this.clock++;
    
    // Find the parent node at the position
    let parentId = 'root';
    const visibleNodes = this.getVisibleNodes();
    
    if (position > 0 && position <= visibleNodes.length) {
      parentId = visibleNodes[position - 1].siteId + '-' + visibleNodes[position - 1].clock;
    }

    return { char, parentId };
  }

  delete(position: number): { siteId: string; clock: number } | null {
    const visibleNodes = this.getVisibleNodes();
    
    if (position < 0 || position >= visibleNodes.length) {
      return null;
    }

    const nodeToDelete = visibleNodes[position];
    return {
      siteId: nodeToDelete.siteId,
      clock: nodeToDelete.clock,
    };
  }

  mergeNodes(newNodes: CrdtNode[]): void {
    // Simply replacing nodes might be inefficient but robust for this implementation
    // Ideally we should merge sets
    this.nodes = newNodes;
    
    // Update clock if we see higher clock from our own site
    if (this.nodes.length > 0) {
      this.nodes.forEach(node => {
        if (node.siteId === this.siteId && node.clock > this.clock) {
          this.clock = node.clock;
        }
      });
    }
  }

  getDocument(): string {
    return this.getVisibleNodes()
      .map((node) => node.value)
      .join('');
  }

  getNodes(): CrdtNode[] {
    return this.nodes;
  }

  private getVisibleNodes(): CrdtNode[] {
    // Build a tree structure and perform in-order traversal
    const nodeMap = new Map<string, CrdtNode>();
    const childrenMap = new Map<string, CrdtNode[]>();

    // Build maps
    for (const node of this.nodes) {
      if (!node.deleted) {
        const nodeId = `${node.siteId}-${node.clock}`;
        nodeMap.set(nodeId, node);

        if (!childrenMap.has(node.parentId)) {
          childrenMap.set(node.parentId, []);
        }
        childrenMap.get(node.parentId)!.push(node);
      }
    }

    // Sort children by counter, then by siteId for deterministic ordering
    Array.from(childrenMap.values()).forEach((children) => {
      children.sort((a: CrdtNode, b: CrdtNode) => {
        if (a.counter !== b.counter) {
          return a.counter - b.counter;
        }
        return a.siteId.localeCompare(b.siteId);
      });
    });

    // Perform in-order traversal
    const result: CrdtNode[] = [];
    const traverse = (parentId: string) => {
      const children = childrenMap.get(parentId) || [];
      for (const child of children) {
        result.push(child);
        const childId = `${child.siteId}-${child.clock}`;
        traverse(childId);
      }
    };

    traverse('root');
    return result;
  }

  getNodeAtPosition(position: number): CrdtNode | null {
    const visibleNodes = this.getVisibleNodes();
    if (position < 0 || position >= visibleNodes.length) {
      return null;
    }
    return visibleNodes[position];
  }

  getSiteId(): string {
    return this.siteId;
  }

  getClock(): number {
    return this.clock;
  }
}

export default CrdtClient;
