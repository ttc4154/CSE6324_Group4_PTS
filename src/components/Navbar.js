import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../firebase'; // Make sure to import your Firebase config
import { onAuthStateChanged, signOut } from 'firebase/auth';
import '../styles/Navbar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate } from 'react-router-dom'; 
import { useAuthState } from 'react-firebase-hooks/auth';
import { useUser } from '../context/UserContext'; // Import useUser hook

const Navbar = () => {
  const [userLogout] = useAuthState(auth);
  const { profilePicture } = useUser(); // Access profilePicture from context
  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
    // Optionally,  can redirect or perform other actions after logout
  };
  const [user, setUser] = useState(null);
  const location = useLocation();

  const navigate = useNavigate(); // Use the useNavigate hook
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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
        <div className="navbar-search">
          <input
            type="text"
            placeholder="What would you like to learn?"
          />
          <button className="navbar-search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>
        {/*user && user.isAdmin && ( // Check if the user is an admin
          <button onClick={handleNavigateToAdmin}>Go to Admin Dashboard</button>
        )*/}
        
        <div className="navbar-auth">
          {user ? (
            <div className="menu-dropdown">
              <button className="menu-button">
              {/* Profile picture and username */}
              <img  src={profilePicture || '/default-profile-pic.png'} alt="Profile" className="profile-pic" />
                <span>{user.displayName || 'Username'}</span>
            </button>
              <div className="menu-content">                  
                  <Link to="/user-profile">User Profile</Link>
                  <Link to="/chat">Live Chat</Link>
                  <Link to="/my-courses">My Courses</Link>
                  <Link to="/my-schedules">My Schedules</Link>
                  <Link to="/my-messages">My Messages</Link>
                  <Link to="/my-tutor-ads">My Tutor Ads</Link>
                  <Link to="/my-account">My Account</Link>
                  {user.isAdmin && (
                    <Link to="/admin">Admin Dashboard</Link>
                  )}
                  <Link to="/" onClick={handleLogout}>Logout</Link>
              </div>
            </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="auth-link">Login</Link>
                <Link to="/register" className="auth-link">Register</Link>
              </div>
            )}
          </div>
      </div>
    </nav>
  );
};

export default Navbar;

{/*user ? (
          <>
            {location.pathname !== '/chat' && (
              <Link to="/chat">Live Chat</Link>
            )}
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
          )*/}
