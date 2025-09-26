import util from 'util'

export type TokenChoice = { token: string; logprob: number; tokenId?: number }
export interface Sampler {
  // Return alternatives for the *next* token given a text prefix
  sampleNext(
    prefix: string,
    opts: { topK?: number; temperature?: number }
  ): Promise<TokenChoice[]>
}

export class TokenTrieNode {
  token: string // token string for this node (empty on root)
  logprob: number // log P(token | prefix)
  totalLogprob: number // sum of logprobs from root to here
  text: string // full decoded text up to this node
  children: TokenTrieNode[] = [] // child nodes

  constructor(args: {
    token: string
    logprob: number
    parent?: TokenTrieNode
  }) {
    this.token = args.token
    this.logprob = args.logprob
    const parent = args.parent
    this.totalLogprob = parent ? parent.totalLogprob + args.logprob : 0
    this.text = parent ? parent.text + args.token : ''
  }
}

export async function buildTokenTree(
  sampler: Sampler,
  prompt: string,
  {
    /**
     * How many steps/layers we will expand. Each layer adds one token to the prefix.
     */
    maxDepth = 10,
    /**
     * How many branches to explore at each step, prioritised by highest probability. Also the rate of branching
     */
    topKPerStep = 5, // for Gemini you’ll typically cap at ≤50
    /**
     * cap the frontier to avoid explosion
     */
    beamWidth,
    /**
     * prune low-prob branches
     */
    minBranchProb,
    /**
     * stop expanding a node once the probability of its children exceeds this value
     */
    topPMass = 0.95,
    /**
     * Model temperature
     */
    temperature = 0.7,
    /**
     * Detect stop tokens and halt expansion of that branch.
     */
    stopIf, // supply your own stop condition
  }: {
    maxDepth?: number
    topKPerStep?: number
    beamWidth?: number
    minBranchProb?: number
    topPMass?: number
    temperature?: number
    stopIf: (text: string) => boolean
  }
) {
  const root = new TokenTrieNode({ token: '', logprob: 0, parent: undefined })
  root.text = prompt

  type FrontierItem = { node: TokenTrieNode; depth: number }
  let frontier: FrontierItem[] = [{ node: root, depth: 0 }]

  for (let depth = 0; depth < maxDepth; depth++) {
    console.log(`--- Processing Depth ${depth} ---`)

    // Expand current depth
    const nextFrontier: FrontierItem[] = []

    // Basic beam: keep highest-prob prefixes
    frontier.sort((a, b) => b.node.totalLogprob - a.node.totalLogprob)

    // frontier is every node we've accrued at this depth, which could explode as you go deeper
    // so we can cull branches which have become unlikely compared to the best ones
    if (
      typeof beamWidth === 'number' &&
      beamWidth > 0 &&
      frontier.length > beamWidth
    ) {
      frontier = frontier.slice(0, beamWidth)
    }

    await Promise.all(
      frontier.map(async ({ node }) => {
        // logNode(node);
        if (stopIf(node.text)) {
          return
        }

        const choices = await sampler.sampleNext(node.text, {
          topK: topKPerStep,
          temperature,
        })

        // Normalize to probs for pruning
        const probs = choices.map((c) => Math.exp(c.logprob))

        // Sort by prob descending
        const order = choices
          .map((c, i) => i)
          .sort((i, j) => probs[j] - probs[i])

        let mass = 0
        for (const i of order) {
          const c = choices[i]
          const p = probs[i]
          mass += p

          if (typeof minBranchProb === 'number' && p < minBranchProb) {
            // loop is sorted by probability so we can break early and filter remaining branches
            break
          }

          const child = new TokenTrieNode({
            token: c.token,
            logprob: c.logprob,
            parent: node,
          })
          node.children.push(child)

          // logNode(child);
          if (!stopIf(child.text)) {
            nextFrontier.push({ node: child, depth: depth + 1 })
          }

          if (typeof topPMass === 'number' && mass >= topPMass) {
            // again since this loop is sorted by probability, if the sum of probabilities so far exceeds a given value we can cull further branches
            break
          }
        }
      })
    )

    frontier = nextFrontier
    if (frontier.length === 0) {
      break
    }
  }

  return root
}

function logNode(node: TokenTrieNode) {
  console.log(
    'NODE TEXT',
    util.inspect(node.token, { showHidden: true, colors: false }),
    util.inspect(node.text, { showHidden: true, colors: false })
  )
}
