import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase'; // Make sure to import your Firebase config
import { onAuthStateChanged, signOut } from 'firebase/auth';
import '../styles/Navbar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate } from 'react-router-dom'; 

const Navbar = () => {
  const [user, setUser] = useState(null);

  const navigate = useNavigate(); // Use the useNavigate hook

  const handleNavigateToAdmin = () => {
    navigate('/admin'); // This function will handle navigation to the admin page
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      setUser(null);
    }).catch((error) => {
      console.error("Error logging out: ", error);
    });
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Personal Tutoring Services
        </Link>
        <Link to="/">Home</Link>
        {user && user.isAdmin && ( // Check if the user is an admin
          <button onClick={handleNavigateToAdmin}>Go to Admin Dashboard</button>
        )}
        <div className="navbar-auth">
          {user ? (
            <>
              <Link to="/user-profile" className="auth-link">User Profile</Link>
              <button onClick={handleLogout} className="auth-link">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-link">Login</Link>
              <Link to="/register" className="auth-link">Register</Link>
            </>
          )}
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
