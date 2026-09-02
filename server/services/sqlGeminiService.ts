import { GoogleGenAI, Type, Schema } from '@google/genai';

export type SqlDialect = 'PostgreSQL' | 'MySQL' | 'SQLite' | 'SQL Server' | 'Oracle';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[SQLGeminiService] Warning: GEMINI_API_KEY is not defined in environment.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-sql-assistant',
        },
      },
    });
  }
  return aiClient;
}

// Clean markdown code blocks if the model outputs them inside JSON string
function cleanSqlString(rawSql: string): string {
  if (!rawSql) return '';
  return rawSql
    .replace(/^```(sql|postgresql|mysql|sqlite|tsql|oracle)?\n?/i, '')
    .replace(/\n?```$/i, '')
    .trim();
}

/**
 * 1. Generate SQL from Natural Language
 */
export async function generateSqlService(params: {
  prompt: string;
  dialect: SqlDialect;
  schemaContext?: string;
}) {
  const ai = getAiClient();
  const { prompt, dialect, schemaContext } = params;

  const systemInstruction = `You are a world-class SQL Database Architect and Expert.
Your job is to translate user natural language requirements into clean, idiomatic, syntactically perfect SQL queries strictly tailored to the requested SQL Dialect (${dialect}).

Guidelines:
- Adhere strictly to the chosen dialect's features (e.g. for PostgreSQL use ILIKE, LIMIT/OFFSET, CTEs; for MySQL use LIMIT, backticks if needed; for SQL Server use TOP, OFFSET-FETCH, brackets; for Oracle use FETCH FIRST n ROWS ONLY or ROWNUM).
- If table/column schema context is provided, adhere to those exact names. Otherwise, assume realistic, well-named normalized tables and list your assumptions.
- Provide a clear, step-by-step beginner-friendly explanation.
- Return output strictly as valid JSON matching the requested schema.`;

  const userMessage = `SQL Dialect: ${dialect}
${schemaContext ? `Database Schema Context:\n${schemaContext}\n` : ''}
User Requirement:
"${prompt}"

Generate the SQL query, explain it, and list all assumed tables/columns.`;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      sql: { type: Type.STRING, description: 'The exact executable SQL query code.' },
      dialect: { type: Type.STRING, description: 'The target SQL dialect name.' },
      explanation: { type: Type.STRING, description: 'Concise explanation of how the query satisfies the prompt.' },
      assumedSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            tableName: { type: Type.STRING },
            columns: { type: Type.ARRAY, items: { type: Type.STRING } },
            description: { type: Type.STRING },
          },
          required: ['tableName', 'columns'],
        },
      },
      tips: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Best practices or dialect-specific tips.',
      },
    },
    required: ['sql', 'dialect', 'explanation', 'assumedSchema'],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: userMessage,
    config: {
      systemInstruction,
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  if (parsed.sql) {
    parsed.sql = cleanSqlString(parsed.sql);
  }
  return parsed;
}

/**
 * 2. Explain SQL Query
 */
export async function explainSqlService(params: {
  sql: string;
  dialect: SqlDialect;
}) {
  const ai = getAiClient();
  const { sql, dialect } = params;

  const systemInstruction = `You are a patient and knowledgeable Database Professor and SQL tutor.
Explain the provided SQL query in beginner-friendly, accessible language.
Break down every clause (SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, etc.) with code snippets.
Detail the logical execution order of SQL vs the lexical order.`;

  const userMessage = `SQL Dialect: ${dialect}
SQL Code to Explain:
\`\`\`sql
${sql}
\`\`\`

Provide a comprehensive, structured breakdown.`;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING, description: 'High-level plain English summary of what the query accomplishes.' },
      dialect: { type: Type.STRING },
      clauses: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            clause: { type: Type.STRING, description: 'e.g. SELECT, FROM & JOIN, WHERE, ORDER BY' },
            codeSnippet: { type: Type.STRING, description: 'The exact fragment from the query' },
            explanation: { type: Type.STRING, description: 'What this clause does in plain terms' },
          },
          required: ['clause', 'codeSnippet', 'explanation'],
        },
      },
      keyConcepts: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Key database concepts demonstrated (e.g. Outer Join, Aggregate Functions, Window Partitioning)',
      },
      logicalExecutionOrder: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Step-by-step list of how the database engine executes this query logically.',
      },
      complexityAssessment: {
        type: Type.STRING,
        description: 'Estimated computational complexity and cost factors.',
      },
    },
    required: ['summary', 'dialect', 'clauses', 'keyConcepts', 'logicalExecutionOrder'],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: userMessage,
    config: {
      systemInstruction,
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

  return JSON.parse(response.text || '{}');
}

