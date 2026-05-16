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
          <p>Please refresh the page or <a href="/">return home</a>.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
