import React from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { data, type TreeNode } from "../data";
import type { SearchParams } from "../routes/tree";
import { TreeNodeComponent } from "./TreeNodeComponent";

interface TreeViewProps {
  depth?: number;
  parentChildren?: TreeNode[];
}

export const TreeView: React.FC<TreeViewProps> = ({ depth = 0 }) => {
  const search = useSearch({ from: "/tree" }) as SearchParams;
  const navigate = useNavigate({ from: "/tree" });

  const selectedDataIndex = search.dataIndex;
  const decimalPlaces = search.decimalPlaces;
  const pathFilter = search.pathFilter;
  const node = data[selectedDataIndex].result.tree;

  const updateSearch = (updates: Partial<SearchParams>) => {
    navigate({
      search: { ...search, ...updates },
    });
  };

  return (
    <div
      style={{
        padding: "16px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <label
              htmlFor="data-selector"
              style={{ marginRight: "8px", fontWeight: "bold" }}
            >
              Choose dataset:
            </label>
            <select
              id="data-selector"
              value={selectedDataIndex}
              onChange={(e) =>
                updateSearch({ dataIndex: Number(e.target.value) })
              }
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
            <label
              htmlFor="decimal-selector"
              style={{ marginRight: "8px", fontWeight: "bold" }}
            >
              Decimal places:
            </label>
            <select
              id="decimal-selector"
              value={decimalPlaces}
              onChange={(e) =>
                updateSearch({ decimalPlaces: Number(e.target.value) })
              }
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
                  {i} decimal{i !== 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="nodes-selector"
              style={{ marginRight: "8px", fontWeight: "bold" }}
            >
              Paths:
            </label>
            <select
              id="nodes-selector"
              value={pathFilter}
              onChange={(e) =>
                updateSearch({
                  pathFilter: e.target.value as "all" | "finished" | "top2",
                })
              }
              style={{
                padding: "4px 8px",
                fontSize: "14px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <option value="all">Show All</option>
              <option value="finished">Only Finished</option>
              <option value="top2">Top 2</option>
            </select>
          </div>
        </div>
      }

      <div
        style={{
          marginBottom: "16px",
          padding: "12px",
          backgroundColor: "#f8f9fa",
          border: "1px solid #e9ecef",
          borderRadius: "6px",
        }}
      >
        <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "bold" }}>
          Dataset Properties
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "8px",
            fontSize: "14px",
          }}
        >
          <div>
            <strong>Max Depth:</strong> {data[selectedDataIndex].result.maxDepth}
          </div>
          <div>
            <strong>Top K Per Step:</strong> {data[selectedDataIndex].result.topKPerStep}
          </div>
          <div>
            <strong>Temperature:</strong> {data[selectedDataIndex].result.temperature}
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <strong>Prompt:</strong> "{data[selectedDataIndex].result.prompt}"
          </div>
        </div>
      </div>

      <TreeNodeComponent
        node={node}
        depth={depth}
        decimalPlaces={decimalPlaces}
        pathFilter={pathFilter}
      />
    </div>
  );
};

export default TreeView;