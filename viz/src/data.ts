export interface TreeNode {
  token: string;
  logprob: number;
  totalLogprob: number;
  text: string;
  children: TreeNode[];
}

import ingredientForSoup from "../../outputs/token-tree--a-great-ingredient-to-put-in-soup-is.json";
import capitalOfFrance from "../../outputs/token-tree--the-capital-of-france-is.json";
import meaningOfLife from "../../outputs/token-tree--the-meaning-of-life-is.json";

export const data: { title: string, tree: TreeNode }[] = [
  { title: "A great ingredient to put in soup", tree: ingredientForSoup },
  { title: "The capital of France", tree: capitalOfFrance },
  { title: "The meaning of life", tree: meaningOfLife },
]
