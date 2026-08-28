import { Loader2 } from 'lucide-react';

export function Spinner({ size = 24, label = 'Loading…' }: { size?: number; label?: string }) {
  return (
    <span role="status" aria-live="polite" aria-label={label} className="inline-flex items-center gap-3">
      <Loader2 className="animate-spin text-[var(--color-info)]" style={{ width: size, height: size }} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function PageLoader({ message = 'Loading, please wait…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4" role="status" aria-live="polite" aria-busy="true">
      <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
        <Loader2 className="w-7 h-7 animate-spin text-[var(--color-info)]" aria-hidden="true" />
      </div>
      <p className="text-lg font-semibold text-slate-600 animate-pulse">{message}</p>
      <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full w-1/2 bg-[var(--color-info)] rounded-full animate-[shimmer_1.2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} aria-hidden="true" />;
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-10 w-full mt-2" />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 flex gap-4">
          <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
