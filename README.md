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
