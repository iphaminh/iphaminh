// src/components/CustomNavbar.js
import React from "react";
import {
  Navbar,
  NavbarContent,
  NavbarItem,
  Link,
} from "@nextui-org/react";
import PhotonLogo from "../PhotonLogo";
import "./CustomNavbar.css"; // Make sure this import is correct

const CustomNavbar = () => {
  return (
    <Navbar isBordered variant="sticky" className="custom-navbar">
      <NavbarContent className="navbar-content">
        <div className="navbar-section">
          <NavbarItem className="navbar-item">
            <Link href="#">Hwewewome</Link>
          </NavbarItem>
          <NavbarItem className="navbar-item">
            <Link href="#">Cine</Link>
          </NavbarItem>
          <NavbarItem className="navbar-item">
            <Link href="#">Foto</Link>
          </NavbarItem>
        </div>

        <div className="logo-section">
          <PhotonLogo />
        </div>

        <div className="navbar-section">
          <NavbarItem className="navbar-item">
            <Link href="#">Pricing</Link>
          </NavbarItem>
          <NavbarItem className="navbar-item">
            <Link href="#">Contact</Link>
          </NavbarItem>
          <NavbarItem className="navbar-item">
            <Link href="#">Testimonial</Link>
          </NavbarItem>
        </div>
      </NavbarContent>
    </Navbar>
  );
};

export default CustomNavbar;
