import {
  Sparkles,
  BookOpen,
  Bug,
  Zap,
  GraduationCap,
  ArrowRight,
  Database,
  CheckCircle2,
  Table,
  Layers,
} from 'lucide-react';
import { AppView, SqlDialect } from '../types.ts';
import { FEATURE_PROMPTS, SAMPLE_SCHEMAS } from '../data/mockSchemas.ts';

interface DashboardViewProps {
  onSelectView: (view: AppView) => void;
  selectedDialect: SqlDialect;
  onUsePrompt: (prompt: string, dialect: SqlDialect) => void;
  onOpenSchema: () => void;
}

export function DashboardView({
  onSelectView,
  selectedDialect,
  onUsePrompt,
  onOpenSchema,
}: DashboardViewProps) {
  const majorFeatures = [
    {
      id: 'generate' as AppView,
      title: 'Natural Language → SQL',
      description: 'Describe what data you want in plain English. Get production-ready, dialect-specific SQL with schema assumptions and explanations.',
      icon: Sparkles,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 group-hover:border-indigo-500/50',
      badge: 'Core Engine',
    },
    {
      id: 'explain' as AppView,
      title: 'SQL Explanation',
      description: 'Paste any complex SQL query. Gemini analyzes clauses, JOIN logic, execution order, and explains it in clear, beginner-friendly terms.',
      icon: BookOpen,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/50',
      badge: 'Learning Tool',
    },
    {
      id: 'debug' as AppView,
      title: 'SQL Debugger',
      description: 'Find and fix syntax errors, subtle JOIN traps, and ambiguous column names with root-cause explanations and 1-click corrected code.',
      icon: Bug,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20 group-hover:border-rose-500/50',
      badge: 'Diagnostic',
    },
    {
      id: 'optimize' as AppView,
      title: 'SQL Optimization',
      description: 'Analyze query performance, eliminate redundant scans, restructure complex subqueries, and discover recommended CREATE INDEX statements.',
      icon: Zap,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/50',
      badge: 'Performance',
    },
    {
      id: 'practice' as AppView,
      title: 'SQL Practice & Interview Arena',
      description: 'Practice interactive SQL problems across Beginner, Intermediate, and Advanced tiers with automated grading and scoring out of 10.',
      icon: GraduationCap,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/50',
      badge: 'Interactive Challenges',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950/40 border border-neutral-800 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Database Engineering & Learning</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-100 tracking-tight">
            AI SQL Assistant
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            Generate, explain, debug, and optimize production SQL queries in seconds.
            Designed for engineers, analysts, and students mastering{' '}
            <span className="text-indigo-400 font-semibold">{selectedDialect}</span>, MySQL, SQLite, SQL Server, and Oracle.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onSelectView('generate')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate SQL Query</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => onSelectView('practice')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs sm:text-sm border border-neutral-700 transition cursor-pointer"
            >
              <GraduationCap className="h-4 w-4 text-emerald-400" />
              <span>Practice Questions</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid Pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Quick Action Feature Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-neutral-200 flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-400" />
            <span>Core AI SQL Workspaces</span>
          </h3>
          <span className="text-xs text-neutral-500">
            Active: <span className="font-mono text-neutral-300 font-semibold">{selectedDialect}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {majorFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                onClick={() => onSelectView(feat.id)}
                className="group relative rounded-2xl bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-5 shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center border transition-colors ${feat.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700/60">
                      {feat.badge}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-neutral-100 group-hover:text-indigo-400 transition-colors">
                    {feat.title}
                  </h4>

                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                  <span>Open Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Example SQL Prompts */}
      <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
          <div>
            <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>Example SQL Prompts to Try Instantly</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Click any prompt to instantly load and generate the query
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FEATURE_PROMPTS.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onUsePrompt(item.prompt, item.dialect)}
              className="p-3.5 rounded-xl bg-neutral-950/70 hover:bg-neutral-950 border border-neutral-800 hover:border-indigo-500/40 transition group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-neutral-200 group-hover:text-indigo-300 transition">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
                    {item.dialect}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-sans line-clamp-2">
                  &ldquo;{item.prompt}&rdquo;
                </p>
              </div>

              <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-indigo-400 opacity-80 group-hover:opacity-100">
                <span>Generate query</span>
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Database Schema Reference Highlights */}
      <div className="rounded-2xl bg-neutral-900/80 border border-neutral-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
          <div>
            <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-400" />
              <span>Sample Database Schemas Available</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Pre-loaded realistic tables ready for practice and query testing
            </p>
          </div>
          <button
            onClick={onOpenSchema}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View All Tables</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SAMPLE_SCHEMAS.map((sch) => (
            <div
              key={sch.id}
              className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800"
            >
              <div className="flex items-center gap-2 mb-2">
                <Table className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-neutral-200">{sch.name}</h4>
              </div>
              <p className="text-xs text-neutral-400 mb-3">{sch.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {sch.tables.map((t) => (
                  <span
                    key={t.name}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800"
                  >
                    {t.name} ({t.columns.length} cols)
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
