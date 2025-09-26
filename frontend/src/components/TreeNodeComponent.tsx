import React from 'react'
import type { TreeNode } from '../data'

const hasLeafDescendant = (node: TreeNode): boolean => {
  const isLeaf = node.token === '\n\n' && node.children.length === 0
  if (isLeaf) return true
  return node.children.some((child) => hasLeafDescendant(child))
}

const getColorFromProbability = (normalizedProb: number): string => {
  // Grey to green gradient for better text readability
  const red = Math.round(240 - normalizedProb * 120) // 240 to 120
  const green = Math.round(240 - normalizedProb * 40) // 240 to 200
  const blue = Math.round(240 - normalizedProb * 120) // 240 to 120
  return `rgb(${red}, ${green}, ${blue})`
}

export const TreeNodeComponent: React.FC<{
  node: TreeNode
  depth: number
  parentChildren?: TreeNode[]
  decimalPlaces: number
  pathFilter: 'all' | 'finished' | 'top2'
}> = ({ node, depth, parentChildren, decimalPlaces, pathFilter }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const indent = depth > 0 ? 20 : 0
  const probability = node.logprob
  const totalProbability = node.totalLogprob

  // Calculate normalized probability among siblings
  let normalizedProb = 1 // Default to 1 for single child
  if (parentChildren && parentChildren.length > 1) {
    const siblingProbs = parentChildren.map((child) => child.logprob)
    const maxProb = Math.max(...siblingProbs)
    const minProb = Math.min(...siblingProbs)
    if (maxProb > minProb) {
      normalizedProb = (probability - minProb) / (maxProb - minProb)
    }
  }

  const probabilityBg =
    depth === 0 ? '#f0f0f0' : getColorFromProbability(normalizedProb)
  const hasChildren = node.children.length > 0

  const isLeaf = node.token === '\n\n' && node.children.length === 0

  const formatProbability = (prob: number) => {
    if (decimalPlaces === -1) return prob.toString()
    return prob.toFixed(decimalPlaces) + 'ish'
  }

  const filteredChildren = (() => {
    switch (pathFilter) {
      case 'finished':
        return node.children.filter((child) => hasLeafDescendant(child))
      case 'top2':
        return node.children
          .slice()
          .sort((a, b) => b.logprob - a.logprob)
          .slice(0, 2)
      default:
        return node.children
    }
  })()

  return (
    <div
      style={{ marginLeft: `${indent}px` }}
      className={`pl-2 ${depth > 0 ? 'border-l border-gray-300' : ''}`}
    >
      <div
        style={{
          backgroundColor: isLeaf ? '#8f66f0' : probabilityBg,
        }}
        className={`px-2 py-1 my-0.5 border border-gray-300 rounded text-sm ${
          hasChildren ? 'cursor-pointer' : 'cursor-default'
        }`}
        onClick={() => hasChildren && setIsCollapsed(!isCollapsed)}
      >
        <div
          style={{
            color: isLeaf ? '#FFFFFF' : '#333',
          }}
          className="font-bold flex items-center"
        >
          {hasChildren && (
            <span className="mr-2 text-xs text-gray-500">
              {isCollapsed ? '▶' : '▼'}
            </span>
          )}

          {isLeaf ? '✅' : `Token: "${node.token}"`}

          <span
            style={{
              color: isLeaf ? '#E0E7FF' : '#666',
            }}
            className="ml-2 text-xs"
          >
            (probability: {formatProbability(probability)}, cumulative:{' '}
            {formatProbability(totalProbability)})
          </span>

          {hasChildren && (
            <span className="ml-2 text-[11px] text-gray-500">
              ({filteredChildren.length} children)
            </span>
          )}
        </div>

        <div
          style={{
            color: isLeaf ? '#F3F4F6' : '#555',
          }}
          className="text-xs mt-1 font-mono whitespace-pre-wrap pt-0.5"
        >
          "{isLeaf ? node.text.trim() : node.text}"
        </div>
      </div>
      <div
        className="grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out"
        style={{
          gridTemplateRows: isCollapsed ? '0fr' : '1fr',
          opacity: isCollapsed ? 0 : 1,
        }}
      >
        <div className="min-h-0">
          {filteredChildren.map((child, index) => (
            <TreeNodeComponent
              key={index}
              node={child}
              depth={depth + 1}
              parentChildren={filteredChildren}
              decimalPlaces={decimalPlaces}
              pathFilter={pathFilter}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
