import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import PhotonLogo from '../PhotonLogo';
import './CustomNavbar.css';
import { useWindowSize } from '../../hooks/useWindowSize';

const CustomNavbar = () => {
  const { width } = useWindowSize();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = width < 1024;
  const close = () => setIsMenuOpen(false);

  return (
    <header className="custom-navbar">
      <nav className={`navbar-content ${isMobile && isMenuOpen ? 'mobile' : ''}`} aria-label="Main navigation">
        {isMobile && (
          <button
            type="button"
            className="hamburger-menu"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </button>
        )}

        {(!isMobile || isMenuOpen) && (
          <>
            <ul className="navbar-section" role="list">
              <li className="navbar-item">
                <NavLink to="/" onClick={close}>Home</NavLink>
              </li>
              <li className="navbar-item">
                <NavLink to="/cine" onClick={close}>Cine</NavLink>
              </li>
              <li className="navbar-item">
                <NavLink to="/foto" onClick={close}>Foto</NavLink>
              </li>
            </ul>

            <div className="logo-section">
              <Link to="/" onClick={close} aria-label="Phaminh Cinematography home">
                <PhotonLogo />
              </Link>
            </div>

            <ul className="navbar-section" role="list">
              <li className="navbar-item">
                <NavLink to="/pricing" onClick={close}>Pricing</NavLink>
              </li>
              <li className="navbar-item">
                <NavLink to="/blog" onClick={close}>Blog</NavLink>
              </li>
              <li className="navbar-item">
                <NavLink to="/contact" onClick={close}>Contact</NavLink>
              </li>
            </ul>
          </>
        )}
      </nav>
    </header>
  );
};

export default CustomNavbar;
