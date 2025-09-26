export interface TreeNode {
  token: string
  logprob: number
  totalLogprob: number
  text: string
  children: TreeNode[]
}

export interface SamplerResult {
  maxDepth: number
  topKPerStep: number
  temperature: number
  prompt: string
  tree: TreeNode
}

import capitalOfFrance1 from '../../outputs/token-tree--the-capital-of-france.json'
import capitalOfFrance2 from '../../outputs/token-tree--the-capital-of-france-is.json'
import capitalOfFrance3 from '../../outputs/token-tree--the-capital-of-france-is-paris.json'
import ingredientForSoup from '../../outputs/token-tree--a-great-ingredient-to-put-in-soup-is.json'
import meaningOfLife from '../../outputs/token-tree--the-meaning-of-life-is.json'

export const data: { title: string; result: SamplerResult }[] = [
  { title: 'The capital of France', result: capitalOfFrance1 },
  { title: 'The capital of France is', result: capitalOfFrance2 },
  { title: 'The capital of France is Paris', result: capitalOfFrance3 },
  { title: 'A great ingredient to put in soup', result: ingredientForSoup },
  { title: 'The meaning of life', result: meaningOfLife },
]
