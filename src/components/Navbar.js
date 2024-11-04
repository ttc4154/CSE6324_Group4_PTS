import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../firebase'; // Make sure to import your Firebase config
import { onAuthStateChanged, signOut } from 'firebase/auth';
import '../styles/Navbar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate } from 'react-router-dom'; 
import { useAuthState } from 'react-firebase-hooks/auth';

const Navbar = () => {
  const [userLogout] = useAuthState(auth);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
    // Optionally,  can redirect or perform other actions after logout
  };
  const [user, setUser] = useState(null);
  const location = useLocation();

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

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Personal Tutoring Services
        </Link>
        {user && user.isAdmin && ( // Check if the user is an admin
          <button onClick={handleNavigateToAdmin}>Go to Admin Dashboard</button>
        )}
        <div className="navbar-auth">
      {user ? (
        <>
          {/* Conditionally render User Profile link */}
          {location.pathname !== '/user-profile' && (
            <Link to="/user-profile">User Profile</Link>
          )}
          <Link to="/" onClick={handleLogout} className="auth-link">Logout</Link>
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
