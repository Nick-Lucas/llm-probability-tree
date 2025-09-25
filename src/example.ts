import { generateWithProbabilities } from './gemini-probabilities.ts';

async function runExample(): Promise<void> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    console.error('Please set the GOOGLE_API_KEY environment variable');
    process.exit(1);
  }

  try {
    const inputText = "What is the capital of France?";
    console.log(`Input: ${inputText}\n`);

    const result = await generateWithProbabilities(inputText, apiKey);

    console.log(`Output: ${result.outputText}\n`);
    console.log('Probability Tree:');
    console.log(JSON.stringify(result.probabilityTree, null, 2));

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
  }
}

runExample();