// src/components/Badge/Badge.js
import React from 'react';
import PropTypes from 'prop-types';
import './Badge.css'; // Import the specific CSS for the Badge component

const Badge = ({ imageSrc, altText, link, className }) => {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="badge">
      <img src={imageSrc} alt={altText} className={`h-auto max-w-full ${className}`} />
    </a>
  );
};

Badge.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  altText: PropTypes.string.isRequired,
  link: PropTypes.string,
  className: PropTypes.string
};

export default Badge;
