// index.ts
import { buildTokenTree } from "./token-tree.ts";
// Choose ONE:
import { GeminiSampler } from "./gemini-sampler.ts";
// import { LlamaServerSampler } from "./llama-sampler.ts";

async function main() {
  const prompt = "The capital of france is";

  // --- pick a sampler
  const sampler = new GeminiSampler(process.env.GOOGLE_API_KEY!, "gemini-2.5-flash");
  // const sampler = new LlamaServerSampler("http://127.0.0.1:8080");

  const root = await buildTokenTree(sampler, prompt, {
    maxDepth: 8,
    topKPerStep: 5,
    beamWidth: 200,
    minBranchProb: 1e-5,
    topPMass: 0.97,
    temperature: 0.7,
    stopIf: (text) => text.endsWith("\n\n") || text.length > 500, // example
  });

  // Walk the tree (example: print best leaves)
  function* leaves(node: any): any {
    if (node.children.size === 0) yield node;
    for (const child of node.children.values()) yield* leaves(child);
  }
  const allLeaves = [...leaves(root)].sort((a, b) => b.cumLogprob - a.cumLogprob);
  for (const leaf of allLeaves.slice(0, 5)) {
    console.log("—".repeat(40));
    console.log(leaf.text);
    console.log("logP:", leaf.cumLogprob.toFixed(2));
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
