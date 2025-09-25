import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Sampler, TokenChoice } from "./token-tree.ts";

export class GeminiSampler implements Sampler {
  private model;
  constructor(apiKey: string, modelName: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: modelName });
  }

  async sampleNext(prefix: string, opts: { topK?: number; temperature?: number }): Promise<TokenChoice[]> {
    const { topK = 5, temperature = 0.7 } = opts;

    // We ask Gemini to produce exactly 1 token and include logprobs (top-K).
    const resp = await this.model.generateContent({
      contents: [{ role: "user", parts: [{ text: prefix }] }],
      generationConfig: {
        maxOutputTokens: 1,
        temperature,
        // The following two flags are the key bits; depending on SDK version:
        responseLogprobs: true,
        logprobs: topK,  // or `topK` / `top_k` depending on surface
      } ,
    });

    // ---- Extract top-K alternatives
    // NOTE: Depending on SDK version these may appear at:
    // resp.response.candidates[0].content.parts[0].logprobs.topCandidates
    // or .topTokens, or resp.response.candidates[0].logprobsResult.topCandidates
    // Inspect your response once and tweak here.
    const cand = resp.response?.candidates?.[0];
    const parts = cand?.content?.parts ?? [];
    const part = parts[0] ?? {};
    const alt =
      (part as any).logprobs?.topCandidates ??
      (part as any).topTokens ??
      [];

    // Fallback: if alternatives absent, at least return the chosen token.
    const chosenToken = (part as any).text ?? "";
    const chosenLogprob =
      (part as any).logprobs?.chosenToken?.logprob ??
      (cand as any).logprobs?.chosenToken?.logprob ??
      Math.log(1e-9);

    if (Array.isArray(alt) && alt.length > 0) {
      // Map the top-K list into our TokenChoice[]
      // Common shapes: [{token:{text:"…"}, logprob:-1.23}, ...]
      const choices: TokenChoice[] = alt.map((t: any) => {
        const tokenText = t?.token?.text ?? t?.token ?? t?.bytes ?? "";
        const lp = typeof t?.logprob === "number" ? t.logprob : Math.log(1e-9);
        return { token: tokenText, logprob: lp };
      });

      // Make sure the chosen token is present (some SDKs already include it)
      if (!choices.find(c => c.token === chosenToken)) {
        choices.unshift({ token: chosenToken, logprob: chosenLogprob });
      }

      return choices.slice(0, topK);
    }

    // If no alternatives, return the chosen one so the tree can still proceed.
    return [{ token: chosenToken, logprob: chosenLogprob }];
  }
}
