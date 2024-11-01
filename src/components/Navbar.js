import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          PTS
        </Link>
        {/*<span className="navbar-subtitle">Personal Tutoring Service</span>*/}
        <div className="advertisement-banner">
          <p>Advertise Here! Get 20% Off Your First Lesson!</p>
        </div>
        <div className="navbar-auth">
          <Link to="/login" className="auth-link">Login</Link>
          <Link to="/register" className="auth-link">Register</Link>
      </div>
        <div className="navbar-search">
          <input
            type="text"
            placeholder="Search..."
            className="navbar-search-input"
          />
          <button className="navbar-search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
