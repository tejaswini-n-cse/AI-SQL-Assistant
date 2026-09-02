import { Router, Request, Response } from 'express';
import { rateLimiter } from '../middleware/rateLimiter.ts';
import { executeGeminiOperation, VALID_OPERATIONS, SupportedOperation } from '../services/geminiService.ts';

export const geminiRouter = Router();

const MAX_INPUT_LENGTH = 10000;

// Health and metadata route
geminiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    supportedOperations: VALID_OPERATIONS,
    rateLimit: '15 requests/minute',
    secured: true,
  });
});

// Primary POST /api/gemini endpoint
geminiRouter.post('/', rateLimiter, async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // 1. Validate request body exists
    if (!body || typeof body !== 'object') {
      res.status(400).json({
        success: false,
        error: 'Invalid request payload. Expected a JSON object.',
      });
      return;
    }

    const { input, operation, language, context } = body;

    // 2. Validate user input is a string
    if (typeof input !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Invalid input. Input field must be a text string.',
      });
      return;
    }

    const trimmedInput = input.trim();

    // 3. Validate input is not empty
    if (!trimmedInput) {
      res.status(400).json({
        success: false,
        error: 'Input prompt or code cannot be empty.',
      });
      return;
    }

    // 4. Validate input has a reasonable maximum length
    if (trimmedInput.length > MAX_INPUT_LENGTH) {
      res.status(400).json({
        success: false,
        error: `Input is too long (${trimmedInput.length} characters). Maximum allowed length is ${MAX_INPUT_LENGTH} characters.`,
      });
      return;
    }

    // 5. Validate operation is one of the supported operations
    if (!operation || typeof operation !== 'string') {
      res.status(400).json({
        success: false,
        error: `Operation is required. Supported operations: ${VALID_OPERATIONS.join(', ')}`,
      });
      return;
    }

    const normalizedOperation = operation.toLowerCase() as SupportedOperation;

    if (!VALID_OPERATIONS.includes(normalizedOperation)) {
      res.status(400).json({
        success: false,
        error: `Unsupported operation "${operation}". Supported operations are: ${VALID_OPERATIONS.join(', ')}`,
      });
      return;
    }

    // Sanitize optional fields
    const sanitizedLanguage = typeof language === 'string' ? language.slice(0, 50).trim() : undefined;
    const sanitizedContext = typeof context === 'string' ? context.slice(0, 4000).trim() : undefined;

    // 6. Execute Gemini service
    const startTime = Date.now();
    const result = await executeGeminiOperation({
      operation: normalizedOperation,
      input: trimmedInput,
      language: sanitizedLanguage,
      context: sanitizedContext,
    });
    const durationMs = Date.now() - startTime;

    // 7. Return safe, structured result
    res.json({
      success: true,
      result,
      operation: normalizedOperation,
      language: sanitizedLanguage || 'plaintext',
      executionTimeMs: durationMs,
      timestamp: Date.now(),
    });
  } catch (error: unknown) {
    // Log detailed diagnostics strictly on the server
    console.error('[POST /api/gemini Server Error]:', error);

    // Provide a safe, friendly client response without leaking keys or stack traces
    res.status(500).json({
      success: false,
      error: 'Unable to process your request right now. Please try again.',
    });
  }
});
