// index.ts
import { buildTokenTree, TokenTrieNode } from "./token-tree.ts";
import { LlamaServerSampler } from "./llama-sampler.ts";
import { writeFileSync } from "fs";

async function execute(prompt: string) {
  console.log(`\n=== Generating token tree for prompt: "${prompt}" ===\n`);

  const sampler = new LlamaServerSampler("http://127.0.0.1:8080");

  const root = await buildTokenTree(sampler, prompt, {
    // maxDepth^topKPerStep predicts the number of API calls
    maxDepth: 4,
    topKPerStep: 5,

    // Temperature won't really matter since we're exploring all trees 
    // and so reshaping probabilities won't change outcomes, 0 should 
    // yield the most "real" probability values
    temperature: 0,
    stopIf: (text) => !text || text.endsWith("\n\n") || text.length > 500, // example
  });

  const json = JSON.stringify(root, null, 2)
  console.log(json);
  writeFileSync(`./outputs/token-tree--${prompt.replace(/ /g, "-").toLowerCase()}.json`, json);
}

await execute("The capital of france is");
await execute("The meaning of life is");
await execute("A great ingredient to put in soup is");
