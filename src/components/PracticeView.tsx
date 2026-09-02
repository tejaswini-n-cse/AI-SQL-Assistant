import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Award,
  BookOpen,
  ChevronRight,
  HelpCircle,
  Loader2,
  RefreshCw,
  Table,
  Terminal,
  Zap,
  RotateCcw,
} from 'lucide-react';
import {
  SqlDialect,
  PracticeQuestion,
  PracticeEvaluationResponse,
  PracticeDifficulty,
  AppView,
} from '../types.ts';
import { SqlCodeBlock } from './SqlCodeBlock.tsx';
import { SQL_DIALECTS, PRESET_PRACTICE_QUESTIONS } from '../data/mockSchemas.ts';
import {
  apiEvaluatePracticeAnswer,
  apiGeneratePracticeQuestion,
} from '../services/sqlApi.ts';

interface PracticeViewProps {
  selectedDialect: SqlDialect;
  onSelectDialect: (d: SqlDialect) => void;
  onNavigateToView: (view: AppView, sqlContent?: string) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  onSaveHistory: (item: {
    operation: 'practice';
    dialect: SqlDialect;
    title: string;
    inputSql: string;
    outputSql?: string;
  }) => void;
}

export function PracticeView({
  selectedDialect,
  onSelectDialect,
  onNavigateToView,
  onShowToast,
  onSaveHistory,
}: PracticeViewProps) {
  const [difficulty, setDifficulty] = useState<PracticeDifficulty>('Beginner');
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion>(
    PRESET_PRACTICE_QUESTIONS[0]
  );
  const [userSql, setUserSql] = useState<string>(
    PRESET_PRACTICE_QUESTIONS[0].starterSql || 'SELECT * FROM employees;'
  );
  const [showHint, setShowHint] = useState<boolean>(false);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [generatingNew, setGeneratingNew] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<PracticeEvaluationResponse | null>(null);

  // Filter preset questions by difficulty
  const questionsForLevel = PRESET_PRACTICE_QUESTIONS.filter(
    (q) => q.difficulty === difficulty
  );

  const handleSelectQuestion = (q: PracticeQuestion) => {
    setCurrentQuestion(q);
    setUserSql(q.starterSql || '-- Write your SQL query here\n');
    setShowHint(false);
    setEvaluation(null);
  };

  const handleDifficultyChange = (diff: PracticeDifficulty) => {
    setDifficulty(diff);
    const first = PRESET_PRACTICE_QUESTIONS.find((q) => q.difficulty === diff);
    if (first) {
      handleSelectQuestion(first);
    }
  };

  const handleGenerateNewQuestion = async () => {
    setGeneratingNew(true);
    setEvaluation(null);

    try {
      const newQ = await apiGeneratePracticeQuestion(
        difficulty,
        currentQuestion.category,
        selectedDialect
      );
      setCurrentQuestion(newQ);
      setUserSql(newQ.starterSql || '-- Write your SQL query here\n');
      setShowHint(false);
      onShowToast('success', 'New Challenge Generated', `${difficulty} problem loaded.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error generating question';
      onShowToast('error', 'Generation Error', msg);
    } finally {
      setGeneratingNew(false);
    }
  };

  const handleEvaluate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userSql.trim() || evaluating) return;

    setEvaluating(true);
    setEvaluation(null);

    // Format schema representation
    const schemaDesc = currentQuestion.schema.tables
      .map(
        (t) =>
          `Table: ${t.name}\nColumns: ${t.columns.map((c) => `${c.name} (${c.type}${c.isPrimary ? ', PK' : ''}${c.isForeign ? ', FK' : ''})`).join(', ')}`
      )
      .join('\n\n');

    try {
      const data = await apiEvaluatePracticeAnswer(
        currentQuestion.problem,
        schemaDesc,
        userSql.trim(),
        selectedDialect
      );
      setEvaluation(data);

      if (data.score >= 8) {
        onShowToast('success', `Score: ${data.score}/10`, 'Great work on this solution!');
      } else {
        onShowToast('info', `Score: ${data.score}/10`, 'Review feedback and try again.');
      }

      onSaveHistory({
        operation: 'practice',
        dialect: selectedDialect,
        title: `Practice: ${currentQuestion.title} (${data.score}/10)`,
        inputSql: userSql,
        outputSql: data.improvedSolution,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error evaluating answer';
      onShowToast('error', 'Evaluation Error', msg);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-400" />
            <span>SQL Practice Arena & Interview Challenges</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Solve realistic SQL problems, submit queries for AI grading (0-10), and view optimal reference solutions.
          </p>
        </div>

        {/* Dialect Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 font-medium">Dialect:</span>
          <select
            value={selectedDialect}
            onChange={(e) => onSelectDialect(e.target.value as SqlDialect)}
            className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {SQL_DIALECTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Difficulty Level Selector & Challenge Generator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900/80 border border-neutral-800 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 mr-1">
            Difficulty:
          </span>
          {(['Beginner', 'Intermediate', 'Advanced'] as PracticeDifficulty[]).map((level) => (
            <button
              key={level}
              onClick={() => handleDifficultyChange(level)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                difficulty === level
                  ? level === 'Beginner'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : level === 'Intermediate'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <button
          onClick={handleGenerateNewQuestion}
          disabled={generatingNew}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 text-xs font-medium border border-neutral-700 transition cursor-pointer"
        >
          {generatingNew ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Generating AI Challenge...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Generate New AI Problem</span>
            </>
          )}
        </button>
      </div>

      {/* Question Card & Schema Details */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-xl space-y-4">
        {/* Title & Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                currentQuestion.difficulty === 'Beginner'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : currentQuestion.difficulty === 'Intermediate'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {currentQuestion.difficulty}
            </span>
            <h3 className="text-base font-bold text-neutral-100">{currentQuestion.title}</h3>
          </div>

          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-neutral-950 text-neutral-400 border border-neutral-800">
            Category: {currentQuestion.category}
          </span>
        </div>

        {/* Problem Statement */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Problem Description & Goal:
          </h4>
          <p className="text-sm text-neutral-200 font-sans leading-relaxed bg-neutral-950 p-4 rounded-xl border border-neutral-800/80">
            {currentQuestion.problem}
          </p>
        </div>

        {/* Example Schema & Tables */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Table className="h-3.5 w-3.5 text-indigo-400" />
            <span>Target Schema & Tables:</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentQuestion.schema.tables.map((tbl, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    {tbl.name}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {tbl.columns.length} columns
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {tbl.columns.map((col, cIdx) => (
                    <span
                      key={cIdx}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800"
                    >
                      {col.name} <span className="text-neutral-400 text-[10px]">({col.type})</span>
                      {col.isPrimary && (
                        <span className="ml-1 text-[9px] text-amber-400 font-bold">PK</span>
                      )}
                      {col.isForeign && (
                        <span className="ml-1 text-[9px] text-indigo-400 font-bold">FK</span>
                      )}
                    </span>
                  ))}
                </div>

                {tbl.sampleRows && tbl.sampleRows.length > 0 && (
                  <div className="pt-2 border-t border-neutral-800/80 text-[10px] text-neutral-400 font-mono">
                    Sample row:{' '}
                    <span className="text-neutral-300">
                      {JSON.stringify(tbl.sampleRows[0])}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Hint Toggle */}
        {currentQuestion.hint && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-amber-400 font-medium transition cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
            </button>
            {showHint && (
              <div className="mt-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
                <strong className="font-semibold">Hint:</strong> {currentQuestion.hint}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SQL Editor & Submission */}
      <form onSubmit={handleEvaluate} className="space-y-4">
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 sm:p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              <span>Your SQL Query Solution</span>
            </label>
            <span className="text-[11px] font-mono text-neutral-400">
              Targeting: <strong className="text-neutral-200">{selectedDialect}</strong>
            </span>
          </div>

          <textarea
            value={userSql}
            onChange={(e) => setUserSql(e.target.value)}
            placeholder="Write your SQL solution query here..."
            rows={7}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3.5 text-sm font-mono text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition leading-relaxed resize-y"
          />

          {/* Submission Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
            <button
              type="button"
              onClick={() => setUserSql(currentQuestion.starterSql || 'SELECT * FROM ')}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Template</span>
            </button>

            <button
              type="submit"
              disabled={evaluating || !userSql.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition cursor-pointer"
            >
              {evaluating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Grading Solution...</span>
                </>
              ) : (
                <>
                  <Award className="h-4 w-4" />
                  <span>Evaluate My Answer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Evaluation & Grading Output */}
      {evaluation && (
        <div className="space-y-6 animate-in slide-in-from-bottom-3 duration-300">
          {/* Score & Verdict Banner */}
          <div
            className={`rounded-2xl p-5 border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              evaluation.score >= 8
                ? 'bg-emerald-950/40 border-emerald-500/40'
                : evaluation.score >= 5
                ? 'bg-amber-950/40 border-amber-500/40'
                : 'bg-rose-950/40 border-rose-500/40'
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`h-16 w-16 rounded-2xl flex flex-col items-center justify-center font-mono font-extrabold border shadow-inner ${
                  evaluation.score >= 8
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : evaluation.score >= 5
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}
              >
                <span className="text-2xl leading-none">{evaluation.score}</span>
                <span className="text-[10px] text-neutral-400">/ 10</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-neutral-100">{evaluation.verdict}</h4>
                  {evaluation.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-400" />
                  )}
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 mt-1 leading-relaxed">
                  {evaluation.feedback}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                onClick={handleGenerateNewQuestion}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold border border-neutral-700 transition"
              >
                Next Challenge &rarr;
              </button>
            </div>
          </div>

          {/* Mistakes List */}
          {evaluation.mistakes && evaluation.mistakes.length > 0 && (
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-lg space-y-2.5">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Areas to Fix / Edge Cases Missed</span>
              </div>
              <ul className="space-y-1.5">
                {evaluation.mistakes.map((m, idx) => (
                  <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                    <span className="text-rose-400 font-bold">&times;</span>
                    <span className="font-sans leading-relaxed">{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improved Reference Solution */}
          <div className="space-y-3">
            <SqlCodeBlock
              code={evaluation.improvedSolution}
              dialect={selectedDialect}
              title="Reference & Optimal SQL Solution"
              onCopy={() => onShowToast('success', 'Copied Reference Solution')}
              actions={[
                {
                  label: 'Explain Solution',
                  icon: <BookOpen className="h-3.5 w-3.5 text-purple-400" />,
                  onClick: () => onNavigateToView('explain', evaluation.improvedSolution),
                },
              ]}
            />

            {evaluation.solutionExplanation && (
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <span className="text-xs font-semibold text-emerald-400">
                  Why this solution is optimal:
                </span>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  {evaluation.solutionExplanation}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
