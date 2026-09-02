import {
  SqlDialect,
  SqlGenerateResponse,
  SqlExplainResponse,
  SqlDebugResponse,
  SqlOptimizeResponse,
  PracticeQuestion,
  PracticeEvaluationResponse,
} from '../types.ts';

export interface RateLimitStatus {
  limit: number;
  remaining: number;
  resetSeconds: number;
}

function parseRateLimits(response: Response): RateLimitStatus | null {
  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');

  if (limit !== null && remaining !== null) {
    return {
      limit: parseInt(limit, 10) || 15,
      remaining: parseInt(remaining, 10) || 0,
      resetSeconds: parseInt(reset || '0', 10),
    };
  }
  return null;
}

/**
 * 1. Generate SQL from Natural Language
 */
export async function apiGenerateSql(
  prompt: string,
  dialect: SqlDialect,
  schemaContext?: string,
  onRateLimit?: (r: RateLimitStatus) => void
): Promise<SqlGenerateResponse> {
  const res = await fetch('/api/sql/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, dialect, schemaContext }),
  });

  const rateInfo = parseRateLimits(res);
  if (rateInfo && onRateLimit) onRateLimit(rateInfo);

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to generate SQL query.');
  }

  return {
    sql: data.sql,
    dialect: data.dialect,
    explanation: data.explanation,
    assumedSchema: data.assumedSchema || [],
    tips: data.tips || [],
  };
}

/**
 * 2. Explain SQL Query
 */
export async function apiExplainSql(
  sql: string,
  dialect: SqlDialect,
  onRateLimit?: (r: RateLimitStatus) => void
): Promise<SqlExplainResponse> {
  const res = await fetch('/api/sql/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, dialect }),
  });

  const rateInfo = parseRateLimits(res);
  if (rateInfo && onRateLimit) onRateLimit(rateInfo);

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to explain SQL query.');
  }

  return {
    summary: data.summary,
    dialect: data.dialect,
    clauses: data.clauses || [],
    keyConcepts: data.keyConcepts || [],
    logicalExecutionOrder: data.logicalExecutionOrder || [],
    complexityAssessment: data.complexityAssessment,
  };
}

/**
 * 3. Debug SQL Query
 */
export async function apiDebugSql(
  sql: string,
  errorMessage: string | undefined,
  dialect: SqlDialect,
  onRateLimit?: (r: RateLimitStatus) => void
): Promise<SqlDebugResponse> {
  const res = await fetch('/api/sql/debug', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, errorMessage, dialect }),
  });

  const rateInfo = parseRateLimits(res);
  if (rateInfo && onRateLimit) onRateLimit(rateInfo);

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to debug SQL query.');
  }

  return {
    hasErrors: data.hasErrors ?? true,
    problem: data.problem,
    whyItHappens: data.whyItHappens,
    correctedSql: data.correctedSql,
    explanation: data.explanation,
    preventionTips: data.preventionTips || [],
  };
}

/**
 * 4. Optimize SQL Query
 */
export async function apiOptimizeSql(
  sql: string,
  dialect: SqlDialect,
  context?: string,
  onRateLimit?: (r: RateLimitStatus) => void
): Promise<SqlOptimizeResponse> {
  const res = await fetch('/api/sql/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql, dialect, context }),
  });

  const rateInfo = parseRateLimits(res);
  if (rateInfo && onRateLimit) onRateLimit(rateInfo);

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to optimize SQL query.');
  }

  return {
    bottlenecks: data.bottlenecks || [],
    optimizedSql: data.optimizedSql,
    structuralImprovements: data.structuralImprovements || [],
    recommendedIndexes: data.recommendedIndexes || [],
    unnecessaryOperations: data.unnecessaryOperations || [],
    alternativeApproaches: data.alternativeApproaches || [],
    disclaimer: data.disclaimer || 'Optimization results depend on database engine and indexing.',
  };
}

/**
 * 5. Generate Practice Question
 */
export async function apiGeneratePracticeQuestion(
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
  category: string,
  dialect: SqlDialect,
  onRateLimit?: (r: RateLimitStatus) => void
): Promise<PracticeQuestion> {
  const res = await fetch('/api/sql/practice-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ difficulty, category, dialect }),
  });

  const rateInfo = parseRateLimits(res);
  if (rateInfo && onRateLimit) onRateLimit(rateInfo);

  const data = await res.json();
  if (!res.ok || !data.success || !data.question) {
    throw new Error(data.error || 'Failed to generate practice challenge.');
  }

  return data.question;
}

/**
 * 6. Evaluate Practice Solution
 */
export async function apiEvaluatePracticeAnswer(
  problem: string,
  schemaDescription: string,
  userSql: string,
  dialect: SqlDialect,
  onRateLimit?: (r: RateLimitStatus) => void
): Promise<PracticeEvaluationResponse> {
  const res = await fetch('/api/sql/practice-evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problem, schemaDescription, userSql, dialect }),
  });

  const rateInfo = parseRateLimits(res);
  if (rateInfo && onRateLimit) onRateLimit(rateInfo);

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to evaluate SQL solution.');
  }

  return {
    score: data.score ?? 0,
    isCorrect: !!data.isCorrect,
    verdict: data.verdict || 'Evaluation Complete',
    feedback: data.feedback || '',
    mistakes: data.mistakes || [],
    improvedSolution: data.improvedSolution || '',
    solutionExplanation: data.solutionExplanation || '',
  };
}