/**
 * 3. Debug SQL Query
 */
export async function debugSqlService(params: {
  sql: string;
  errorMessage?: string;
  dialect: SqlDialect;
}) {
  const ai = getAiClient();
  const { sql, errorMessage, dialect } = params;

  const systemInstruction = `You are an elite SQL Debugger and Database Engine Diagnostics Specialist.
Analyze the user's SQL query and optional database error message.
Identify syntax errors, invalid column references, missing aliases, type mismatches, misplaced clauses, unaggregated columns in GROUP BY, or logical traps.
Provide the corrected SQL query and a clear explanation of the fix.`;

  const userMessage = `SQL Dialect: ${dialect}
SQL with issues:
\`\`\`sql
${sql}
\`\`\`
${errorMessage ? `Database Error Message / Symptom:\n"${errorMessage}"\n` : ''}

Debug this query thoroughly.`;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      hasErrors: { type: Type.BOOLEAN, description: 'True if errors or bad anti-patterns were found.' },
      problem: { type: Type.STRING, description: 'Direct summary of what is broken or causing the error.' },
      whyItHappens: { type: Type.STRING, description: 'Root cause explanation of why the SQL engine rejects or misbehaves on this.' },
      correctedSql: { type: Type.STRING, description: 'The fully corrected, working SQL query.' },
      explanation: { type: Type.STRING, description: 'Detailed breakdown of changes made to fix the code.' },
      preventionTips: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Advice to avoid similar bugs in the future.',
      },
    },
    required: ['hasErrors', 'problem', 'whyItHappens', 'correctedSql', 'explanation', 'preventionTips'],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: userMessage,
    config: {
      systemInstruction,
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  if (parsed.correctedSql) {
    parsed.correctedSql = cleanSqlString(parsed.correctedSql);
  }
  return parsed;
}

/**
 * 4. Optimize SQL Query
 */
export async function optimizeSqlService(params: {
  sql: string;
  dialect: SqlDialect;
  context?: string;
}) {
  const ai = getAiClient();
  const { sql, dialect, context } = params;

  const systemInstruction = `You are a Principal Database Performance Engineer and Query Optimizer Specialist.
Analyze the provided SQL query for performance bottlenecks, scan inefficiencies, missing indexing opportunities, unnecessary subqueries, Cartesians, and redundant computations.
Always explicitly include the standard disclaimer that actual execution times depend on table statistics, indexes, and server configurations.`;

  const userMessage = `SQL Dialect: ${dialect}
${context ? `Workload / Schema Context:\n${context}\n` : ''}
SQL Query to Optimize:
\`\`\`sql
${sql}
\`\`\`

Perform a deep performance analysis and provide optimized refactoring.`;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      bottlenecks: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Identified performance bottlenecks (e.g. Full table scans, correlated subquery loops, unindexed joins).',
      },
      optimizedSql: { type: Type.STRING, description: 'The refactored high-performance SQL query.' },
      structuralImprovements: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'List of query structure transformations applied.',
      },
      recommendedIndexes: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Suggested CREATE INDEX statements that would accelerate this query.',
      },
      unnecessaryOperations: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Redundant operations removed (e.g. DISTINCT on unique keys, wildcard SELECT *).',
      },
      alternativeApproaches: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Alternative query strategies (e.g. EXISTS vs IN, CTEs vs temp tables).',
      },
      disclaimer: {
        type: Type.STRING,
        description: 'Clear notice explaining that real-world query execution plans depend on database volume, existing indexes, and DB engine cost models.',
      },
    },
    required: ['bottlenecks', 'optimizedSql', 'structuralImprovements', 'recommendedIndexes', 'disclaimer'],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: userMessage,
    config: {
      systemInstruction,
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  if (parsed.optimizedSql) {
    parsed.optimizedSql = cleanSqlString(parsed.optimizedSql);
  }
  return parsed;
}

