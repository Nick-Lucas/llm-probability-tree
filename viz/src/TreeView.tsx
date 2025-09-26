import React from "react";
import { data, type TreeNode } from "./data";

interface TreeViewProps {
  node?: TreeNode;
  depth?: number;
  parentChildren?: TreeNode[];
}

const getColorFromProbability = (normalizedProb: number): string => {
  // Grey to green gradient for better text readability
  const red = Math.round(240 - normalizedProb * 120); // 240 to 120
  const green = Math.round(240 - normalizedProb * 40); // 240 to 200
  const blue = Math.round(240 - normalizedProb * 120); // 240 to 120
  return `rgb(${red}, ${green}, ${blue})`;
};

const TreeNodeComponent: React.FC<{
  node: TreeNode;
  depth: number;
  parentChildren?: TreeNode[];
  decimalPlaces: number;
}> = ({ node, depth, parentChildren, decimalPlaces }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const indent = depth * 20;
  const probability = Math.exp(node.logprob);
  const totalProbability = Math.exp(node.totalLogprob);

  // Calculate normalized probability among siblings
  let normalizedProb = 0.5; // Default neutral color
  if (parentChildren && parentChildren.length > 1) {
    const siblingProbs = parentChildren.map((child) => Math.exp(child.logprob));
    const maxProb = Math.max(...siblingProbs);
    const minProb = Math.min(...siblingProbs);
    if (maxProb > minProb) {
      normalizedProb = (probability - minProb) / (maxProb - minProb);
    }
  }

  const probabilityBg =
    depth === 0 ? "#f0f0f0" : getColorFromProbability(normalizedProb);
  const hasChildren = node.children.length > 0;

  const isLeaf = node.token === '\n\n' && node.children.length === 0;

  const formatProbability = (prob: number) => {
    if (decimalPlaces === -1) return prob.toString();
    return prob.toFixed(decimalPlaces) + 'ish';
  };

  return (
    <div
      style={{
        marginLeft: `${indent}px`,
        borderLeft: depth > 0 ? "1px solid #ccc" : "none",
        paddingLeft: "8px",
      }}
    >
      <div
        style={{
          padding: "4px 8px",
          margin: "2px 0",
          backgroundColor: isLeaf ? "#8f66f0" : probabilityBg,
          border: "1px solid #ddd",
          borderRadius: "4px",
          fontSize: "14px",
          cursor: hasChildren ? "pointer" : "default",
        }}
        onClick={() => hasChildren && setIsCollapsed(!isCollapsed)}
      >
        <div
          style={{
            fontWeight: "bold",
            color: isLeaf ? "#FFFFFF" : "#333",
            display: "flex",
            alignItems: "center",
          }}
        >
          {hasChildren && (
            <span
              style={{ marginRight: "8px", fontSize: "12px", color: "#888" }}
            >
              {isCollapsed ? "▶" : "▼"}
            </span>
          )}

          {isLeaf ? "✅" : `Token: "${node.token}"`}

          <span
              style={{
                marginLeft: "8px",
                fontSize: "12px",
                color: isLeaf ? "#E0E7FF" : "#666",
              }}
            >
              (probability: {formatProbability(probability)}, cumulative: {formatProbability(totalProbability)})
            </span>

          {hasChildren && (
            <span
              style={{ marginLeft: "8px", fontSize: "11px", color: "#888" }}
            >
              ({node.children.length} children)
            </span>
          )}
        </div>

        <div
          style={{
            fontSize: "12px",
            color: isLeaf ? "#F3F4F6" : "#555",
            marginTop: "4px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            paddingTop: "2px",
          }}
        >
          "{isLeaf ? node.text.trim() : node.text}"
        </div>
      </div>
      <div
        style={{
          overflow: "hidden",
          transition: "max-height 0.3s ease-out, opacity 0.3s ease-out",
          maxHeight: isCollapsed ? "0px" : "10000px",
          opacity: isCollapsed ? 0 : 1,
        }}
      >
        {node.children.map((child, index) => (
          <TreeNodeComponent
            key={index}
            node={child}
            depth={depth + 1}
            parentChildren={node.children}
            decimalPlaces={decimalPlaces}
          />
        ))}
      </div>
    </div>
  );
};

export const TreeView: React.FC<TreeViewProps> = ({
  node,
  depth = 0,
}) => {
  const [selectedDataIndex, setSelectedDataIndex] = React.useState(0);
  const [decimalPlaces, setDecimalPlaces] = React.useState(4);
  const selectedData = node || data[selectedDataIndex].tree;

  return (
    <div
      style={{
        padding: "16px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {!node && (
        <div style={{ marginBottom: "16px", display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <label htmlFor="data-selector" style={{ marginRight: "8px", fontWeight: "bold" }}>
              Choose dataset:
            </label>
            <select
              id="data-selector"
              value={selectedDataIndex}
              onChange={(e) => setSelectedDataIndex(Number(e.target.value))}
              style={{
                padding: "4px 8px",
                fontSize: "14px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              {data.map((item, index) => (
                <option key={index} value={index}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="decimal-selector" style={{ marginRight: "8px", fontWeight: "bold" }}>
              Decimal places:
            </label>
            <select
              id="decimal-selector"
              value={decimalPlaces}
              onChange={(e) => setDecimalPlaces(Number(e.target.value))}
              style={{
                padding: "4px 8px",
                fontSize: "14px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <option value={-1}>No Rounding</option>
              {[...Array(11)].map((_, i) => (
                <option key={i} value={i}>
                  {i} decimal{i !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <TreeNodeComponent node={selectedData} depth={depth} decimalPlaces={decimalPlaces} />
    </div>
  );
};

export default TreeView;
