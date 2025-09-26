export interface TreeNode {
  token: string;
  logprob: number;
  totalLogprob: number;
  text: string;
  children: TreeNode[];
}

export interface SamplerResult {
  maxDepth: number;
  topKPerStep: number;
  temperature: number;
  prompt: string;
  tree: TreeNode;
}

import ingredientForSoup from "../../outputs/token-tree--a-great-ingredient-to-put-in-soup-is.json";
import capitalOfFrance from "../../outputs/token-tree--the-capital-of-france-is.json";
import meaningOfLife from "../../outputs/token-tree--the-meaning-of-life-is.json";

export const data: { title: string; result: SamplerResult }[] = [
  { title: "A great ingredient to put in soup", result: ingredientForSoup },
  { title: "The capital of France", result: capitalOfFrance },
  { title: "The meaning of life", result: meaningOfLife },
];
