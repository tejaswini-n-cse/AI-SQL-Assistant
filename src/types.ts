export type SqlDialect = 'PostgreSQL' | 'MySQL' | 'SQLite' | 'SQL Server' | 'Oracle';

export type AppView = 'dashboard' | 'generate' | 'explain' | 'debug' | 'optimize' | 'practice' | 'history' | 'schema';

export type PracticeDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface AssumedTable {
  tableName: string;
  columns: string[];
  description?: string;
}

export interface SqlGenerateResponse {
  sql: string;
  dialect: SqlDialect;
  explanation: string;
  assumedSchema: AssumedTable[];
  tips?: string[];
}

export interface SqlClauseExplanation {
  clause: string;
  codeSnippet: string;
  explanation: string;
}

export interface SqlExplainResponse {
  summary: string;
  dialect: SqlDialect;
  clauses: SqlClauseExplanation[];
  keyConcepts: string[];
  logicalExecutionOrder: string[];
  complexityAssessment?: string;
}

export interface SqlDebugResponse {
  hasErrors: boolean;
  problem: string;
  whyItHappens: string;
  correctedSql: string;
  explanation: string;
  preventionTips: string[];
}

export interface SqlOptimizeResponse {
  bottlenecks: string[];
  optimizedSql: string;
  structuralImprovements: string[];
  recommendedIndexes: string[];
  unnecessaryOperations: string[];
  alternativeApproaches: string[];
  disclaimer: string;
}

export interface PracticeTableColumn {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
}

export interface PracticeTable {
  name: string;
  columns: PracticeTableColumn[];
  sampleRows: Record<string, string | number | boolean | null>[];
}

export interface PracticeQuestion {
  id: string;
  title: string;
  difficulty: PracticeDifficulty;
  category: string;
  problem: string;
  schema: {
    tables: PracticeTable[];
  };
  hint?: string;
  starterSql?: string;
}

export interface PracticeEvaluationResponse {
  score: number; // 0 to 10
  isCorrect: boolean;
  verdict: string;
  feedback: string;
  mistakes: string[];
  improvedSolution: string;
  solutionExplanation: string;
}

export interface QueryHistoryItem {
  id: string;
  operation: 'generate' | 'explain' | 'debug' | 'optimize' | 'practice';
  dialect: SqlDialect;
  title: string;
  inputSql?: string;
  inputPrompt?: string;
  outputSql?: string;
  timestamp: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}
