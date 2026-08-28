/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { useUIStore } from './store/useUIStore';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { NotFound } from './components/ui/NotFound';

import PensionerDashboard from './features/pensioner/Dashboard';
import PramaanHub from './features/pensioner/pramaan';
import PramaanStatus from './features/pensioner/pramaan/Status';
import FindPramaanId from './features/pensioner/pramaan/FindId';
import DownloadDLC from './features/pensioner/pramaan/Download';
import GeneratePramaan from './features/pensioner/pramaan/Generate';
import History from './features/pensioner/pramaan/History';
import Payments from './features/pensioner/payments';
import Documents from './features/pensioner/documents';
import Help from './features/pensioner/help';
import Troubleshoot from './features/pensioner/troubleshoot';

export default function App() {
  const { fontSize } = useUIStore();

  useEffect(() => {
    const html = document.documentElement;
    if (fontSize === 'small') {
      html.style.fontSize = '16px';
    } else if (fontSize === 'large') {
      html.style.fontSize = '20px';
    } else {
      html.style.fontSize = '18px';
    }
  }, [fontSize]);

  const language = useUIStore((s) => s.language);
  useEffect(() => {
    document.documentElement.lang = language === 'hi' ? 'hi' : 'en';
  }, [language]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<PensionerDashboard />} />
            <Route path="pramaan">
              <Route index element={<PramaanHub />} />
              <Route path="status" element={<PramaanStatus />} />
              <Route path="find-id" element={<FindPramaanId />} />
              <Route path="download" element={<DownloadDLC />} />
              <Route path="generate" element={<GeneratePramaan />} />
              <Route path="history" element={<History />} />
            </Route>
            <Route path="payments" element={<Payments />} />
            <Route path="documents" element={<Documents />} />
            <Route path="help" element={<Help />} />
            <Route path="troubleshoot" element={<Troubleshoot />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

