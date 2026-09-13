import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2>Something went wrong.</h2>
          <p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                font: 'inherit',
                padding: '0.6rem 1.4rem',
                cursor: 'pointer',
                background: '#111',
                color: '#fff',
                border: 0,
                borderRadius: 4,
              }}
            >
              Reload the page
            </button>
          </p>
          <p>
            Or <a href="/">return home</a>. If this keeps happening, email{' '}
            <a href="mailto:phaminh@outlook.com">phaminh@outlook.com</a>.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
