import { useState, ReactNode } from 'react';
import { useTranslation } from '../../i18n/useTranslation';

type GlossaryTerm = 'glossary_ppo' | 'glossary_pda' | 'glossary_authority';

export function Glossary({ term, children }: { term: GlossaryTerm; children: ReactNode }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center gap-1">
      {children}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        aria-expanded={open}
        aria-label={t(term)}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-info)] text-white text-xs font-bold leading-none"
      >
        ?
      </button>
      {open && (
        <span id={`gloss-${term}`} className="glossary-pop" role="tooltip">
          {t(term)}
        </span>
      )}
    </span>
  );
}