/**
 * 5. Generate Practice Question
 */
export async function generatePracticeQuestionService(params: {
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category?: string;
  dialect: SqlDialect;
}) {
  const ai = getAiClient();
  const { difficulty, category, dialect } = params;

  const systemInstruction = `You are a Lead Technical Interviewer and SQL Pedagogy Specialist.
Create an engaging, realistic SQL practice challenge for difficulty level: ${difficulty} targeting ${dialect}.
Provide a realistic problem description, complete table schema with sample data, and a helpful hint.`;

  const userMessage = `Generate a ${difficulty} SQL practice problem ${category ? `focusing on ${category}` : ''} for ${dialect}.`;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: { type: Type.STRING },
      difficulty: { type: Type.STRING },
      category: { type: Type.STRING },
      problem: { type: Type.STRING, description: 'The exact question and expectations.' },
      schema: {
        type: Type.OBJECT,
        properties: {
          tables: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                columns: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      type: { type: Type.STRING },
                      isPrimary: { type: Type.BOOLEAN },
                      isForeign: { type: Type.BOOLEAN },
                    },
                    required: ['name', 'type'],
                  },
                },
                sampleRows: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      dummy: { type: Type.STRING },
                    },
                  },
                },
              },
              required: ['name', 'columns'],
            },
          },
        },
        required: ['tables'],
      },
      hint: { type: Type.STRING },
      starterSql: { type: Type.STRING },
    },
    required: ['title', 'difficulty', 'category', 'problem', 'schema', 'hint', 'starterSql'],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: userMessage,
    config: {
      systemInstruction,
      temperature: 0.4,
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  if (!parsed.id) {
    parsed.id = `gen-${Date.now()}`;
  }
  return parsed;
}

/**
 * 6. Evaluate Practice Answer
 */
export async function evaluatePracticeAnswerService(params: {
  problem: string;
  schemaDescription: string;
  userSql: string;
  dialect: SqlDialect;
}) {
  const ai = getAiClient();
  const { problem, schemaDescription, userSql, dialect } = params;

  const systemInstruction = `You are a strict, constructive SQL grader and code reviewer.
Evaluate the user's submitted SQL query against the problem requirement and schema.
Assign a fair score from 0 to 10.
- 10/10: Perfect query, idiomatic syntax, correct logic and edge case handling.
- 7-9/10: Minor inefficiencies or stylistic issues, but functionally correct.
- 4-6/10: Partially correct, misses a key filter/join/aggregation condition.
- 0-3/10: Syntax errors, wrong tables, or completely broken logic.
Provide clear feedback, list any specific mistakes, and show an ideal improved solution.`;

  const userMessage = `SQL Dialect: ${dialect}
Problem Statement:
"${problem}"

Schema:
${schemaDescription}

User's Submitted SQL:
\`\`\`sql
${userSql}
\`\`\`

Evaluate thoroughly.`;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER, description: 'Score between 0 and 10' },
      isCorrect: { type: Type.BOOLEAN, description: 'True if query correctly solves the prompt' },
      verdict: { type: Type.STRING, description: 'e.g. Excellent Solution, Partially Correct, Syntax Error' },
      feedback: { type: Type.STRING, description: 'Friendly coaching feedback.' },
      mistakes: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Specific bugs, omissions, or logical flaws identified.',
      },
      improvedSolution: { type: Type.STRING, description: 'The optimal reference SQL query.' },
      solutionExplanation: { type: Type.STRING, description: 'Why this reference solution is optimal.' },
    },
    required: ['score', 'isCorrect', 'verdict', 'feedback', 'mistakes', 'improvedSolution', 'solutionExplanation'],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: userMessage,
    config: {
      systemInstruction,
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

  const parsed = JSON.parse(response.text || '{}');
  if (parsed.improvedSolution) {
    parsed.improvedSolution = cleanSqlString(parsed.improvedSolution);
  }
  return parsed;
}
