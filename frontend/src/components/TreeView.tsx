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
    <div className="p-4 font-sans">
      {
        <div className="mb-4 flex gap-4 items-center flex-wrap">
          <div>
            <label
              htmlFor="data-selector"
              className="mr-2 font-bold"
            >
              Choose dataset:
            </label>
            <select
              id="data-selector"
              value={selectedDataIndex}
              onChange={(e) =>
                updateSearch({ dataIndex: Number(e.target.value) })
              }
              className="px-2 py-1 text-sm border border-gray-300 rounded"
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
              className="mr-2 font-bold"
            >
              Decimal places:
            </label>
            <select
              id="decimal-selector"
              value={decimalPlaces}
              onChange={(e) =>
                updateSearch({ decimalPlaces: Number(e.target.value) })
              }
              className="px-2 py-1 text-sm border border-gray-300 rounded"
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
              className="mr-2 font-bold"
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
              className="px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="all">Show All</option>
              <option value="finished">Only Finished</option>
              <option value="top2">Top 2</option>
            </select>
          </div>
        </div>
      }

      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
        <h3 className="m-0 mb-2 text-base font-bold">
          Dataset Properties
        </h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 text-sm">
          <div>
            <strong>Max Depth:</strong> {data[selectedDataIndex].result.maxDepth}
          </div>
          <div>
            <strong>Top K Per Step:</strong> {data[selectedDataIndex].result.topKPerStep}
          </div>
          <div>
            <strong>Temperature:</strong> {data[selectedDataIndex].result.temperature}
          </div>
          <div className="col-span-full">
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