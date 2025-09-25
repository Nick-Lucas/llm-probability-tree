import { request } from "undici";
import type { Sampler, TokenChoice } from "./token-tree.js";

export class LlamaServerSampler implements Sampler {
  private baseUrl: string;

  constructor(baseUrl = "http://127.0.0.1:8080") {
    this.baseUrl = baseUrl
  }

  async sampleNext(prefix: string, opts: { topK?: number; temperature?: number }): Promise<TokenChoice[]> {
    const { topK = 200, temperature = 0.7 } = opts;

    // llama.cpp server /completion API; request 1 token and top-K probs
    const body = {
      prompt: prefix,
      n_predict: 1,
      temperature,
      n_probs: topK,        // ask server to return top-K for the next token
      // stop: ["</s>"],    // optional stop tokens
      // cache_prompt: true // reuses kv cache across calls for speed
    };

    const { body: resBody } = await request(`${this.baseUrl}/completion`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    });

    const json = await resBody.json() as any;

    // Typical shape: json.tokens[0].top_logprobs or json.top_probs[0]
    // Adjust if your build names fields differently.
    const top = json?.completion_probabilities?.[0]?.top_logprobs
             ?? json?.tokens?.[0]?.top_logprobs
             ?? json?.top_probs?.[0]
             ?? [];

    if (!Array.isArray(top) || top.length === 0) {
      // Fallback to the produced token if server didn’t include probs
      const tok = json?.content ?? json?.completion ?? "";
      return [{ token: tok, logprob: Math.log(1e-9) }];
    }

    const choices: TokenChoice[] = top.map((t: any) => {
      // Common fields: { token: " the", logprob: -0.23, id?: number }
      const token = t?.token ?? t?.text ?? "";
      const logprob = typeof t?.logprob === "number" ? t.logprob : Math.log(1e-9);
      const tokenId = typeof t?.id === "number" ? t.id : undefined;
      return { token, logprob, tokenId };
    });

    return choices.slice(0, topK);
  }
}
