import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import '../styles/Navbar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Navbar = () => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [location, setLocation] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [latitude, setLatitude] = useState(null); // State for latitude
  const [longitude, setLongitude] = useState(null); // State for longitude
  const { profilePicture } = useUser();
  const [user, setUser] = useState(null);
  const locationData = useLocation();
  const navigate = useNavigate();

  const GOOGLE_MAPS_API_KEY = 'key';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      console.log('Geolocation API available');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Position obtained:', latitude, longitude);
  
          const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
  
          fetch(geocodeUrl)
            .then(response => response.json())
            .then((data) => {
              if (data.results && data.results.length > 0) {
                const addressComponents = data.results[0]?.address_components;
                const zipCode = addressComponents?.find((component) =>
                  component.types.includes('postal_code')
                )?.long_name;
  
                if (zipCode) {
                  setLocation(zipCode);
                  setZipCode(zipCode);
                  console.log('Zip Code:', zipCode);
                } else {
                  setLocation('Zip code unavailable');
                  setZipCode('');
                }
              } else {
                console.error('Geocode API returned no results:', data);
                setLocation('Error fetching zip code');
                setZipCode('');
              }
            })
            .catch((error) => {
              console.error('Error fetching zip code:', error);
              setLocation('Error fetching zip code');
              setZipCode('');
            });
        },
        (error) => {
          console.error('Error getting geolocation:', error);
          setLocation('Location unavailable');
          setZipCode('');
        }
      );
    } else {
      console.error('Geolocation API not available');
      setLocation('Geolocation not supported');
      setZipCode('');
    }
  }, []);
  

  const handleSearchInputChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleOnlineToggle = () => {
    setIsOnline(!isOnline);
  };

  const handleZipCodeChange = (e) => {
    setZipCode(e.target.value);
  };

  const handleFocus = () => {
    setIsSearchFocused(true);
  };

  const handleBlur = () => {
    setIsSearchFocused(false);
  };

  const combinedValue = searchValue || (isSearchFocused ? '' : `Search Subject...`);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const handleNavigateToAdmin = () => {
    navigate('/admin');
  };

  const handleSearchClick = () => {
    // When search button is clicked, pass the data to Search component via state
    navigate('/search', { state: { searchValue, zipCode, isOnline, latitude, longitude } }); // Pass lat/long as part of state
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Personal Tutoring Services
        </Link>

        <div className="navbar-search">
          <input
            className="navbar-search-input"
            type="text"
            value={combinedValue}
            onChange={handleSearchInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={!isSearchFocused && !searchValue ? `Search Subject... ${location}` : ''}
          />
          <input
            className="navbar-search-zipcode"
            type="text"
            value={zipCode}
            onChange={handleZipCodeChange}
            disabled={isOnline}
            placeholder={isOnline ? 'Online' : 'ZipCode'}
          />
          <button className="navbar-search-button" onClick={handleSearchClick}>
            <i className="fas fa-search"></i>
          </button>
          <label>Online
            <input
              type="checkbox"
              checked={isOnline}
              onChange={handleOnlineToggle}
            />
          </label>
        </div>
        <div className="navbar-auth">
          {user ? (
            <div className="menu-dropdown">
              <button className="menu-button">
                <img src={profilePicture || '/default-profile-pic.png'} alt="Profile" className="profile-pic" />
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
                {user.isAdmin && <Link to="/admin">Admin Dashboard</Link>}
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
