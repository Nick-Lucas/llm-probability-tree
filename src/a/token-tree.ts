export type TokenChoice = { token: string; logprob: number; tokenId?: number };
export interface Sampler {
  // Return alternatives for the *next* token given a text prefix
  sampleNext(prefix: string, opts: { topK?: number; temperature?: number }): Promise<TokenChoice[]>;
}

export class TokenTrieNode {
  token: string;                 // token string for this node (empty on root)
  logprob: number;               // log P(token | prefix)
  cumLogprob: number;            // sum of logprobs from root to here
  text: string;                  // full decoded text up to this node
  children: Map<string, TokenTrieNode> = new Map();

  constructor(args: { token: string; logprob: number; parent?: TokenTrieNode }) {
    this.token = args.token;
    this.logprob = args.logprob;
    const parent = args.parent;
    this.cumLogprob = parent ? parent.cumLogprob + args.logprob : 0;
    this.text = parent ? (parent.text + args.token) : "";
  }
}

export async function buildTokenTree(
  sampler: Sampler,
  prompt: string,
  {
    maxDepth = 10,
    topKPerStep = 5,       // for Gemini you’ll typically cap at ≤50
    beamWidth = 100,        // cap the frontier to avoid explosion
    minBranchProb = 1e-4,   // prune low-prob branches
    topPMass = 0.95,        // stop expanding a node once cumulative mass hits this
    temperature = 0.7,
    stopIf = (text: string) => false, // supply your own stop condition
  }: {
    maxDepth?: number;
    topKPerStep?: number;
    beamWidth?: number;
    minBranchProb?: number;
    topPMass?: number;
    temperature?: number;
    stopIf?: (text: string) => boolean;
  }
) {
  const root = new TokenTrieNode({ token: "", logprob: 0, parent: undefined });
  root.text = prompt;

  type FrontierItem = { node: TokenTrieNode; depth: number };
  let frontier: FrontierItem[] = [{ node: root, depth: 0 }];

  for (let depth = 0; depth < maxDepth; depth++) {
    // Expand current depth
    const nextFrontier: FrontierItem[] = [];

    // Basic beam: keep highest-prob prefixes
    frontier.sort((a, b) => b.node.cumLogprob - a.node.cumLogprob);
    frontier = frontier.slice(0, beamWidth);

    await Promise.all(
      frontier.map(async ({ node }) => {
        if (stopIf(node.text)) return;

        const choices = await sampler.sampleNext(node.text, { topK: topKPerStep, temperature });

        // Normalize to probs for pruning
        const probs = choices.map(c => Math.exp(c.logprob));
        // Sort by prob descending
        const order = choices.map((c, i) => i).sort((i, j) => probs[j] - probs[i]);

        let mass = 0;
        for (const i of order) {
          const c = choices[i];
          const p = probs[i];
          mass += p;

          if (p < minBranchProb) break;

          const child = new TokenTrieNode({ token: c.token, logprob: c.logprob, parent: node });
          node.children.set(c.token, child);

          if (!stopIf(child.text)) {
            nextFrontier.push({ node: child, depth: depth + 1 });
          }

          if (mass >= topPMass) break; // top-p style pruning
        }
      })
    );

    frontier = nextFrontier;
    if (frontier.length === 0) break;
  }

  return root;
}
