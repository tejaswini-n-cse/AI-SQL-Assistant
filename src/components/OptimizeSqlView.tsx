import React, { useState } from 'react';
import {
  Zap,
  Gauge,
  Database,
  ArrowRight,
  TrendingUp,
  Cpu,
  Loader2,
  Copy,
  Check,
  Info,
  Layers,
  Sparkles,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { SqlDialect, SqlOptimizeResponse, AppView } from '../types.ts';
import { SqlCodeBlock } from './SqlCodeBlock.tsx';
import { SQL_DIALECTS } from '../data/mockSchemas.ts';
import { apiOptimizeSql } from '../services/sqlApi.ts';

interface OptimizeSqlViewProps {
  initialSql?: string;
  selectedDialect: SqlDialect;
  onSelectDialect: (d: SqlDialect) => void;
  onNavigateToView: (view: AppView, sqlContent?: string) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onSaveHistory: (item: {
    operation: 'optimize';
    dialect: SqlDialect;
    title: string;
    inputSql: string;
    outputSql?: string;
  }) => void;
}

export function OptimizeSqlView({
  initialSql = '',
  selectedDialect,
  onSelectDialect,
  onNavigateToView,
  onShowToast,
  onSaveHistory,
}: OptimizeSqlViewProps) {
  const sampleSlowQueries = [
    {
      title: 'Correlated Subquery in WHERE with SELECT *',
      sql: `SELECT *
FROM orders o
WHERE o.customer_id IN (
  SELECT c.customer_id 
  FROM customers c 
  WHERE c.country = 'USA' AND c.email LIKE '%@gmail.com'
)
ORDER BY o.order_date DESC;`,
    },
    {
      title: 'Redundant DISTINCT with Wildcard Scan',
      sql: `SELECT DISTINCT o.customer_id, o.order_id, c.first_name, c.email
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id
WHERE UPPER(c.country) = 'CANADA'
GROUP BY o.customer_id, o.order_id, c.first_name, c.email;`,
    },
  ];

  const [sql, setSql] = useState<string>(
    initialSql || sampleSlowQueries[0].sql
  );
  const [context, setContext] = useState<string>('orders table has ~2,000,000 rows; customers has ~250,000 rows.');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SqlOptimizeResponse | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleOptimize = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sql.trim() || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await apiOptimizeSql(sql.trim(), selectedDialect, context.trim() || undefined);
      setResult(data);
      onShowToast('success', 'Optimization Generated', `Tailored to ${selectedDialect}`);

      onSaveHistory({
        operation: 'optimize',
        dialect: selectedDialect,
        title: `Optimize: ${sql.slice(0, 45).replace(/\n/g, ' ')}...`,
        inputSql: sql,
        outputSql: data.optimizedSql,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error optimizing query';
      onShowToast('error', 'Optimization Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyIndexStatement = (indexSql: string, idx: number) => {
    navigator.clipboard.writeText(indexSql);
    setCopiedIndex(idx);
    onShowToast('success', 'Index Copied', 'Index DDL ready to execute');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            <span>SQL Performance & Query Optimizer</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Detect full table scans, correlated subquery loops, indexing gaps, and rewrite queries for maximum throughput.
          </p>
        </div>

        {/* Dialect Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-medium">Dialect:</span>
          <select
            value={selectedDialect}
            onChange={(e) => onSelectDialect(e.target.value as SqlDialect)}
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
      <form onSubmit={handleOptimize} className="space-y-4">
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 sm:p-5 shadow-xl space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                SQL Query to Optimize
              </label>
              <span className="text-[11px] font-mono text-amber-400">
                Engine Target: {selectedDialect}
              </span>
            </div>

            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              placeholder="Paste SQL query you want to optimize for performance..."
              rows={6}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm font-mono text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition leading-relaxed resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Workload / Table Volume Context (Optional)
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. Table has 5 million rows, runs 200 times per second in high-concurrency API"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-sans text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Sample Slow Queries */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-neutral-400">
              Load Slow Query Examples:
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleSlowQueries.map((samp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSql(samp.sql)}
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
              Assesses index scans, Cartesian products, sargability, and predicate pushdown.
            </span>

            <button
              type="submit"
              disabled={loading || !sql.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm shadow-lg shadow-amber-600/20 transition cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Optimizing Query...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Optimize SQL</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Optimization Results */}
      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-3 duration-300">
          {/* Bottlenecks Identified */}
          <div className="rounded-2xl bg-neutral-900 border border-amber-500/30 p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Gauge className="h-4 w-4" />
              <span>Identified Bottlenecks & Inefficiencies</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {result.bottlenecks.map((b, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-start gap-2.5"
                >
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-neutral-200 leading-relaxed font-sans">
                    {b}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Refactored High-Performance SQL */}
          <SqlCodeBlock
            code={result.optimizedSql}
            dialect={selectedDialect}
            title="Optimized & Refactored SQL Query"
            onCopy={() => onShowToast('success', 'Copied Optimized SQL', 'Ready for testing.')}
            actions={[
              {
                label: 'Explain',
                icon: <Sparkles className="h-3.5 w-3.5 text-purple-400" />,
                onClick: () => onNavigateToView('explain', result.optimizedSql),
              },
            ]}
          />

          {/* Structural Improvements & Recommended Indexes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Structural Improvements */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                <Layers className="h-4 w-4" />
                <span>Structural Query Improvements</span>
              </div>
              <ul className="space-y-2">
                {result.structuralImprovements.map((imp, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-neutral-300 flex items-start gap-2 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800"
                  >
                    <span className="text-indigo-400 font-bold">&bull;</span>
                    <span className="font-sans leading-relaxed">{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Indexes */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <Database className="h-4 w-4" />
                <span>Recommended Indexes (CREATE INDEX)</span>
              </div>
              <div className="space-y-2">
                {result.recommendedIndexes.map((idxSql, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-2"
                  >
                    <code className="text-xs font-mono text-emerald-300 break-all">
                      {idxSql}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopyIndexStatement(idxSql, idx)}
                      className="p-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-700/60 transition shrink-0"
                      title="Copy Index Statement"
                    >
                      {copiedIndex === idx ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Unnecessary Operations & Alternative Strategies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.unnecessaryOperations && result.unnecessaryOperations.length > 0 && (
              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-lg space-y-2.5">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                  <Cpu className="h-4 w-4" />
                  <span>Removed Unnecessary Operations</span>
                </div>
                <ul className="space-y-1.5">
                  {result.unnecessaryOperations.map((op, idx) => (
                    <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                      <span className="text-rose-400 font-bold">&times;</span>
                      <span className="font-sans leading-relaxed">{op}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.alternativeApproaches && result.alternativeApproaches.length > 0 && (
              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-lg space-y-2.5">
                <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>Alternative Query Approaches</span>
                </div>
                <ul className="space-y-1.5">
                  {result.alternativeApproaches.map((alt, idx) => (
                    <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                      <span className="text-purple-400 font-bold">&bull;</span>
                      <span className="font-sans leading-relaxed">{alt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Disclaimer Banner */}
          <div className="rounded-xl bg-neutral-950 border border-neutral-800/80 p-3.5 flex items-start gap-3 text-xs text-neutral-400">
            <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-neutral-300">Note:</strong> {result.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
