import { GoogleGenerativeAI, GenerativeModel, type GenerateContentResult } from '@google/generative-ai';

interface TokenCandidate {
  token: string;
  logProbability: number;
  probability: number;
}

interface ProbabilityStep {
  step: number;
  candidates: TokenCandidate[];
}

interface GenerationResult {
  outputText: string;
  probabilityTree: ProbabilityStep[];
}

export async function generateWithProbabilities(inputText: string, apiKey: string): Promise<GenerationResult> {
  if (!apiKey) {
    throw new Error('API key is required');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model: GenerativeModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const generationConfig = {
    responseLogprobs: true,
    logprobs: 5,
  };

  try {
    const result: GenerateContentResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: inputText }] }],
      generationConfig,
    });

    const response = result.response;
    const text = response.text();
    const logprobs = response.candidates?.[0]?.logprobsResult;

    const probabilityTree = buildProbabilityTree(logprobs);

    return {
      outputText: text,
      probabilityTree: probabilityTree
    };

  } catch (error) {
    throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function buildProbabilityTree(logprobs: any): ProbabilityStep[] {
  if (!logprobs || !logprobs.topCandidates) {
    return [];
  }

  const tree: ProbabilityStep[] = [];

  logprobs.topCandidates.forEach((step: any, stepIndex: number) => {
    const stepNode: ProbabilityStep = {
      step: stepIndex,
      candidates: []
    };

    if (step.candidates) {
      step.candidates.forEach((candidate: any) => {
        stepNode.candidates.push({
          token: candidate.token,
          logProbability: candidate.logProbability,
          probability: Math.exp(candidate.logProbability)
        });
      });
    }

    tree.push(stepNode);
  });

  return tree;
}
