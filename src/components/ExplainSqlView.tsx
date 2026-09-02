import React, { useState } from 'react';
import {
  BookOpen,
  Send,
  Loader2,
  HelpCircle,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ListOrdered,
  Tag,
  Zap,
} from 'lucide-react';
import { SqlDialect, SqlExplainResponse, AppView } from '../types.ts';
import { SqlCodeBlock } from './SqlCodeBlock.tsx';
import { SQL_DIALECTS } from '../data/mockSchemas.ts';
import { apiExplainSql } from '../services/sqlApi.ts';

interface ExplainSqlViewProps {
  initialSql?: string;
  selectedDialect: SqlDialect;
  onSelectDialect: (d: SqlDialect) => void;
  onNavigateToView: (view: AppView, sqlContent?: string) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onSaveHistory: (item: {
    operation: 'explain';
    dialect: SqlDialect;
    title: string;
    inputSql: string;
  }) => void;
}

export function ExplainSqlView({
  initialSql = '',
  selectedDialect,
  onSelectDialect,
  onNavigateToView,
  onShowToast,
  onSaveHistory,
}: ExplainSqlViewProps) {
  const defaultSampleSql = `SELECT name, salary
FROM employees
ORDER BY salary DESC
LIMIT 5;`;

  const [sql, setSql] = useState<string>(initialSql || defaultSampleSql);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SqlExplainResponse | null>(null);

  const sampleSnippets = [
    {
      title: 'Top 5 Highest Salaries',
      code: `SELECT name, salary\nFROM employees\nORDER BY salary DESC\nLIMIT 5;`,
    },
    {
      title: 'Customer Orders Aggregate Join',
      code: `SELECT c.first_name, c.country, COUNT(o.order_id) AS total_orders, SUM(o.total_amount) AS total_spent\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.status = 'completed'\nGROUP BY c.customer_id, c.first_name, c.country\nHAVING SUM(o.total_amount) > 200\nORDER BY total_spent DESC;`,
    },
    {
      title: 'Department Salary Window Rank',
      code: `SELECT \n  name,\n  department_id,\n  salary,\n  DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as rank_in_dept\nFROM employees;`,
    },
  ];

  const handleExplain = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sql.trim() || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await apiExplainSql(sql.trim(), selectedDialect);
      setResult(data);
      onShowToast('success', 'Explanation Ready', 'Detailed breakdown generated.');

      onSaveHistory({
        operation: 'explain',
        dialect: selectedDialect,
        title: `Explain: ${sql.slice(0, 45).replace(/\n/g, ' ')}...`,
        inputSql: sql,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error explaining query';
      onShowToast('error', 'Explanation Failed', msg);
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
            <BookOpen className="h-5 w-5 text-purple-400" />
            <span>SQL Query Explainer</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Understand how any SQL query works with beginner-friendly clause breakdowns and logical execution diagrams.
          </p>
        </div>

        {/* Dialect Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-medium">Dialect:</span>
          <select
            value={selectedDialect}
            onChange={(e) => onSelectDialect(e.target.value as SqlDialect)}
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {SQL_DIALECTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SQL Input Area */}
      <form onSubmit={handleExplain} className="space-y-4">
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 sm:p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Paste SQL Query to Explain
            </label>
            <span className="text-[11px] font-mono text-purple-400">
              {selectedDialect} Mode
            </span>
          </div>

          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            placeholder="Paste your SQL query here (e.g. SELECT * FROM users WHERE status = 'active')..."
            rows={6}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm font-mono text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition leading-relaxed resize-y"
          />

          {/* Sample Query Buttons */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-neutral-400">
              Load Sample Query:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleSnippets.map((samp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSql(samp.code)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:border-neutral-700 transition cursor-pointer"
                >
                  {samp.title}
                </button>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
            <span className="text-[11px] text-neutral-400">
              Explains clause functions, aggregation, sorting, and subqueries.
            </span>

            <button
              type="submit"
              disabled={loading || !sql.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-600/20 transition cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing Query...</span>
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4" />
                  <span>Explain SQL</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Explanation Results */}
      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-3 duration-300">
          {/* Summary Box */}
          <div className="rounded-2xl bg-neutral-900 border border-purple-500/30 p-5 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <HelpCircle className="h-4 w-4" />
                <span>Plain English Summary</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {result.dialect}
              </span>
            </div>
            <p className="text-sm text-neutral-200 leading-relaxed font-sans">
              {result.summary}
            </p>

            {result.complexityAssessment && (
              <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center gap-2 text-xs text-neutral-400">
                <Cpu className="h-3.5 w-3.5 text-neutral-400" />
                <span>Complexity Assessment: {result.complexityAssessment}</span>
              </div>
            )}
          </div>

          {/* Clause-by-Clause Breakdown */}
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-neutral-200 font-bold text-sm">
              <Layers className="h-4 w-4 text-purple-400" />
              <span>Step-by-Step Clause Breakdown</span>
            </div>

            <div className="space-y-3">
              {result.clauses.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                      {item.clause}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      Part #{idx + 1}
                    </span>
                  </div>

                  <div className="bg-neutral-900 px-3 py-1.5 rounded-lg font-mono text-xs text-neutral-300 border border-neutral-800">
                    {item.codeSnippet}
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Concepts & Logical Execution Order Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Concepts */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                <Tag className="h-4 w-4" />
                <span>Demonstrated SQL Concepts</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {result.keyConcepts.map((concept, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            {/* Logical Execution Order */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <ListOrdered className="h-4 w-4" />
                <span>Logical Database Execution Order</span>
              </div>

              <ol className="space-y-2">
                {result.logicalExecutionOrder.map((step, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-neutral-300 flex items-start gap-2 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800"
                  >
                    <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-sans leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => onNavigateToView('optimize', sql)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Optimize this SQL Query</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
