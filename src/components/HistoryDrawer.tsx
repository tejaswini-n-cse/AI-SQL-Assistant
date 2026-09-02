import React, { useState } from 'react';
import {
  History,
  X,
  Trash2,
  Download,
  Search,
  ExternalLink,
  Code2,
  Calendar,
  Sparkles,
  BookOpen,
  Bug,
  Zap,
  GraduationCap,
} from 'lucide-react';
import { QueryHistoryItem, AppView, SqlDialect } from '../types.ts';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: QueryHistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryItem: (item: QueryHistoryItem) => void;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export function HistoryDrawer({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onSelectHistoryItem,
  onShowToast,
}: HistoryDrawerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOp, setFilterOp] = useState<string>('all');

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.inputPrompt && item.inputPrompt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.inputSql && item.inputSql.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.outputSql && item.outputSql.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesOp = filterOp === 'all' || item.operation === filterOp;
    return matchesSearch && matchesOp;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sql-assistant-history-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('success', 'History Exported', 'Downloaded query history JSON file.');
  };

  const getOpIcon = (op: string) => {
    switch (op) {
      case 'generate':
        return <Sparkles className="h-3.5 w-3.5 text-indigo-400" />;
      case 'explain':
        return <BookOpen className="h-3.5 w-3.5 text-purple-400" />;
      case 'debug':
        return <Bug className="h-3.5 w-3.5 text-rose-400" />;
      case 'optimize':
        return <Zap className="h-3.5 w-3.5 text-amber-400" />;
      case 'practice':
        return <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />;
      default:
        return <Code2 className="h-3.5 w-3.5 text-neutral-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <History className="h-5 w-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-neutral-100">Query Session History</h3>
              <span className="text-[11px] text-neutral-400">{history.length} saved sessions</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <>
                <button
                  onClick={handleExportJson}
                  title="Export History JSON"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={onClearHistory}
                  title="Clear All History"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="p-3 border-b border-neutral-800 space-y-2 bg-neutral-950/40">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search past queries..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
            {['all', 'generate', 'explain', 'debug', 'optimize', 'practice'].map((op) => (
              <button
                key={op}
                onClick={() => setFilterOp(op)}
                className={`px-2 py-0.5 rounded capitalize transition whitespace-nowrap ${
                  filterOp === op
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold'
                    : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
                }`}
              >
                {op}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <History className="h-8 w-8 text-neutral-600 mx-auto" />
              <p className="text-xs text-neutral-400">
                {history.length === 0
                  ? 'No saved queries yet. Generate, explain, or debug SQL to build your session history!'
                  : 'No queries match your search query.'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistoryItem(item);
                  onClose();
                }}
                className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition cursor-pointer group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getOpIcon(item.operation)}
                    <span className="text-xs font-semibold text-neutral-200 capitalize group-hover:text-indigo-400 transition">
                      {item.operation}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                    {item.dialect}
                  </span>
                </div>

                <p className="text-xs text-neutral-300 font-sans line-clamp-2">
                  {item.title}
                </p>

                {(item.outputSql || item.inputSql) && (
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800/80 font-mono text-[11px] text-neutral-400 line-clamp-2">
                    {item.outputSql || item.inputSql}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="text-indigo-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Restore &rarr;
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
