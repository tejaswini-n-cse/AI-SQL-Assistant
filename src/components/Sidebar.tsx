import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  Bug,
  Zap,
  GraduationCap,
  Database,
  History,
  Sun,
  Moon,
  DatabaseZap,
} from 'lucide-react';
import { AppView, SqlDialect } from '../types.ts';
import { SQL_DIALECTS } from '../data/mockSchemas.ts';

interface SidebarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  selectedDialect: SqlDialect;
  onSelectDialect: (dialect: SqlDialect) => void;
  historyCount: number;
  onOpenHistory: () => void;
  onOpenSchema: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  activeView,
  onSelectView,
  selectedDialect,
  onSelectDialect,
  historyCount,
  onOpenHistory,
  onOpenSchema,
  isDark,
  onToggleTheme,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const navItems = [
    {
      id: 'dashboard' as AppView,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'generate' as AppView,
      label: 'Generate SQL',
      icon: Sparkles,
      badge: 'Natural Lang',
    },
    {
      id: 'explain' as AppView,
      label: 'Explain SQL',
      icon: BookOpen,
      badge: null,
    },
    {
      id: 'debug' as AppView,
      label: 'Debug SQL',
      icon: Bug,
      badge: null,
    },
    {
      id: 'optimize' as AppView,
      label: 'Optimize SQL',
      icon: Zap,
      badge: 'Performance',
    },
    {
      id: 'practice' as AppView,
      label: 'Practice Mode',
      icon: GraduationCap,
      badge: 'Quiz',
    },
  ];

  const handleNavClick = (view: AppView) => {
    onSelectView(view);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-neutral-900 border-r border-neutral-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
            <div
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <DatabaseZap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-neutral-100 leading-none tracking-tight flex items-center gap-1.5">
                  AI SQL Assistant
                </h1>
                <span className="text-[11px] font-medium text-indigo-400">
                  v2.0 &bull; Multi-Dialect
                </span>
              </div>
            </div>
          </div>

          {/* Global Dialect Selector */}
          <div className="p-4 border-b border-neutral-800/80 bg-neutral-950/40">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Active SQL Dialect
            </label>
            <div className="relative">
              <select
                value={selectedDialect}
                onChange={(e) => onSelectDialect(e.target.value as SqlDialect)}
                className="w-full appearance-none bg-neutral-900 border border-neutral-700/80 rounded-lg px-3 py-2 text-xs font-semibold text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer pr-8"
              >
                {SQL_DIALECTS.map((dialect) => (
                  <option key={dialect} value={dialect} className="bg-neutral-900 text-neutral-200">
                    {dialect}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-neutral-400">
                <Database className="h-3.5 w-3.5 text-indigo-400" />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? 'text-indigo-400' : 'text-neutral-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isActive
                          ? 'bg-indigo-500/20 text-indigo-300'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Tools & Scratchpad */}
          <div className="p-3 pt-2 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Workbenches
            </div>
            <button
              onClick={() => {
                onOpenSchema();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition"
            >
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-emerald-400" />
                <span>Schema Scratchpad</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                2 DBs
              </span>
            </button>

            <button
              onClick={() => {
                onOpenHistory();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition"
            >
              <div className="flex items-center gap-3">
                <History className="h-4 w-4 text-amber-400" />
                <span>Query History</span>
              </div>
              {historyCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-800 space-y-3 bg-neutral-950/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-medium">Interface Theme</span>
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition flex items-center gap-1.5 text-xs"
              title="Toggle Dark / Light Theme"
            >
              {isDark ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>

          <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Powered by Gemini 3.7</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Ready
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
