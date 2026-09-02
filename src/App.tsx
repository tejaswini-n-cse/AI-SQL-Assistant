import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { Navbar } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { GenerateSqlView } from './components/GenerateSqlView.tsx';
import { ExplainSqlView } from './components/ExplainSqlView.tsx';
import { DebugSqlView } from './components/DebugSqlView.tsx';
import { OptimizeSqlView } from './components/OptimizeSqlView.tsx';
import { PracticeView } from './components/PracticeView.tsx';
import { SchemaModal } from './components/SchemaModal.tsx';
import { HistoryDrawer } from './components/HistoryDrawer.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { AppView, SqlDialect, QueryHistoryItem, ToastMessage } from './types.ts';

const LOCAL_STORAGE_HISTORY_KEY = 'ai_sql_assistant_history_v2';
const LOCAL_STORAGE_THEME_KEY = 'ai_sql_assistant_theme';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [selectedDialect, setSelectedDialect] = useState<SqlDialect>('PostgreSQL');
  
  // Cross-view query drafts (for passing generated SQL to Explain/Optimize/Debug seamlessly)
  const [generatePromptDraft, setGeneratePromptDraft] = useState<string>('');
  const [sqlCodeDraft, setSqlCodeDraft] = useState<string>('');

  // Modals & Drawers
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  // History state
  const [history, setHistory] = useState<QueryHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toasts state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync theme class with document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, String(isDark));
  }, [isDark]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to persist history to localStorage', e);
    }
  }, [history]);

  const handleToggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleShowToast = (
    type: 'success' | 'error' | 'info',
    title: string,
    message?: string
  ) => {
    const newToast: ToastMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveHistory = (item: {
    operation: 'generate' | 'explain' | 'debug' | 'optimize' | 'practice';
    dialect: SqlDialect;
    title: string;
    inputSql?: string;
    inputPrompt?: string;
    outputSql?: string;
  }) => {
    const newEntry: QueryHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      operation: item.operation,
      dialect: item.dialect,
      title: item.title,
      inputSql: item.inputSql,
      inputPrompt: item.inputPrompt,
      outputSql: item.outputSql,
      timestamp: Date.now(),
    };
    setHistory((prev) => [newEntry, ...prev.slice(0, 49)]); // keep last 50
  };

  const handleClearHistory = () => {
    setHistory([]);
    handleShowToast('info', 'History Cleared', 'All saved queries were removed.');
  };

  const handleSelectHistoryItem = (item: QueryHistoryItem) => {
    setSelectedDialect(item.dialect);
    if (item.operation === 'generate') {
      if (item.inputPrompt) setGeneratePromptDraft(item.inputPrompt);
      setActiveView('generate');
    } else {
      if (item.outputSql || item.inputSql) {
        setSqlCodeDraft(item.outputSql || item.inputSql || '');
      }
      setActiveView(item.operation as AppView);
    }
  };

  const handleNavigateToView = (view: AppView, sqlContent?: string) => {
    if (sqlContent) {
      setSqlCodeDraft(sqlContent);
    }
    setActiveView(view);
  };

  const handleUsePromptFromDashboard = (prompt: string, dialect: SqlDialect) => {
    setSelectedDialect(dialect);
    setGeneratePromptDraft(prompt);
    setActiveView('generate');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onSelectView={(v) => {
          setActiveView(v);
        }}
        selectedDialect={selectedDialect}
        onSelectDialect={setSelectedDialect}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        onOpenSchema={() => setIsSchemaModalOpen(true)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Sticky Top Navbar */}
        <Navbar
          activeView={activeView}
          selectedDialect={selectedDialect}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onOpenSchema={() => setIsSchemaModalOpen(true)}
          onOpenHistory={() => setIsHistoryDrawerOpen(true)}
          historyCount={history.length}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {activeView === 'dashboard' && (
            <DashboardView
              onSelectView={setActiveView}
              selectedDialect={selectedDialect}
              onUsePrompt={handleUsePromptFromDashboard}
              onOpenSchema={() => setIsSchemaModalOpen(true)}
            />
          )}

          {activeView === 'generate' && (
            <GenerateSqlView
              key={generatePromptDraft || 'gen-default'}
              initialPrompt={generatePromptDraft}
              selectedDialect={selectedDialect}
              onSelectDialect={setSelectedDialect}
              onNavigateToView={handleNavigateToView}
              onShowToast={handleShowToast}
              onSaveHistory={handleSaveHistory}
            />
          )}

          {activeView === 'explain' && (
            <ExplainSqlView
              key={sqlCodeDraft || 'explain-default'}
              initialSql={sqlCodeDraft}
              selectedDialect={selectedDialect}
              onSelectDialect={setSelectedDialect}
              onNavigateToView={handleNavigateToView}
              onShowToast={handleShowToast}
              onSaveHistory={handleSaveHistory}
            />
          )}

          {activeView === 'debug' && (
            <DebugSqlView
              key={sqlCodeDraft || 'debug-default'}
              initialSql={sqlCodeDraft}
              selectedDialect={selectedDialect}
              onSelectDialect={setSelectedDialect}
              onNavigateToView={handleNavigateToView}
              onShowToast={handleShowToast}
              onSaveHistory={handleSaveHistory}
            />
          )}

          {activeView === 'optimize' && (
            <OptimizeSqlView
              key={sqlCodeDraft || 'optimize-default'}
              initialSql={sqlCodeDraft}
              selectedDialect={selectedDialect}
              onSelectDialect={setSelectedDialect}
              onNavigateToView={handleNavigateToView}
              onShowToast={handleShowToast}
              onSaveHistory={handleSaveHistory}
            />
          )}

          {activeView === 'practice' && (
            <PracticeView
              selectedDialect={selectedDialect}
              onSelectDialect={setSelectedDialect}
              onNavigateToView={handleNavigateToView}
              onShowToast={handleShowToast}
              onSaveHistory={handleSaveHistory}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-neutral-800/80 bg-neutral-900/40 py-5 text-center text-xs text-neutral-500 mt-auto">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              <strong>AI SQL Assistant</strong> &bull; Query Generation, Debugging &amp; Optimization
            </span>
            <span className="font-mono text-neutral-400 text-[11px]">
              PostgreSQL &bull; MySQL &bull; SQLite &bull; SQL Server &bull; Oracle
            </span>
          </div>
        </footer>
      </div>

      {/* Schema Scratchpad Modal */}
      <SchemaModal
        isOpen={isSchemaModalOpen}
        onClose={() => setIsSchemaModalOpen(false)}
        onShowToast={handleShowToast}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        onSelectHistoryItem={handleSelectHistoryItem}
        onShowToast={handleShowToast}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
