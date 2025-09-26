import React from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { data, type TreeNode } from '../data'
import type { SearchParams } from '../routes/tree'
import { TreeNodeComponent } from './TreeNodeComponent'

interface TreeViewProps {
  depth?: number
  parentChildren?: TreeNode[]
}

export const TreeView: React.FC<TreeViewProps> = ({ depth = 0 }) => {
  const search = useSearch({ from: '/tree' }) as SearchParams
  const navigate = useNavigate({ from: '/tree' })

  const selectedDataIndex = search.dataIndex
  const decimalPlaces = search.decimalPlaces
  const pathFilter = search.pathFilter
  const node = data[selectedDataIndex].result.tree

  const updateSearch = (updates: Partial<SearchParams>) => {
    navigate({
      search: { ...search, ...updates },
    })
  }

  return (
    <div className="p-4 font-sans relative">
      <a
        href="https://github.com/Nick-Lucas/llm-probability-tree"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-4 right-4 z-10 bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
      >
        <svg
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        GitHub
      </a>
      {
        <div className="mb-4 flex gap-4 items-center flex-wrap">
          <div>
            <label htmlFor="data-selector" className="mr-2 font-bold">
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
            <label htmlFor="decimal-selector" className="mr-2 font-bold">
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
                  {i} decimal{i !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="nodes-selector" className="mr-2 font-bold">
              Paths:
            </label>
            <select
              id="nodes-selector"
              value={pathFilter}
              onChange={(e) =>
                updateSearch({
                  pathFilter: e.target.value as 'all' | 'finished' | 'top2',
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
        <h3 className="m-0 mb-2 text-base font-bold">Dataset Properties</h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 text-sm">
          <div>
            <strong>Max Depth:</strong>{' '}
            {data[selectedDataIndex].result.maxDepth}
          </div>
          <div>
            <strong>Top K Per Step:</strong>{' '}
            {data[selectedDataIndex].result.topKPerStep}
          </div>
          <div>
            <strong>Temperature:</strong>{' '}
            {data[selectedDataIndex].result.temperature}
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
  )
}

export default TreeView
