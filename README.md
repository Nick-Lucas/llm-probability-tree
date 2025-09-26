# LLM Probability Tree

LLMs are probabilistic models which generate a completion to a give prompt, we orchestrate this by measuring probabilities of each "next token" and then deciding which token we use (which might not be the most probable one) to continue the completion. This project is a tool to explore the possible outputs of an LLM, by default gemma3 on llama-server, and store the results for exploration via the frontend.

[Explore the Trees I've already committed](https://llm-probability-tree.me-62f.workers.dev/)

## Prerequisites

* nodejs 24+
* pnpm
* [llama-server](https://github.com/ggml-org/llama.cpp)

## Running locally

```sh
# Start llama server with gemma (or another LLM you like, though you might need to customise stopIf in src/tree/exec.ts with appropriate stop tokens)
# Installation: https://github.com/ggml-org/llama.cpp
llama-server -hf ggml-org/gemma-3-1b-it-GGUF

# Install node modules
pnpm install

# Edit src/tree/exec.ts to customise prompts

# Run sampling
pnpm sampler

# Files will output as ./token-tree-$PROMPT.json
# Add your new files to frontend/src/data.ts to display in the frontend

# You can view your tree from the frontend
pnpm frontend
```
