import { Router, Request, Response } from 'express';
import { rateLimiter } from '../middleware/rateLimiter.ts';
import {
  generateSqlService,
  explainSqlService,
  debugSqlService,
  optimizeSqlService,
  generatePracticeQuestionService,
  evaluatePracticeAnswerService,
  SqlDialect,
} from '../services/sqlGeminiService.ts';

export const sqlRouter = Router();

const VALID_DIALECTS: SqlDialect[] = [
  'PostgreSQL',
  'MySQL',
  'SQLite',
  'SQL Server',
  'Oracle',
];

const MAX_INPUT_CHARS = 12000;

function validateDialect(dialect: unknown): SqlDialect {
  if (typeof dialect === 'string' && VALID_DIALECTS.includes(dialect as SqlDialect)) {
    return dialect as SqlDialect;
  }
  return 'PostgreSQL';
}

/**
 * GET /api/sql/health
 */
sqlRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'AI SQL Assistant Gateway',
    supportedDialects: VALID_DIALECTS,
    rateLimit: '15 requests/minute',
    timestamp: Date.now(),
  });
});

/**
 * POST /api/sql/generate
 * Natural language to SQL
 */
sqlRouter.post('/generate', rateLimiter, async (req: Request, res: Response) => {
  try {
    const { prompt, dialect, schemaContext } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({
        success: false,
        error: 'Please describe the query you want to generate.',
      });
      return;
    }

    if (prompt.length > MAX_INPUT_CHARS) {
      res.status(400).json({
        success: false,
        error: `Input is too long (${prompt.length} chars). Maximum allowed is ${MAX_INPUT_CHARS} chars.`,
      });
      return;
    }

    const cleanDialect = validateDialect(dialect);
    const result = await generateSqlService({
      prompt: prompt.trim(),
      dialect: cleanDialect,
      schemaContext: typeof schemaContext === 'string' ? schemaContext.trim() : undefined,
    });

    res.json({
      success: true,
      ...result,
      dialect: cleanDialect,
    });
  } catch (error: unknown) {
    console.error('[POST /api/sql/generate Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to generate SQL right now. Please verify your query description and try again.',
    });
  }
});

/**
 * POST /api/sql/explain
 * Detailed SQL query explanation
 */
sqlRouter.post('/explain', rateLimiter, async (req: Request, res: Response) => {
  try {
    const { sql, dialect } = req.body || {};

    if (!sql || typeof sql !== 'string' || !sql.trim()) {
      res.status(400).json({
        success: false,
        error: 'Please provide a SQL query to explain.',
      });
      return;
    }

    if (sql.length > MAX_INPUT_CHARS) {
      res.status(400).json({
        success: false,
        error: 'SQL input exceeds maximum character limit.',
      });
      return;
    }

    const cleanDialect = validateDialect(dialect);
    const result = await explainSqlService({
      sql: sql.trim(),
      dialect: cleanDialect,
    });

    res.json({
      success: true,
      ...result,
      dialect: cleanDialect,
    });
  } catch (error: unknown) {
    console.error('[POST /api/sql/explain Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to explain SQL query right now. Please try again.',
    });
  }
});

/**
 * POST /api/sql/debug
 * Debug and fix SQL errors
 */
sqlRouter.post('/debug', rateLimiter, async (req: Request, res: Response) => {
  try {
    const { sql, errorMessage, dialect } = req.body || {};

    if (!sql || typeof sql !== 'string' || !sql.trim()) {
      res.status(400).json({
        success: false,
        error: 'Please provide a SQL query to debug.',
      });
      return;
    }

    const cleanDialect = validateDialect(dialect);
    const result = await debugSqlService({
      sql: sql.trim(),
      errorMessage: typeof errorMessage === 'string' ? errorMessage.trim() : undefined,
      dialect: cleanDialect,
    });

    res.json({
      success: true,
      ...result,
      dialect: cleanDialect,
    });
  } catch (error: unknown) {
    console.error('[POST /api/sql/debug Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to debug SQL query right now. Please try again.',
    });
  }
});

/**
 * POST /api/sql/optimize
 * Performance analysis and index recommendations
 */
sqlRouter.post('/optimize', rateLimiter, async (req: Request, res: Response) => {
  try {
    const { sql, dialect, context } = req.body || {};

    if (!sql || typeof sql !== 'string' || !sql.trim()) {
      res.status(400).json({
        success: false,
        error: 'Please provide a SQL query to optimize.',
      });
      return;
    }

    const cleanDialect = validateDialect(dialect);
    const result = await optimizeSqlService({
      sql: sql.trim(),
      dialect: cleanDialect,
      context: typeof context === 'string' ? context.trim() : undefined,
    });

    res.json({
      success: true,
      ...result,
      dialect: cleanDialect,
    });
  } catch (error: unknown) {
    console.error('[POST /api/sql/optimize Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to optimize SQL query right now. Please try again.',
    });
  }
});

/**
 * POST /api/sql/practice-generate
 * Generate practice challenges
 */
sqlRouter.post('/practice-generate', rateLimiter, async (req: Request, res: Response) => {
  try {
    const { difficulty, category, dialect } = req.body || {};
    const validLevels = ['Beginner', 'Intermediate', 'Advanced'];
    const cleanDifficulty = validLevels.includes(difficulty) ? difficulty : 'Beginner';
    const cleanDialect = validateDialect(dialect);

    const result = await generatePracticeQuestionService({
      difficulty: cleanDifficulty as 'Beginner' | 'Intermediate' | 'Advanced',
      category: typeof category === 'string' ? category : undefined,
      dialect: cleanDialect,
    });

    res.json({
      success: true,
      question: result,
    });
  } catch (error: unknown) {
    console.error('[POST /api/sql/practice-generate Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to generate practice question right now.',
    });
  }
});

/**
 * POST /api/sql/practice-evaluate
 * Evaluate user's SQL submission
 */
sqlRouter.post('/practice-evaluate', rateLimiter, async (req: Request, res: Response) => {
  try {
    const { problem, schemaDescription, userSql, dialect } = req.body || {};

    if (!userSql || typeof userSql !== 'string' || !userSql.trim()) {
      res.status(400).json({
        success: false,
        error: 'Please write your SQL solution before submitting.',
      });
      return;
    }

    const cleanDialect = validateDialect(dialect);
    const result = await evaluatePracticeAnswerService({
      problem: String(problem || ''),
      schemaDescription: String(schemaDescription || ''),
      userSql: userSql.trim(),
      dialect: cleanDialect,
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    console.error('[POST /api/sql/practice-evaluate Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to evaluate SQL solution right now. Please try again.',
    });
  }
});
