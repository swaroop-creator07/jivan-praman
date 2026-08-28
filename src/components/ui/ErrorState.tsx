import { AlertTriangle, RefreshCw, WifiOff, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

type Variant = 'error' | 'offline' | 'empty';

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this page. Please check your connection and try again.',
  onRetry,
  variant = 'error',
  showHome = true,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: Variant;
  showHome?: boolean;
}) {
  const Icon = variant === 'offline' ? WifiOff : AlertTriangle;
  const tone = variant === 'empty' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-[var(--color-danger-bg)] border-[var(--color-danger)]/20 text-[var(--color-danger)]';

  return (
    <div role="alert" aria-live="assertive" className={`rounded-2xl border-2 p-8 flex flex-col items-center text-center gap-4 ${tone}`}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${variant === 'empty' ? 'bg-slate-100 text-slate-400' : 'bg-white border border-current/20'}`}>
        <Icon className="w-8 h-8" aria-hidden="true" />
      </div>
      <div>
        <h3 className={`text-xl font-bold ${variant === 'empty' ? 'text-slate-900' : ''}`}>{title}</h3>
        <p className={`mt-2 max-w-md leading-relaxed ${variant === 'empty' ? 'text-slate-600' : 'opacity-90'}`}>{message}</p>
      </div>
      <div className="flex flex-wrap gap-3 justify-center mt-2">
        {onRetry && (
          <button onClick={onRetry} className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-800 font-bold px-6 py-3 rounded-xl hover:bg-slate-50 shadow-sm focus-visible:outline-none">
            <RefreshCw className="w-5 h-5" aria-hidden="true" /> Try again
          </button>
        )}
        {showHome && (
          <Link to="/" className="inline-flex items-center gap-2 btn-primary px-6 py-3 rounded-xl">
            <Home className="w-5 h-5" aria-hidden="true" /> Go to Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}

export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl">
      <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
      <span className="flex-1 font-medium text-sm">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="font-bold text-sm underline hover:no-underline shrink-0">Retry</button>
      )}
    </div>
  );
}
