// src/components/Badge/Badge.js
import React from 'react';
import PropTypes from 'prop-types';

const Badge = ({ imageSrc, altText, link }) => {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className="badge">
      <img src={imageSrc} alt={altText} className="h-auto max-w-full" />
    </a>
  );
};

Badge.propTypes = {
  imageSrc: PropTypes.string.isRequired,
  altText: PropTypes.string.isRequired,
  link: PropTypes.string,
};

export default Badge;
