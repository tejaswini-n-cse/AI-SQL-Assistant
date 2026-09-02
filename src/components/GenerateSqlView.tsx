import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Table,
  Lightbulb,
  Info,
  BookOpen,
  Zap,
  Bug,
  RotateCcw,
  Database,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SqlDialect, SqlGenerateResponse, AppView } from '../types.ts';
import { SqlCodeBlock } from './SqlCodeBlock.tsx';
import { SQL_DIALECTS, SAMPLE_SCHEMAS } from '../data/mockSchemas.ts';
import { apiGenerateSql } from '../services/sqlApi.ts';

interface GenerateSqlViewProps {
  initialPrompt?: string;
  selectedDialect: SqlDialect;
  onSelectDialect: (d: SqlDialect) => void;
  onNavigateToView: (view: AppView, sqlContent?: string) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onSaveHistory: (item: {
    operation: 'generate';
    dialect: SqlDialect;
    title: string;
    inputPrompt: string;
    outputSql: string;
  }) => void;
}

export function GenerateSqlView({
  initialPrompt = '',
  selectedDialect,
  onSelectDialect,
  onNavigateToView,
  onShowToast,
  onSaveHistory,
}: GenerateSqlViewProps) {
  const [prompt, setPrompt] = useState<string>(
    initialPrompt || 'Find the top 5 employees with the highest salary.'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SqlGenerateResponse | null>(null);
  const [useSchemaContext, setUseSchemaContext] = useState<string>('none');
  const [customSchema, setCustomSchema] = useState<string>('');
  const [showSchemaSettings, setShowSchemaSettings] = useState<boolean>(false);

  const samplePrompts = [
    'Find the top 5 employees with the highest salary.',
    'List all customers who placed more than 3 orders in 2023 with total spend over $500.',
    'Calculate the month-over-month growth percentage in total revenue.',
    'Find all products that have never been ordered.',
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setResult(null);

    let schemaContext: string | undefined;
    if (useSchemaContext !== 'none') {
      const selectedDb = SAMPLE_SCHEMAS.find((s) => s.id === useSchemaContext);
      if (selectedDb) {
        schemaContext = selectedDb.tables
          .map(
            (t) =>
              `Table ${t.name}: ${t.columns.map((c) => `${c.name} (${c.type})`).join(', ')}`
          )
          .join('\n');
      }
    } else if (customSchema.trim()) {
      schemaContext = customSchema.trim();
    }

    try {
      const data = await apiGenerateSql(prompt.trim(), selectedDialect, schemaContext);
      setResult(data);
      onShowToast('success', 'SQL Generated Successfully', `Tailored to ${selectedDialect}`);

      if (data.sql) {
        onSaveHistory({
          operation: 'generate',
          dialect: selectedDialect,
          title: prompt.slice(0, 60) + (prompt.length > 60 ? '...' : ''),
          inputPrompt: prompt,
          outputSql: data.sql,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating SQL';
      onShowToast('error', 'Generation Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <span>Natural Language &rarr; SQL Generator</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Transform plain English queries into production-grade SQL with full schema awareness.
          </p>
        </div>

        {/* Dialect Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-medium">Dialect:</span>
          <select
            value={selectedDialect}
            onChange={(e) => onSelectDialect(e.target.value as SqlDialect)}
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {SQL_DIALECTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 sm:p-5 shadow-xl space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
            Describe what you want to query
          </label>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to query..."
            rows={4}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-sans leading-relaxed resize-y"
          />

          {/* Prompt Suggestion Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-neutral-400">Quick Examples:</span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(p)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-950/90 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:border-neutral-700 transition text-left cursor-pointer"
                >
                  &ldquo;{p}&rdquo;
                </button>
              ))}
            </div>
          </div>

          {/* Collapsible Schema Context Toggle */}
          <div className="pt-2 border-t border-neutral-800/80">
            <button
              type="button"
              onClick={() => setShowSchemaSettings(!showSchemaSettings)}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 font-medium transition cursor-pointer"
            >
              <Database className="h-3.5 w-3.5 text-indigo-400" />
              <span>Target Database Schema Context (Optional)</span>
              {showSchemaSettings ? (
                <ChevronUp className="h-3.5 w-3.5 ml-1" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 ml-1" />
              )}
            </button>

            {showSchemaSettings && (
              <div className="mt-3 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-xs text-neutral-400">Pre-loaded Schema:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setUseSchemaContext('none')}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                        useSchemaContext === 'none'
                          ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 font-semibold'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                      }`}
                    >
                      AI Inferred (Default)
                    </button>
                    {SAMPLE_SCHEMAS.map((sch) => (
                      <button
                        key={sch.id}
                        type="button"
                        onClick={() => setUseSchemaContext(sch.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                          useSchemaContext === sch.id
                            ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 font-semibold'
                            : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                        }`}
                      >
                        {sch.name}
                      </button>
                    ))}
                  </div>
                </div>

                {useSchemaContext === 'none' && (
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">
                      Or paste custom table definitions (e.g. `users(id, email, created_at)`):
                    </label>
                    <input
                      type="text"
                      value={customSchema}
                      onChange={(e) => setCustomSchema(e.target.value)}
                      placeholder="e.g. orders(order_id, user_id, amount, status), users(user_id, name)"
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-neutral-400">
              Output will follow <span className="text-indigo-400 font-semibold">{selectedDialect}</span> syntax standard.
            </span>

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/20 transition cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Synthesizing SQL...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate SQL</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Generated Result Output */}
      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-3 duration-300">
          {/* Main SQL Code Block */}
          <SqlCodeBlock
            code={result.sql}
            dialect={result.dialect}
            title="Generated SQL Query"
            onCopy={() => onShowToast('success', 'Copied to Clipboard', 'SQL query is ready to paste.')}
            actions={[
              {
                label: 'Explain',
                icon: <BookOpen className="h-3.5 w-3.5 text-purple-400" />,
                onClick: () => onNavigateToView('explain', result.sql),
              },
              {
                label: 'Optimize',
                icon: <Zap className="h-3.5 w-3.5 text-amber-400" />,
                onClick: () => onNavigateToView('optimize', result.sql),
              },
              {
                label: 'Debug',
                icon: <Bug className="h-3.5 w-3.5 text-rose-400" />,
                onClick: () => onNavigateToView('debug', result.sql),
              },
            ]}
          />

          {/* Explanation & Assumed Schema Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Explanation Card */}
            <div className="md:col-span-7 rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                <Lightbulb className="h-4 w-4" />
                <span>Query Explanation</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {result.explanation}
              </p>

              {result.tips && result.tips.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-800 space-y-1.5">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    Dialect Tips & Best Practices
                  </span>
                  <ul className="space-y-1">
                    {result.tips.map((tip, i) => (
                      <li key={i} className="text-xs text-neutral-400 flex items-start gap-1.5">
                        <span className="text-indigo-400 font-bold">&bull;</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Assumed Tables & Columns Card */}
            <div className="md:col-span-5 rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Table className="h-4 w-4" />
                <span>Assumed Tables & Columns</span>
              </div>

              {result.assumedSchema.length > 0 ? (
                <div className="space-y-3">
                  {result.assumedSchema.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {item.tableName}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {item.columns.length} columns
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.columns.map((col, cIdx) => (
                          <span
                            key={cIdx}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800"
                          >
                            {col}
                          </span>
                        ))}
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-neutral-400 italic pt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400">Standard relational schema assumed.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
