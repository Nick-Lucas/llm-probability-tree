```sh
# Start llama server with gemma (or another LLM you like)
# Installation: https://github.com/ggml-org/llama.cpp
llama-server -hf ggml-org/gemma-3-1b-it-GGUF

# Install node modules
pnpm install

# Edit src/tree/exec.ts to customise output/prompt

# Run sampling
pnpm sampler

# Files will output as ./token-tree-$PROMPT.json
```
