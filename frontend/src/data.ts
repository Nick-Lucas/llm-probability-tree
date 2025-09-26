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
import ingredientForSoup1 from '../../outputs/token-tree--a-great-ingredient-to-put-in-soup-is.json'
import ingredientForSoup2 from '../../outputs/token-tree--a-great-ingredient-to-put-in-soup-is-a-little-bit-of.json'
import ingredientForSoup3 from '../../outputs/token-tree--a-good-ingredient-to-put-in-soup-is-a-little-bit-of.json'
import meaningOfLife1 from '../../outputs/token-tree--the-meaning-of-life-is.json'
import meaningOfLife2 from '../../outputs/token-tree--the-meaning-of-life-is-a-question-humans-have.json'

export const data: { title: string; result: SamplerResult }[] = [
  { title: 'The capital of France', result: capitalOfFrance1 },
  { title: 'The capital of France is', result: capitalOfFrance2 },
  { title: 'The capital of France is Paris', result: capitalOfFrance3 },
  { title: 'A great ingredient to put in soup is', result: ingredientForSoup1 },
  {
    title: 'A great ingredient to put in soup is a little bit of',
    result: ingredientForSoup2,
  },
  {
    title: 'A good ingredient to put in soup is a little bit of',
    result: ingredientForSoup3,
  },
  { title: 'The meaning of life', result: meaningOfLife1 },
  {
    title: 'The meaning of life is a question humans have',
    result: meaningOfLife2,
  },
]
