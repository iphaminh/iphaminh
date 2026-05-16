import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO/SEO';

const NotFound = () => {
  return (
    <>
      <SEO
        title="Page Not Found | Phaminh Cinematography"
        description="The page you're looking for doesn't exist."
      />
      <div style={{ textAlign: 'center', padding: '6rem 2rem', minHeight: '60vh' }}>
        <h1 style={{ fontSize: '6rem', margin: 0, fontFamily: 'Playfair Display, serif' }}>404</h1>
        <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: '1rem' }}>Page Not Found</h2>
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
            fontFamily: 'Playfair Display, serif',
            letterSpacing: '0.05em',
          }}
        >
          Back to Home
        </Link>
      </div>
    </>
  );
};

export default NotFound;
