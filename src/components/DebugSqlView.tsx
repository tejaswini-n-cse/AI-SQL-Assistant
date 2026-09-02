import React, { useState } from 'react';
import {
  Bug,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Loader2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { SqlDialect, SqlDebugResponse, AppView } from '../types.ts';
import { SqlCodeBlock } from './SqlCodeBlock.tsx';
import { SQL_DIALECTS } from '../data/mockSchemas.ts';
import { apiDebugSql } from '../services/sqlApi.ts';

interface DebugSqlViewProps {
  initialSql?: string;
  selectedDialect: SqlDialect;
  onSelectDialect: (d: SqlDialect) => void;
  onNavigateToView: (view: AppView, sqlContent?: string) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onSaveHistory: (item: {
    operation: 'debug';
    dialect: SqlDialect;
    title: string;
    inputSql: string;
    outputSql?: string;
  }) => void;
}

export function DebugSqlView({
  initialSql = '',
  selectedDialect,
  onSelectDialect,
  onNavigateToView,
  onShowToast,
  onSaveHistory,
}: DebugSqlViewProps) {
  const sampleBrokenQueries = [
    {
      title: 'Unaggregated Column in GROUP BY',
      sql: `SELECT department_id, name, AVG(salary)
FROM employees
GROUP BY department_id;`,
      error: `ERROR: column "employees.name" must appear in the GROUP BY clause or be used in an aggregate function`,
    },
    {
      title: 'Ambiguous Column in JOIN',
      sql: `SELECT customer_id, order_id, total_amount
FROM customers
JOIN orders ON customers.customer_id = orders.customer_id
WHERE customer_id = 101;`,
      error: `ERROR: column reference "customer_id" is ambiguous`,
    },
    {
      title: 'Subquery Returning Multiple Rows with =',
      sql: `SELECT name, salary
FROM employees
WHERE salary = (SELECT salary FROM employees WHERE department_id = 1);`,
      error: `ERROR: more than one row returned by a subquery used as an expression`,
    },
  ];

  const [sql, setSql] = useState<string>(
    initialSql || sampleBrokenQueries[0].sql
  );
  const [errorMessage, setErrorMessage] = useState<string>(
    sampleBrokenQueries[0].error
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SqlDebugResponse | null>(null);

  const handleDebug = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sql.trim() || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await apiDebugSql(sql.trim(), errorMessage.trim() || undefined, selectedDialect);
      setResult(data);
      onShowToast('success', 'Diagnostics Complete', 'Identified issues and generated fix.');

      onSaveHistory({
        operation: 'debug',
        dialect: selectedDialect,
        title: `Debug: ${sql.slice(0, 45).replace(/\n/g, ' ')}...`,
        inputSql: sql,
        outputSql: data.correctedSql,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error debugging query';
      onShowToast('error', 'Debugging Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = (sample: { sql: string; error: string }) => {
    setSql(sample.sql);
    setErrorMessage(sample.error);
    setResult(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Bug className="h-5 w-5 text-rose-400" />
            <span>SQL Debugger & Error Diagnostics</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Isolate syntax errors, runtime database exceptions, ambiguous references, and logical flaws with root-cause analysis.
          </p>
        </div>

        {/* Dialect Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-medium">Dialect:</span>
          <select
            value={selectedDialect}
            onChange={(e) => onSelectDialect(e.target.value as SqlDialect)}
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            {SQL_DIALECTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleDebug} className="space-y-4">
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 sm:p-5 shadow-xl space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Faulty / Buggy SQL Query
              </label>
              <span className="text-[11px] font-mono text-rose-400">
                Target: {selectedDialect}
              </span>
            </div>

            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              placeholder="Paste your failing SQL query here..."
              rows={5}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm font-mono text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition leading-relaxed resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Database Error Message (Optional)
            </label>
            <input
              type="text"
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder="e.g. ERROR: column reference 'id' is ambiguous (or leave empty for general logic audit)"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
            />
          </div>

          {/* Sample Error Presets */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-neutral-400">
              Common Bug Scenarios:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleBrokenQueries.map((samp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadSample(samp)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:border-neutral-700 transition cursor-pointer"
                >
                  {samp.title}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
            <span className="text-[11px] text-neutral-400">
              Evaluates syntax parsing, JOIN conditions, aggregation grouping, and subquery scalar returns.
            </span>

            <button
              type="submit"
              disabled={loading || !sql.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm shadow-lg shadow-rose-600/20 transition cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Diagnosing Bugs...</span>
                </>
              ) : (
                <>
                  <Bug className="h-4 w-4" />
                  <span>Debug SQL</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Diagnostics & Solution Result */}
      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-3 duration-300">
          {/* Problem & Root Cause Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* The Problem */}
            <div className="rounded-2xl bg-neutral-900 border border-rose-500/30 p-5 shadow-xl space-y-2.5">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Problem Identified</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans">
                {result.problem}
              </p>
            </div>

            {/* Why It Happens */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-xl space-y-2.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <HelpCircle className="h-4 w-4" />
                <span>Why This Happens (Root Cause)</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                {result.whyItHappens}
              </p>
            </div>
          </div>

          {/* Corrected SQL Query Code Block */}
          <SqlCodeBlock
            code={result.correctedSql}
            dialect={selectedDialect}
            title="Corrected & Working SQL Query"
            onCopy={() => onShowToast('success', 'Copied Corrected SQL', 'Ready to run in your database.')}
            actions={[
              {
                label: 'Explain Fix',
                icon: <Sparkles className="h-3.5 w-3.5 text-purple-400" />,
                onClick: () => onNavigateToView('explain', result.correctedSql),
              },
              {
                label: 'Test Optimize',
                icon: <Sparkles className="h-3.5 w-3.5 text-amber-400" />,
                onClick: () => onNavigateToView('optimize', result.correctedSql),
              },
            ]}
          />

          {/* Explanation of Fix & Prevention Tips */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Detailed Explanation */}
            <div className="md:col-span-7 rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-lg space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>Explanation of the Fix</span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                {result.explanation}
              </p>
            </div>

            {/* Prevention Tips */}
            <div className="md:col-span-5 rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-lg space-y-2.5">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <ShieldCheck className="h-4 w-4" />
                <span>Prevention Tips</span>
              </div>
              <ul className="space-y-1.5 pt-1">
                {result.preventionTips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">&bull;</span>
                    <span className="font-sans leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
