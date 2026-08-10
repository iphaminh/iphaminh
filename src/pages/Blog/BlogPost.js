// src/pages/Blog/BlogPost.js
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SEO from '../../components/SEO/SEO';
import FooterShowcase from '../../components/FooterShowcase/FooterShowcase';
import { getBlogPost } from '../../data/blogPosts';
import './BlogPost.css';

const SITE_URL = 'https://www.phaminh.com';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

// Render **bold** and [text](url) markdown inline
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const [, label, href] = link;
      if (href.startsWith('/')) {
        return <Link key={i} to={href}>{label}</Link>;
      }
      return <a key={i} href={href} target="_blank" rel="noreferrer">{label}</a>;
    }
    return part;
  });
}

function renderContent(content) {
  return content.split('\n\n').map((block, i) => {
    if (!block.trim()) return null;
    // List items starting with -
    if (block.trim().startsWith('- ') || block.includes('\n- ')) {
      const lines = block.split('\n').filter(Boolean);
      return (
        <ul key={i} style={{ paddingLeft: '1.5rem', marginBottom: '1.25rem' }}>
          {lines.map((line, j) => (
            <li key={j} style={{ marginBottom: '0.4rem' }}>
              {renderInline(line.replace(/^- /, ''))}
            </li>
          ))}
        </ul>
      );
    }
    return <p key={i}>{renderInline(block)}</p>;
  });
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <div className="blog-post-not-found">
        <Helmet>
          <title>Post Not Found | Phaminh Cinematography</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <h1>Post not found</h1>
        <p><Link to="/blog">← Back to blog</Link></p>
      </div>
    );
  }

  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;

  // Matches the prerendered JSON-LD type (scripts/prerender.js) so the static
  // and hydrated blocks never disagree about what this page is.
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Person',
      name: 'Minh Pham',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Phaminh Cinematography',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/images/logo.png` },
    },
    url: canonicalUrl,
    // post.image may be an absolute CDN URL (real film frames) or site-relative
    image: post.image
      ? (post.image.startsWith('http') ? post.image : `${SITE_URL}${post.image}`)
      : `${SITE_URL}/assets/seo/phaminh-wedding-cover.webp`,
  };

  // FAQ schema if post has FAQs
  const faqLd = post.faqs && post.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  } : null;

  const schemas = faqLd ? [articleLd, faqLd] : [articleLd];

  return (
    <>
      <SEO
        title={`${post.title} | Phaminh Cinematography`}
        description={post.description}
        canonical={canonicalUrl}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(schemas)}</script>
      </Helmet>

      <article className="blog-post-page">
        <Link to="/blog" className="blog-post-back">← All Posts</Link>

        <header className="blog-post-header">
          <p className="blog-post-category">{post.category} · {post.location}</p>
          <h1 className="blog-post-title">{post.title}</h1>
          <div className="blog-post-meta">
            <span>{formatDate(post.date)}</span>
            <span>{post.readTime} read</span>
            <span>By Minh Pham</span>
          </div>
        </header>

        {post.image && (
          <figure className="blog-post-hero">
            <img
              src={post.image}
              alt={`A real wedding film frame by Phaminh Cinematography`}
              width="1280"
              height="720"
              onError={(e) => { e.currentTarget.src = '/assets/seo/phaminh-wedding-cover.webp'; }}
            />
            <figcaption>From a real wedding film by Phaminh Cinematography</figcaption>
          </figure>
        )}

        <div className="blog-post-body">
          {post.sections.map((section, i) => {
            if (section.type === 'intro') {
              return <div key={i}>{renderContent(section.content)}</div>;
            }
            return (
              <div key={i} className="blog-post-section">
                <h2 className="blog-post-section-heading">{section.heading}</h2>
                {renderContent(section.content)}
              </div>
            );
          })}
        </div>

        {post.faqs && post.faqs.length > 0 && (
          <div className="blog-faq-section">
            <h2 className="blog-faq-title">Frequently Asked Questions</h2>
            {post.faqs.map((faq, i) => (
              <div key={i} className="blog-faq-item">
                <h3 className="blog-faq-question">{faq.question}</h3>
                <p className="blog-faq-answer">{faq.answer}</p>
              </div>
            ))}
          </div>
        )}

        <div className="blog-post-ctas">
          <Link to="/contact" className="blog-post-cta blog-post-cta-primary">
            Book Your Date
          </Link>
          <Link to="/pricing" className="blog-post-cta blog-post-cta-secondary">
            View Packages
          </Link>
          <Link to="/cine" className="blog-post-cta blog-post-cta-secondary">
            Watch Films
          </Link>
        </div>
      </article>

      <FooterShowcase />
    </>
  );
}
