import React from 'react';
import {
  Menu,
  Database,
  History,
  Sparkles,
  BookOpen,
  Bug,
  Zap,
  GraduationCap,
  LayoutDashboard,
  Sun,
  Moon,
  DatabaseZap,
} from 'lucide-react';
import { AppView, SqlDialect } from '../types.ts';

interface NavbarProps {
  activeView: AppView;
  selectedDialect: SqlDialect;
  onOpenMobileNav: () => void;
  onOpenSchema: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Navbar({
  activeView,
  selectedDialect,
  onOpenMobileNav,
  onOpenSchema,
  onOpenHistory,
  historyCount,
  isDark,
  onToggleTheme,
}: NavbarProps) {
  const getViewTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return { title: 'Dashboard', icon: LayoutDashboard };
      case 'generate':
        return { title: 'Natural Language → SQL', icon: Sparkles };
      case 'explain':
        return { title: 'SQL Query Explainer', icon: BookOpen };
      case 'debug':
        return { title: 'SQL Debugger & Diagnostics', icon: Bug };
      case 'optimize':
        return { title: 'Performance Optimizer', icon: Zap };
      case 'practice':
        return { title: 'SQL Practice Arena', icon: GraduationCap };
      default:
        return { title: 'AI SQL Assistant', icon: DatabaseZap };
    }
  };

  const { title, icon: Icon } = getViewTitle();

  return (
    <header className="sticky top-0 z-30 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left Side: Mobile Menu Button & View Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileNav}
            className="lg:hidden p-2 rounded-lg bg-neutral-800 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-700 transition"
            title="Open Navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-indigo-400 hidden sm:inline" />
            <h2 className="text-sm sm:text-base font-bold text-neutral-100">{title}</h2>
          </div>
        </div>

        {/* Right Side: Dialect Badge & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dialect Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>{selectedDialect}</span>
          </div>

          {/* Schema Scratchpad Button */}
          <button
            onClick={onOpenSchema}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700/60 transition cursor-pointer"
            title="Open Schema Scratchpad"
          >
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Schemas</span>
          </button>

          {/* History Drawer Button */}
          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700/60 transition relative cursor-pointer"
            title="Open Query History"
          >
            <History className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="h-4 min-w-[16px] px-1 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-mono font-bold flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
            title="Toggle Theme"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
