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
  const indent = depth * 20
  const probability = node.logprob
  const totalProbability = node.totalLogprob

  // Calculate normalized probability among siblings
  let normalizedProb = 0.5 // Default neutral color
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
      style={{
        marginLeft: `${indent}px`,
        borderLeft: depth > 0 ? '1px solid #ccc' : 'none',
        paddingLeft: '8px',
      }}
    >
      <div
        style={{
          padding: '4px 8px',
          margin: '2px 0',
          backgroundColor: isLeaf ? '#8f66f0' : probabilityBg,
          border: '1px solid #ddd',
          borderRadius: '4px',
          fontSize: '14px',
          cursor: hasChildren ? 'pointer' : 'default',
        }}
        onClick={() => hasChildren && setIsCollapsed(!isCollapsed)}
      >
        <div
          style={{
            fontWeight: 'bold',
            color: isLeaf ? '#FFFFFF' : '#333',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {hasChildren && (
            <span
              style={{ marginRight: '8px', fontSize: '12px', color: '#888' }}
            >
              {isCollapsed ? '▶' : '▼'}
            </span>
          )}

          {isLeaf ? '✅' : `Token: "${node.token}"`}

          <span
            style={{
              marginLeft: '8px',
              fontSize: '12px',
              color: isLeaf ? '#E0E7FF' : '#666',
            }}
          >
            (probability: {formatProbability(probability)}, cumulative:{' '}
            {formatProbability(totalProbability)})
          </span>

          {hasChildren && (
            <span
              style={{ marginLeft: '8px', fontSize: '11px', color: '#888' }}
            >
              ({filteredChildren.length} children)
            </span>
          )}
        </div>

        <div
          style={{
            fontSize: '12px',
            color: isLeaf ? '#F3F4F6' : '#555',
            marginTop: '4px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            paddingTop: '2px',
          }}
        >
          "{isLeaf ? node.text.trim() : node.text}"
        </div>
      </div>
      <div
        style={{
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-out, opacity 0.3s ease-out',
          maxHeight: isCollapsed ? '0px' : '10000px',
          opacity: isCollapsed ? 0 : 1,
        }}
      >
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
  )
}
