export function StatusBadge({ status, tone }: { status: string; tone?: string }) {
  const map: Record<string, string> = {
    Approved: 'bg-[var(--color-success)] text-white',
    Rejected: 'bg-[var(--color-danger)] text-white',
    Submitted: 'bg-[var(--color-warn-bg)] text-[var(--color-warn)] border border-[var(--color-warn)]',
    'Repository Uploaded': 'bg-[var(--color-warn-bg)] text-[var(--color-warn)] border border-[var(--color-warn)]',
    'Under PDA Verification': 'bg-[var(--color-warn-bg)] text-[var(--color-warn)] border border-[var(--color-warn)]',
  };
  const cls = map[tone || ''] || 'bg-slate-100 text-slate-700 border border-slate-300';
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${cls}`}>{status}</span>
  );
}
