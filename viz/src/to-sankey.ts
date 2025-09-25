import { sankeyData } from './data';

interface TreeNode {
  token: string;
  logprob: number;
  totalLogprob: number;
  text: string;
  children: TreeNode[];
}

interface SankeyNode {
  id: string;
  label: string;
  color?: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

function getNodeColor(depth: number): string {
  const colors = ['#e57373', '#f06292', '#ba68c8', '#64b5f6', '#4fc3f7', '#4dd0e1', '#4db6ac', '#81c784'];
  return colors[depth % colors.length];
}

function transformToSankey(data: TreeNode): SankeyData {
  const nodes: SankeyNode[] = [
    {
      id: ' ',
      label: '',
      color: '#00000022'
    }
  ];
  const links: SankeyLink[] = [];
  const processedNodes = new Set<string>();

  // First pass: find maximum depth
  function findMaxDepth(node: TreeNode, currentDepth: number = 0): number {
    if (node.children.length === 0) {
      return currentDepth;
    }
    return Math.max(...node.children.map(child => findMaxDepth(child, currentDepth + 1)));
  }

  const maxDepth = findMaxDepth(data);

  function processNode(node: TreeNode, depth: number = 0, parentId?: string) {
    if (parentId && node.children.length === 0 && node.token.trim() === '') {
      links.push({
        source: parentId,
        target: ' ',
        value: 1, // Small value for early termination
        color: '#00000022'
      });
      
      return; // Skip empty tokens at leaf nodes
    }

    const nodeId = `${parentId}_root_${depth}_${node.logprob}_${node.token || node.text}`;

    if (!processedNodes.has(nodeId) ) {
      processedNodes.add(nodeId);
      nodes.push({
        id: nodeId,
        label: `"${parentId ? (node.token || '" "') : node.text}"`,
        color: getNodeColor(depth)
      });
    }

    if (parentId) {
      const probability = node.logprob; // Shift to positive as many probs are negative

      links.push({
        source: parentId,
        target: nodeId,
        value: probability,
        color: getNodeColor(depth - 1)
      });
    }

    // Process existing children
    node.children.forEach(child => {
      processNode(child, depth + 1, nodeId);
    });

    // If this node has no children and we're not at max depth, connect to early_finish
    if (node.children.length === 0 && depth < maxDepth) {
      links.push({
        source: nodeId,
        target: ' ',
        value: 0.1, // Small value for early termination
        color: 'transparent'
      });
    }
  }

  processNode(data);

  // Normalise min/max to 0-1 range for better Sankey rendering, per depth
  const linksByDepth = new Map<number, SankeyLink[]>();
  
  // Group links by depth (based on source node depth)
  for (const link of links) {
    const sourceDepth = parseInt(link.source.split('_')[1]) || 0;
    if (!linksByDepth.has(sourceDepth)) {
      linksByDepth.set(sourceDepth, []);
    }
    linksByDepth.get(sourceDepth)!.push(link);
  }
  
  // Normalize each depth separately
  for (const [, depthLinks] of linksByDepth) {
    const minValue = Math.min(...depthLinks.map(l => l.value));

    for (const link of depthLinks) {
      link.value = (link.value - minValue);
      console.log('LINK', link.source, link.target, link.value);
    }
  }
  
  return { nodes, links };
}

export function toSankeyFormat(): SankeyData {
  return transformToSankey(sankeyData);
}
