import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO/SEO';

const NotFound = () => {
  return (
    <>
      <SEO
        title="Page Not Found | Phaminh Cinematography"
        description="The page you're looking for doesn't exist."
      >
        <meta name="robots" content="noindex" />
      </SEO>
      <div style={{ textAlign: 'center', padding: '6rem 2rem', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 400, margin: 0, fontFamily: 'Cormorant Garamond, Georgia, serif' }}>404</h1>
        <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 400, marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ marginBottom: '2rem', color: '#555' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-block',
            padding: '0.75rem 2rem',
            background: '#333',
            color: '#fff',
            textDecoration: 'none',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.75rem',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Back to Home
        </Link>
      </div>
    </>
  );
};

export default NotFound;
