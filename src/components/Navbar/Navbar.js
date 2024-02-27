import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar, NavbarContent, NavbarItem } from "@nextui-org/react";
import PhotonLogo from "../PhotonLogo";
import "./CustomNavbar.css";
import { useWindowSize } from "../../hooks/useWindowSize";


const CustomNavbar = () => {
  const { width } = useWindowSize();
  const [isMenuVisible, setIsMenuVisible] = useState(false); // Added state to manage mobile menu visibility
  const isMobile = width < 768; // Example breakpoint for mobile devices

  return (
    <Navbar isBordered variant="sticky" className="custom-navbar">
      <NavbarContent className={`navbar-content ${isMobile ? 'mobile' : ''}`}>
        {isMobile && (
         <div className="hamburger-menu" onClick={() => setIsMenuVisible(!isMenuVisible)}>
         <div className="bar"></div>
         <div className="bar"></div>
         <div className="bar"></div>
       </div>       
        )}
        {(!isMobile || isMenuVisible) && (
          <>
             <div className="navbar-section">
              <NavbarItem className="navbar-item">
                <Link to="/">Home</Link>
              </NavbarItem>
              <NavbarItem className="navbar-item">
                <Link to="/cine">Cine</Link>
              </NavbarItem>
              <NavbarItem className="navbar-item">
                <Link to="/foto">Foto</Link>
              </NavbarItem>
            </div>
            <div className="logo-section">
              <PhotonLogo />
            </div>
            <div className="navbar-section">
              <NavbarItem className="navbar-item">
                <Link to="/pricing">Pricing</Link>
              </NavbarItem>
              <NavbarItem className="navbar-item">
                <Link to="/contact">Contact</Link>
              </NavbarItem>
              <NavbarItem className="navbar-item">
                <Link to="/testimonial">Testimonial</Link>
              </NavbarItem>
            </div>
          </>
        )}
      </NavbarContent>
    </Navbar>
  );
};

export default CustomNavbar;
