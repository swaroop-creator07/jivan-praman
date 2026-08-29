import React, { useState, Suspense } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useUIStore } from '../../store/useUIStore';
import { useTranslation } from '../../i18n/useTranslation';
import { useAria } from '../../store/useAriaStore';
import { Menu, X } from 'lucide-react';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { PageLoader } from '../ui/Loading';
import { ErrorBoundary } from './ErrorBoundary';
import { ReadAloud } from '../ui/ReadAloud';
import { HelpButton } from '../ui/HelpButton';
import { CountdownBanner } from './CountdownBanner';

function LangControl() {
  const { language, setLanguage } = useUIStore();
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-1">
      <label htmlFor="langSelect" className="sr-only">{t('language')}</label>
      <select
        id="langSelect"
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        aria-label={t('language')}
        className="bg-transparent border border-[var(--color-border)] rounded-lg px-2 py-1 text-[var(--color-info)] font-bold cursor-pointer outline-none"
      >
        <option value="en">English</option>
        <option value="hi">हिंदी</option>
      </select>
    </div>
  );
}

export const Layout: React.FC = () => {
  const { setFontSize, fontSize } = useUIStore();
  const { t } = useTranslation();
  const { message: ariaMessage } = useAria();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: t('home'), path: '/' },
    { name: t('payments'), path: '/payments' },
    { name: t('documents'), path: '/documents' },
    { name: t('help'), path: '/help' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-[var(--color-info)] focus:text-white focus:px-6 focus:py-3 focus:rounded-lg focus:font-bold focus:text-lg">
        {t('nav_skip')}
      </a>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {ariaMessage}
      </div>
      <header className="app-header sticky top-0 z-50 bg-white shadow-sm">
        <div className="w-full px-4 sm:px-8 lg:px-12 h-20 flex items-center justify-between gap-6">
          {/* Branding (left) */}
          <Link to="/" className="flex items-center gap-3 min-w-0" onClick={() => setMobileMenuOpen(false)}>
            <span className="bg-[var(--color-primary)] text-black text-[11px] font-bold uppercase tracking-widest px-3 py-2 rounded">Prototype</span>
            <h1 className="font-bold text-xl sm:text-2xl tracking-tight" style={{ color: '#1A1A1A' }}>Jeevan Pramaan</h1>
          </Link>

          {/* Navigation (center, desktop) */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-8">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-lg font-bold whitespace-nowrap ${active ? 'underline decoration-2 underline-offset-4' : 'hover:underline hover:decoration-2 hover:underline-offset-4'}`}
                  style={{ color: active ? '#000080' : '#1A1A1A' }}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Accessibility controls (right, desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <ReadAloud />
            <LangControl />
            <div className="flex items-center gap-1" role="group" aria-label={t('font_size')}>
              <button onClick={() => setFontSize('small')} aria-pressed={fontSize === 'small'} aria-label="A- small text" className={`px-3 rounded-lg font-bold text-sm ${fontSize === 'small' ? 'bg-[var(--color-info)] text-white' : 'text-[var(--color-text)] border border-[var(--color-border)] hover:bg-slate-100'}`}>A-</button>
              <button onClick={() => setFontSize('base')} aria-pressed={fontSize === 'base'} aria-label="A default text" className={`px-3 rounded-lg font-bold ${fontSize === 'base' ? 'bg-[var(--color-info)] text-white' : 'text-[var(--color-text)] border border-[var(--color-border)] hover:bg-slate-100'}`}>A</button>
              <button onClick={() => setFontSize('large')} aria-pressed={fontSize === 'large'} aria-label="A+ large text" className={`px-4 rounded-lg font-bold text-lg ${fontSize === 'large' ? 'bg-[var(--color-info)] text-white' : 'text-[var(--color-text)] border border-[var(--color-border)] hover:bg-slate-100'}`}>A+</button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile expanded panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 flex flex-col gap-3">
            {navItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 rounded-lg font-bold text-lg ${active ? 'bg-slate-100 text-[var(--color-info)] underline decoration-2 underline-offset-4' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  {item.name}
                </Link>
              );
            })}
            <div className="border-t border-slate-200 pt-4 flex flex-col gap-3">
              <ReadAloud />
              <LangControl />
              <div className="flex items-center gap-1" role="group" aria-label={t('font_size')}>
                <button onClick={() => setFontSize('small')} aria-pressed={fontSize === 'small'} aria-label="A- small text" className={`px-3 rounded-lg font-bold text-sm ${fontSize === 'small' ? 'bg-[var(--color-info)] text-white' : 'text-[var(--color-text)] border border-[var(--color-border)] hover:bg-slate-100'}`}>A-</button>
                <button onClick={() => setFontSize('base')} aria-pressed={fontSize === 'base'} aria-label="A default text" className={`px-3 rounded-lg font-bold ${fontSize === 'base' ? 'bg-[var(--color-info)] text-white' : 'text-[var(--color-text)] border border-[var(--color-border)] hover:bg-slate-100'}`}>A</button>
                <button onClick={() => setFontSize('large')} aria-pressed={fontSize === 'large'} aria-label="A+ large text" className={`px-4 rounded-lg font-bold text-lg ${fontSize === 'large' ? 'bg-[var(--color-info)] text-white' : 'text-[var(--color-text)] border border-[var(--color-border)] hover:bg-slate-100'}`}>A+</button>
              </div>
            </div>
          </div>
        )}

        {/* Tricolor accent (4px) */}
        <div className="flex h-1 w-full" aria-hidden="true">
          <div className="flex-1" style={{ background: '#FF9933' }} />
          <div className="flex-1" style={{ background: '#FFFFFF' }} />
          <div className="flex-1" style={{ background: '#138808' }} />
        </div>
      </header>

       <Breadcrumbs />
       <CountdownBanner />
       <main id="main-content" tabIndex={-1} className="flex-1 max-w-[1100px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col outline-none">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader message="Loading page…" />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>

        <HelpButton />
     </div>
   );
};
