import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('SATCS error boundary:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 32,
            fontFamily: 'Inter, system-ui, sans-serif',
            background: '#fef2f2',
            color: '#7f1d1d',
            minHeight: '100vh',
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
            Error al renderizar el dashboard
          </h1>
          <pre
            style={{
              fontSize: 12,
              background: '#fff',
              padding: 12,
              borderRadius: 8,
              overflow: 'auto',
              border: '1px solid #fecaca',
            }}
          >
            {String(this.state.error?.stack ?? this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('No se encontró el elemento root');
}

ReactDOM.createRoot(rootEl).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
