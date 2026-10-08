import ELK from 'elkjs/lib/elk.bundled.js';
import { Node, Edge } from '@xyflow/react';

const elk = new ELK();

export async function layoutGraph(
  nodes: Node[],
  edges: Edge[],
  direction: 'RIGHT' | 'DOWN' = 'RIGHT'
): Promise<Node[]> {
  if (!nodes || nodes.length === 0) return [];

  // Group nodes by parentId
  const nodeMap = new Map<string, Node>();
  const childrenByParent = new Map<string, Node[]>();

  nodes.forEach((node) => {
    nodeMap.set(node.id, node);
    const pId = node.parentId || 'root';
    if (!childrenByParent.has(pId)) {
      childrenByParent.set(pId, []);
    }
    childrenByParent.get(pId)!.push(node);
  });

  // Determine visibility based on parent expansion state
  function isNodeVisible(node: Node): boolean {
    if (!node.parentId) return true;
    const parentNode = nodeMap.get(node.parentId);
    if (!parentNode) return true;
    const parentExpanded = Boolean(parentNode.data?.isExpanded);
    return parentExpanded && isNodeVisible(parentNode);
  }

  function buildElkChildren(parentId: string): any[] {
    const childNodes = childrenByParent.get(parentId) || [];
    return childNodes
      .filter((node) => isNodeVisible(node))
      .map((node) => {
        const isGroup = node.type === 'folderGroupNode';
        const isExpanded = Boolean(node.data?.isExpanded);
        const hasVisibleChildren = isGroup && isExpanded && childrenByParent.has(node.id);

        const elkNode: any = {
          id: node.id,
          width: (node as any).width || node.measured?.width || (isGroup ? (isExpanded ? 380 : 240) : 210),
          height: (node as any).height || node.measured?.height || (isGroup ? (isExpanded ? 240 : 85) : 65),
        };

        if (hasVisibleChildren) {
          elkNode.children = buildElkChildren(node.id);
          elkNode.layoutOptions = {
            'elk.padding': '[top=60,left=30,bottom=30,right=30]',
            'elk.spacing.nodeNode': '35',
          };
        }
        return elkNode;
      });
  }

  const rootChildren = buildElkChildren('root');

  const visibleEdges = edges.filter((edge) => {
    const src = nodeMap.get(edge.source);
    const tgt = nodeMap.get(edge.target);
    if (!src || !tgt) return false;
    return isNodeVisible(src) && isNodeVisible(tgt);
  });

  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
      'elk.spacing.nodeNode': '50',
      'elk.layered.spacing.nodeNodeBetweenLayers': '90',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
    },
    children: rootChildren,
    edges: visibleEdges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  try {
    const layoutedGraph = await elk.layout(graph);

    const positionMap = new Map<string, { x: number; y: number; width?: number; height?: number }>();

    function extractPositions(elkNodes: any[]) {
      if (!elkNodes) return;
      elkNodes.forEach((elkNode) => {
        if (elkNode.x !== undefined && elkNode.y !== undefined) {
          positionMap.set(elkNode.id, {
            x: elkNode.x,
            y: elkNode.y,
            width: elkNode.width,
            height: elkNode.height,
          });
        }
        if (elkNode.children) {
          extractPositions(elkNode.children);
        }
      });
    }

    extractPositions(layoutedGraph.children || []);

    return nodes.map((node) => {
      const visible = isNodeVisible(node);
      const pos = positionMap.get(node.id);
      const isGroup = node.type === 'folderGroupNode';
      const isExpanded = Boolean(node.data?.isExpanded);

      if (pos) {
        return {
          ...node,
          hidden: !visible,
          position: {
            x: pos.x,
            y: pos.y,
          },
          ...(isGroup
            ? {
                style: {
                  ...node.style,
                  width: isExpanded && pos.width ? Math.max(pos.width, 360) : 240,
                  height: isExpanded && pos.height ? Math.max(pos.height, 200) : 85,
                },
              }
            : {}),
        };
      }

      return {
        ...node,
        hidden: !visible,
      };
    });
  } catch (err) {
    console.error('ELK hierarchical layout error:', err);
    return nodes;
  }
}
