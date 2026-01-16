import React, { Component, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Local Font Imports (Offline Support)
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/press-start-2p'; // Only 400 available
import '@fontsource/russo-one'; // Only 400 available

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Type776 Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: '#ff5555', backgroundColor: '#111', height: '100vh', fontFamily: 'monospace' }}>
          <h1>⚠️ Erro Crítico</h1>
          <p>Ocorreu um erro ao renderizar a aplicação.</p>
          <pre style={{ backgroundColor: '#000', padding: '20px', borderRadius: '8px', overflow: 'auto', marginTop: '20px' }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);