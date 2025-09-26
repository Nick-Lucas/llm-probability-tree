// index.ts
import { buildTokenTree, TokenTrieNode } from './token-tree.ts'
import { LlamaServerSampler } from './llama-sampler.ts'
import { writeFileSync } from 'fs'

async function execute(prompt: string) {
  console.log(`\n=== Generating token tree for prompt: "${prompt}" ===\n`)

  const sampler = new LlamaServerSampler('http://127.0.0.1:8080')

  // maxDepth^topKPerStep predicts the number of API calls
  // Start around maxDepth=4 when experimenting because it's fast and 5/6 are expontentially slower
  const maxDepth = 6
  const topKPerStep = 5
  const temperature = 0

  const tree = await buildTokenTree(sampler, prompt, {
    maxDepth,
    topKPerStep,

    // Temperature won't really matter since we're exploring all trees
    // and so reshaping probabilities won't change outcomes, 0 should
    // yield the most "real" probability values
    temperature,
    stopIf: (text) => !text || text.endsWith('\n\n') || text.length > 500, // example
  })

  const json = JSON.stringify(
    {
      maxDepth,
      topKPerStep,
      temperature,
      prompt,
      tree,
    },
    null,
    2
  )
  console.log(json)
  writeFileSync(
    `./outputs/token-tree--${prompt.replace(/ /g, '-').toLowerCase()}.json`,
    json
  )
}

await execute('The capital of france')
await execute('The capital of france is Paris')
await execute('The meaning of life is')
await execute('A great ingredient to put in soup is')
