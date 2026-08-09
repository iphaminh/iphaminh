// src/pages/Blog/Blog.js
import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO/SEO';
import FooterShowcase from '../../components/FooterShowcase/FooterShowcase';
import { blogPosts } from '../../data/blogPosts';
import './Blog.css';
import { routeMeta } from '../../data/routeMeta';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function Blog() {
  return (
    <>
      <SEO
        title={routeMeta['/blog'].title}
        description={routeMeta['/blog'].description}
        canonical={routeMeta['/blog'].canonical}
        canonical="https://www.phaminh.com/blog"
      />

      <div className="blog-page">
        <header className="blog-page-header">
          <h1 className="blog-page-title">Wedding Stories & Advice</h1>
          <p className="blog-page-subtitle">
            Pricing guides, venue roundups, and planning advice for couples in the
            Bay Area and Northwest Arkansas — from a wedding videographer who has
            filmed over a hundred of them.
          </p>
        </header>

        <div className="blog-grid">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="blog-card"
            >
              <span className="blog-card-category">{post.category}</span>
              <h2 className="blog-card-title">{post.title}</h2>
              <p className="blog-card-excerpt">{post.description}</p>
              <div className="blog-card-meta">
                <span>{formatDate(post.date)}</span>
                <span>{post.readTime} read</span>
              </div>
              <span className="blog-card-read-more">Read more →</span>
            </Link>
          ))}
        </div>
      </div>

      <FooterShowcase />
    </>
  );
}
