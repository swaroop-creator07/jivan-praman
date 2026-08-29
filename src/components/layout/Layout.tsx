import React, { useState, Suspense } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useUIStore } from '../../store/useUIStore';
import { useTranslation } from '../../i18n/useTranslation';
import { useAria } from '../../store/useAriaStore';
import { Menu, X, Globe } from 'lucide-react';
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
      <Globe className="w-4 h-4 text-slate-400" aria-hidden="true" />
      <label htmlFor="langSelect" className="sr-only">{t('language')}</label>
      <select
        id="langSelect"
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        aria-label={t('language')}
        className="bg-transparent border-none text-slate-600 focus:ring-0 cursor-pointer outline-none font-bold"
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
      <header className="sticky top-0 z-50 shadow-sm">
        {/* National tricolor strip */}
        <div className="tricolor-strip">
          <div className="tricolor-saffron"></div>
          <div className="tricolor-white"></div>
          <div className="tricolor-green"></div>
        </div>

        {/* Slim utility bar */}
        <div className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-end gap-3 sm:gap-4">
            <LangControl />
            <div className="flex items-center gap-1 border-l border-slate-200 pl-3 sm:pl-4" role="group" aria-label={t('font_size')}>
              <button onClick={() => setFontSize('small')} aria-pressed={fontSize === 'small'} aria-label="A- small text" className={`w-8 h-8 rounded-md font-bold text-sm ${fontSize === 'small' ? 'bg-[var(--color-info)] text-white' : 'text-slate-600 hover:bg-slate-200'}`}>A-</button>
              <button onClick={() => setFontSize('base')} aria-pressed={fontSize === 'base'} aria-label="A default text" className={`w-8 h-8 rounded-md font-bold ${fontSize === 'base' ? 'bg-[var(--color-info)] text-white' : 'text-slate-600 hover:bg-slate-200'}`}>A</button>
              <button onClick={() => setFontSize('large')} aria-pressed={fontSize === 'large'} aria-label="A+ large text" className={`w-8 h-8 rounded-md font-bold text-lg ${fontSize === 'large' ? 'bg-[var(--color-info)] text-white' : 'text-slate-600 hover:bg-slate-200'}`}>A+</button>
            </div>
            <ReadAloud />
          </div>
        </div>

        {/* Primary bar */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 min-w-0" onClick={() => setMobileMenuOpen(false)}>
              <div className="w-11 h-11 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-text)] flex items-center justify-center font-bold text-lg shrink-0">UP</div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-bold text-xl tracking-tight text-[var(--color-text)] leading-tight">UPDP</h1>
                  <span className="bg-[var(--color-primary)] text-[var(--color-primary-text)] text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shrink-0">{t('prototype')}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight hidden sm:block">Unified Pension Delivery Platform</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-7">
              {navItems.map(item => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative text-sm font-bold transition-colors whitespace-nowrap pb-1 ${active ? 'text-[var(--color-info)]' : 'text-slate-600 hover:text-[var(--color-info)]'}`}
                  >
                    {item.name}
                    {active && <span className="absolute left-0 -bottom-px h-0.5 w-full bg-[var(--color-info)] rounded-full" />}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg shrink-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 flex flex-col gap-2">
              {navItems.map(item => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`p-3 rounded-lg font-bold text-lg ${active ? 'bg-slate-100 text-[var(--color-info)]' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          )}
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
