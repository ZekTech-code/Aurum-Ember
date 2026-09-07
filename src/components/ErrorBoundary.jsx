import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.recoverTimer = null;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
    clearTimeout(this.recoverTimer);
    this.recoverTimer = setTimeout(() => {
      this.setState({ hasError: false, error: null });
    }, 1200);
  }

  componentWillUnmount() {
    clearTimeout(this.recoverTimer);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2147483647, background: '#0F0E0C', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.12)', borderTopColor: '#c5a059', animation: 'aeRecoverSpin 0.8s linear infinite' }} />
          <style>{`@keyframes aeRecoverSpin { to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }

    return this.props.children;
  }
}