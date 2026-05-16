import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar, NavbarContent, NavbarItem } from "@nextui-org/react";
import PhotonLogo from "../PhotonLogo";
import "./CustomNavbar.css";
import { useWindowSize } from "../../hooks/useWindowSize";


const CustomNavbar = () => {
  const { width } = useWindowSize();
  const [isMenuVisible, setIsMenuVisible] = useState(false); // Added state to manage mobile menu visibility
  const isMobile = width < 1024; // Use tablet+mobile for hamburger menu
  const closeMenu = () => setIsMenuVisible(false);

  return (
    <Navbar isBordered variant="sticky" className="custom-navbar">
      <NavbarContent className={`navbar-content ${isMobile ? 'mobile' : ''}`}>
        {isMobile && (
          <button
            type="button"
            className="hamburger-menu"
            aria-label={isMenuVisible ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuVisible}
            onClick={() => setIsMenuVisible(!isMenuVisible)}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        )}
        {(!isMobile || isMenuVisible) && (
          <>
             <div className="navbar-section">
              <NavbarItem className="navbar-item">
                <Link to="/" onClick={closeMenu}>Home</Link>
              </NavbarItem>
              <NavbarItem className="navbar-item">
                <Link to="/cine" onClick={closeMenu}>Cine</Link>
              </NavbarItem>
              <NavbarItem className="navbar-item">
                <Link to="/foto" onClick={closeMenu}>Foto</Link>
              </NavbarItem>
            </div>
            <div className="logo-section">
              <PhotonLogo />
            </div>
            <div className="navbar-section">
              <NavbarItem className="navbar-item">
                <Link to="/pricing" onClick={closeMenu}>Pricing</Link>
              </NavbarItem>
              <NavbarItem className="navbar-item">
                <Link to="/contact" onClick={closeMenu}>Contact</Link>
              </NavbarItem>
              <NavbarItem className="navbar-item">
                <Link to="/testimonials" onClick={closeMenu}>Testimonials</Link>
              </NavbarItem>
            </div>
          </>
        )}
      </NavbarContent>
    </Navbar>
  );
};

export default CustomNavbar;
