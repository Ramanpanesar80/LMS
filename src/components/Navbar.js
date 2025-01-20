import React from 'react';
import './Navbar.css';
import logo from './images/t2.jpg'; // Correct path within the 'components' directory


const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo-container">
      <img src={logo} alt="Logo" className="logo" />


      </div>
      <div className="navbar-links">
        <a href="tel:+12340000000" className="navbar-link">+1 (123)-000-0000</a>
      </div>
    </nav>
  );
};

export default Navbar;