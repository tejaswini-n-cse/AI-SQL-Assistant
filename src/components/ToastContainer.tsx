import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types.ts';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-4 rounded-xl border shadow-2xl flex items-start justify-between gap-3 transition-all duration-300 animate-in slide-in-from-bottom-3 ${
            t.type === 'success'
              ? 'bg-neutral-900 border-emerald-500/40 text-neutral-100 shadow-emerald-500/10'
              : t.type === 'error'
              ? 'bg-neutral-900 border-rose-500/40 text-neutral-100 shadow-rose-500/10'
              : 'bg-neutral-900 border-indigo-500/40 text-neutral-100 shadow-indigo-500/10'
          }`}
        >
          <div className="flex items-start gap-3">
            {t.type === 'success' && (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            {t.type === 'error' && (
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            {t.type === 'info' && (
              <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-sm font-semibold text-neutral-200">{t.title}</h4>
              {t.message && (
                <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{t.message}</p>
              )}
            </div>
          </div>

          <button
            onClick={() => onDismiss(t.id)}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
