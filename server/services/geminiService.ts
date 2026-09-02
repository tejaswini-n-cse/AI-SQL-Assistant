import { GoogleGenAI } from '@google/genai';

export type SupportedOperation = 'generate' | 'explain' | 'debug' | 'optimize' | 'practice';

export const VALID_OPERATIONS: SupportedOperation[] = [
  'generate',
  'explain',
  'debug',
  'optimize',
  'practice',
];

export interface GeminiProcessOptions {
  operation: SupportedOperation;
  input: string;
  language?: string;
  context?: string;
}

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[GeminiService] Warning: GEMINI_API_KEY environment variable is not defined.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_PROMPT = `You are a high-caliber software engineering assistant and code intelligence engine.
You are accessible exclusively through a secure server-side API proxy gateway.
Provide clear, precise, well-structured, production-ready outputs in Markdown.
Whenever providing code, use proper syntax-highlighted code blocks (e.g. \`\`\`typescript ... \`\`\`).
Keep responses focused, rigorous, and directly helpful without fluff or promotional filler.`;

function buildOperationPrompt(operation: SupportedOperation, input: string, language?: string, context?: string): string {
  const langContext = language ? `Target Programming Language / Syntax: ${language}\n` : '';
  const extraContext = context ? `Additional Architectural / Schema Context:\n${context}\n` : '';

  switch (operation) {
    case 'generate':
      return `${langContext}${extraContext}Task: GENERATE SOLUTION
User Requirement:
${input}

Please generate the complete, clean, idiomatic solution. Include concise architectural notes, explanations of key decisions, and usage examples where relevant.`;

    case 'explain':
      return `${langContext}${extraContext}Task: EXPLAIN CODE & ARCHITECTURE
Input Code / Query:
${input}

Please provide a structured, step-by-step breakdown explaining:
1. High-level purpose and architectural pattern.
2. Step-by-step walk-through of each component/clause.
3. Edge-case handling and time/space characteristics.`;

    case 'debug':
      return `${langContext}${extraContext}Task: DEBUG & FIX DEFECTS
Code with suspected defects or error output:
${input}

Please:
1. Identify all bugs, runtime risks, type defects, or logic oversights.
2. Clearly explain why each defect occurs.
3. Provide the corrected, hardened code with fixes applied.`;

    case 'optimize':
      return `${langContext}${extraContext}Task: OPTIMIZE & REFACTOR
Input Code / Query to Optimize:
${input}

Please:
1. Analyze current performance bottlenecks (time complexity, memory allocations, database roundtrips, or indexing opportunities).
2. Provide the optimized refactor.
3. Quantify expected performance and maintainability gains.`;

    case 'practice':
      return `${langContext}${extraContext}Task: PRACTICE & KNOWLEDGE EVALUATION
Topic / Skill Domain:
${input}

Please generate an interactive engineering challenge or quiz:
1. Scenario / Problem Statement with realistic constraints.
2. Specific test cases or acceptance criteria.
3. Step-by-step solution blueprint (with spoiler tags or clear separation) to self-test.`;

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
}

export async function executeGeminiOperation(options: GeminiProcessOptions): Promise<string> {
  const { operation, input, language, context } = options;

  if (!VALID_OPERATIONS.includes(operation)) {
    throw new Error(`Invalid operation: ${operation}`);
  }

  const ai = getAiClient();
  const prompt = buildOperationPrompt(operation, input, language, context);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Empty response received from model.');
    }

    return resultText;
  } catch (err: unknown) {
    // Log the full diagnostic details strictly on the server
    console.error('[GeminiService Error]:', err instanceof Error ? err.message : err);
    
    // Throw a sanitized generic error to be caught by the route handler
    throw new Error('Failed to process Gemini request on server.');
  }
}
