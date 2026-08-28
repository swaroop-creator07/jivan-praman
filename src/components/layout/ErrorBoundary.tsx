import React from 'react';
import { ErrorState } from '../ui/ErrorState';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends (React as any).Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleReset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-2xl mx-auto py-12 px-4">
          <ErrorState
            title="This page crashed"
            message={this.state.error?.message || 'An unexpected error occurred. Your data is safe — please try reloading.'}
            onRetry={() => { this.handleReset(); window.location.reload(); }}
          />
          <details className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-500 overflow-auto">
            <summary className="font-bold cursor-pointer">Technical details</summary>
            <pre className="whitespace-pre-wrap mt-2">{String(this.state.error?.stack ?? this.state.error)}</pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
