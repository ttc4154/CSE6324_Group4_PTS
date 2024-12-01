import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebase'; // Firebase config import
import { collection, getDocs, query, where } from 'firebase/firestore'; // Firestore methods
import axios from 'axios'; // For geocoding API
import '../styles/Search.css';
import ReactStars from "react-rating-stars-component";
import { useNavigate } from 'react-router-dom';

const Search = ({ setSelectedSubjectReturn, setTutorIdReturn }) => {
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  console.log('Google Maps API Key:', GOOGLE_MAPS_API_KEY); // Debugging

  const navigate = useNavigate(); // React Router's navigation hook
  const location = useLocation();
  const { searchValue, zipCode, isOnline } = location.state || {};  // Extract searchValue, zipCode, and isOnline

  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [subjects, setSubjects] = useState([]); // Store subjects from Firestore
  const [activeMenu, setActiveMenu] = useState(null); // State to track the currently active menu
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDistance, setSelectedDistance] = useState(null);
  const [selectedRate, setSelectedRate] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const clearFilters = () => {
    setSelectedRate(null);
    setSelectedRating(null);
    setSelectedSubject(null);
    setSelectedDistance(null);
    setSelectedType(null);
    setSelectedLevels(null);
  };
  const handleLogin = () => {
    // Redirect to login page or open login modal
    console.log("Redirecting to login...");
    navigate('/login'); // Navigate to login page
  };
  
  const handleRegister = () => {
    // Redirect to registration page or open registration modal
    console.log("Redirecting to register...");
    navigate('/register'); // Navigate to registration page
  };
  const viewCourses = (tutorId) => {
    // Navigate to a page showing available courses for this tutor or open a modal
    setTutorIdReturn(tutorId);
    console.log(`Viewing courses for tutor: ${tutorId}`);
    navigate('/my-courses'); // Navigate to the courses page

    // Example: Redirect or update state to show courses
  };
  
  // Define the available levels
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Proficient', 'Children'];

  useEffect(() => {    
    const fetchSubjects = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'subjects'));
            const subjectList = querySnapshot.docs.map((doc) => doc.data().name);
            setSubjects(subjectList); // Set the subjects list only once
            console.log('Fetched subjects:', subjectList);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };
    
    fetchSubjects();
    }, []); // Empty dependency array ensures this runs only once on component mount

  const handleSelectSubject = (index) => {{setSelectedSubject(index); setSelectedSubjectReturn(index)}};
  const handleSelectType = (index) => setSelectedType(index);
  const handleSelectDistance = (index) => setSelectedDistance(index);
  const handleSelectRate = (index) => setSelectedRate(index);
  const handleSelectRating = (index) => setSelectedRating(index);
  // Handle the selection of individual levels
  const handleSelectLevels = (level) => {
    setSelectedLevels((prevSelectedLevels) => {
      if (prevSelectedLevels.includes(level)) {
        // If level is already selected, remove it
        return prevSelectedLevels.filter((item) => item !== level);
      } else {
        // If level is not selected, add it
        return [...prevSelectedLevels, level];
      }
    });
  };

  // Handle the "All" checkbox logic
  const handleSelectAll = () => {
    if (selectedLevels.length === levels.length) {
      // If all are selected, deselect all
      setSelectedLevels([]);
    } else {
      // Otherwise, select all levels
      setSelectedLevels([...levels]);
    }
  };
  // Handle mouse leave to close the dropdown
  const handleMouseLeave = () => {
    setActiveMenu(null); // Close dropdown when mouse leaves
  };
  const zipCache = new Map();

  const getCoordinatesFromZip = async (zip) => {
    if (!zip) {
      console.error("Invalid zip code:", zip);
      return null;
    }

    // Return cached coordinates if available
    if (zipCache.has(zip)) {
      return zipCache.get(zip);
    }

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${GOOGLE_MAPS_API_KEY}`
        //const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
        
      );

      const location = response.data.results[0]?.geometry.location;
      //const location = { lat: 32.7502, lng: -97.3250 };
      //zip = 76102;
      console.log('location Data:', location);
      console.log('zip Data:', zip);
      if (location) {
        zipCache.set(zip, location); // Cache the result
        return location;
      } else {
        console.error(`No results found for zip code: ${zip}`);
        return null;
      }
    } catch (error) {
      console.error("Error getting coordinates from zip code:", error.message);
      return null;
    }
  };  

  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    // Convert degrees to radians
    const toRad = (x) => (x * Math.PI) / 180;
    
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in miles
    return distance;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!zipCode) {
          console.error("Zip code is required");
          return;
        }
  
        if (!userLocation) {
          const userLocationData = await getCoordinatesFromZip(zipCode);
          if (userLocationData) setUserLocation(userLocationData);
        }
  
        // Start Firestore query
        let tutorQuery = query(collection(db, 'tutors'));
        if (isOnline) {
          tutorQuery = query(tutorQuery, where('isOnline', '==', true));
        }
  
        const tutorSnapshot = await getDocs(tutorQuery);
        const tutorsData = tutorSnapshot.docs.map(doc => doc.data());
        console.log('Fetched Tutors Data:', tutorsData);
  
        let filteredTutors = tutorsData;
  
        // Apply filters
        if (searchValue) {
          filteredTutors = filteredTutors.filter((tutor) =>
            tutor.selectedSubjects?.some((subject) =>
              subject?.toLowerCase().includes(searchValue.toLowerCase())
            )
          );
        }
  
        if (selectedType === 0 || selectedType === 1) {
          const isOnlineSelected = selectedType === 1;
          filteredTutors = filteredTutors.filter((tutor) => tutor.isOnline === isOnlineSelected);
        }
  
        if (selectedSubject !== null && subjects[selectedSubject]) {
          const selectedSubjectName = subjects[selectedSubject]?.toLowerCase();
          filteredTutors = filteredTutors.filter((tutor) =>
            tutor.selectedSubjects?.some((subject) =>
              subject?.toLowerCase().includes(selectedSubjectName)
            )
          );
        }
  
        if (selectedDistance !== null) {
          const distanceLimits = [10, 25, 50, 1000];
          const maxDistance = distanceLimits[selectedDistance];
  
          const tutorsWithinRange = await Promise.all(
            filteredTutors.map(async (tutor) => {
              if (!tutor.zipCode) return null;
              const tutorCoordinates = await getCoordinatesFromZip(tutor.zipCode);
              if (tutorCoordinates) {
                const distance = haversineDistance(
                  userLocation.lat,
                  userLocation.lng,
                  tutorCoordinates.lat,
                  tutorCoordinates.lng
                );
                return distance <= maxDistance ? tutor : null;
              }
              return null;
            })
          );
  
          filteredTutors = tutorsWithinRange.filter(Boolean);
        }
  
        if (selectedRate !== null) {
          const rateRanges = {
            '...': [0, 100],
            '$10 - $40': [10, 40],
            '$40 - $60': [40, 60],
            '$60+': [60, Infinity],
          };
          const [minRate, maxRate] = rateRanges[selectedRate];
          filteredTutors = filteredTutors.filter(
            (tutor) => typeof tutor.rates === 'number' && tutor.rates >= minRate && tutor.rates <= maxRate
          );
        }
  
        if (selectedRating !== null) {
          const ratingThresholds = {
            '4 Stars and above': 4,
            '3 Stars and above': 3,
            'Any Rating': -1,
          };
          const minRating = ratingThresholds[selectedRating];
          filteredTutors = filteredTutors.filter((tutor) =>
            tutor.averageRating && tutor.averageRating >= minRating
          );
        }
  
        filteredTutors = filteredTutors.filter(Boolean); // Remove invalid values
        setTutors(filteredTutors);
        console.log('Final Filtered Tutors:', filteredTutors.map((t) => t.name || 'Unknown'));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [searchValue, zipCode, userLocation, isOnline, selectedSubject, selectedType, selectedDistance, selectedRate, selectedRating, selectedLevels]);
  
  const toggleMenu = (menu) => {
    setActiveMenu((prevMenu) => (prevMenu === menu ? null : menu));
  };

  const handleOutsideClick = (event) => {
    if (!event.target.closest('.menu-dropdown')) {
      setActiveMenu(null);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="search-results">
      <h2>Search Results</h2>
      {/* Filters Menu */}
      <div 
        className="menu-dropdown" 
        onMouseLeave={handleMouseLeave}
      >
        <button 
          className={`search-menu-button ${selectedSubject !== null ? 'active' : ''}`} 
          onClick={() => toggleMenu('subjects')}
        >
          Subjects
        </button>

        {activeMenu === 'subjects' && (
          <div className="dropdown-content">
            <ul>
              {subjects.map((subject, index) => (
                <li 
                  key={subject}
                  className={selectedSubject === index ? 'submenu-active' : ''}
                  onClick={() => {
                    handleSelectSubject(index); // Update the selected subject
                    toggleMenu('subjects');    // Close the menu
                  }}
                >
                  {subject}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="menu-dropdown" onMouseLeave={handleMouseLeave}>
        <button 
          className={`search-menu-button ${selectedType !== null ? 'active' : ''}`} 
          onClick={() => toggleMenu('type')}
        >
          Type of Class
        </button>

        {activeMenu === 'type' && (
          <div className="dropdown-content">
            <ul>
              {['In-Person', 'Online', 'Both'].map((type, index) => (
                <li
                  key={type}
                  className={selectedType === index ? 'submenu-active' : ''}
                  onClick={() => {
                    handleSelectType(index); // Update selected type
                    toggleMenu('type');     // Close the menu
                  }}
                >
                  {type}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="menu-dropdown" onMouseLeave={handleMouseLeave}>
      <button 
        className={`search-menu-button ${selectedDistance !== null ? 'active' : ''}`} 
        onClick={() => toggleMenu('distance')}
        disabled={selectedType === 1} // Disable if "Online" is selected
        style={{
          opacity: selectedType === 1 ? 0.5 : 1, // Optional: Reduce opacity when disabled
          cursor: selectedType === 1 ? 'not-allowed' : 'pointer', // Optional: Show "not-allowed" cursor
        }}
      >
        Distance
      </button>
        {activeMenu === 'distance' && (
          <div className="dropdown-content">
            <ul>
              {['Within 10 miles', 'Within 25 miles', 'Within 50 miles', '...'].map((distance, index) => (
                <li
                  key={distance}
                  className={selectedDistance === index ? 'submenu-active' : ''}
                  onClick={() => {handleSelectDistance(index);
                    toggleMenu('distance'); // Close the menu after selection
                    }}
                >
                  {distance}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="menu-dropdown" onMouseLeave={handleMouseLeave}>
        <button 
          className={`search-menu-button ${selectedRate !== null ? 'active' : ''}`} 
          onClick={() => toggleMenu('rate')}
        >
          Rate
        </button>
        {activeMenu === 'rate' && (
          <div className="dropdown-content">
            <ul>
              {['...','$10 - $40', '$40 - $60', '$60+'].map((rate) => (
                <li
                  key={rate}
                  className={selectedRate === rate ? 'submenu-active' : ''}
                  onClick={() => {handleSelectRate(rate); toggleMenu('rate');}}
                >
                  {rate}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="menu-dropdown" onMouseLeave={handleMouseLeave}>
        <button className={`search-menu-button ${selectedRating !== null ? 'active' : ''}`} 
          onClick={() => toggleMenu('rating')}
        >
          Rating
        </button>
        {activeMenu === 'rating' && (
          <div className="dropdown-content">
            <ul>
              {['4 Stars and above', '3 Stars and above', 'Any Rating'].map((rating) => (
                <li
                  key={rating}
                  className={selectedRating === rating ? 'submenu-active' : ''}
                  onClick={() => {handleSelectRating(rating); toggleMenu('rating');}}
                >
                  {rating}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="menu-dropdown" onMouseLeave={handleMouseLeave}>
        <button className="search-menu-button " onClick={() => toggleMenu('level')}>
          Level
        </button>
        {activeMenu === 'level' && (
          <div className="dropdown-content">
            <ul>
              {/* "All" checkbox */}
              <li key="All">
              <label htmlFor="All">All&nbsp;Level</label>
                <input
                  type="checkbox"
                  id="All"
                  checked={selectedLevels.length === levels.length} // Check if all levels are selected
                  onChange={() => {
                    handleSelectAll(); // Handle "All" checkbox change
                    //toggleMenu('level'); // Close the dropdown after selection
                  }}
                />
                
              </li>

              {/* Individual level checkboxes */}
              {levels.map((level) => (
                <li key={level}>
                    <label htmlFor={level}>{level}</label>
                  <input
                    type="checkbox"
                    id={level}
                    checked={selectedLevels.includes(level)} // Check if the level is selected
                    onChange={() => {
                      handleSelectLevels(level); // Handle checkbox change
                      //toggleMenu('level'); // Close the dropdown after selection
                    }}
                  />
                  
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="menu-dropdown" onMouseLeave={handleMouseLeave}>
        <button className="clear-filters-button" onClick={clearFilters}>
        Clear
        </button>
      </div>
      <div className="tutors">
        <ul>
          {tutors.length > 0 ? (
            tutors.map((tutor, index) => (
              <li key={index} className="tutor-item">
                <div className="tutor-info">
                  {/* Display tutor's profile picture */}
                  <div className="tutor-photo-container">
                    <img 
                      src={tutor.photoURL || '/default-profile-pic.png'} 
                      alt={`${tutor.displayName}'s profile`} 
                      className="tutor-profile-pic" 
                    />
                    <ReactStars
                        count={5}
                        size={24}
                        value={tutor.averageRating || 0} // Show the average rating or default to 0
                        edit={false} // Make the stars read-only
                        activeColor="#ffd700"
                    />
                    <div className="tutor-details"><strong>{tutor.displayName}</strong><br /></div>
                  </div>
                  <div className="tutor-details">                    
                    <span>Subjects: {tutor.selectedSubjects ? tutor.selectedSubjects.join(', ') : 'No subjects listed'}</span>
                    <span>Phone: {tutor.phone}</span>
                    <span>Rates: ${tutor.rates}/hr</span>
                    <span>Levels: {tutor.level ? tutor.level.join(', ') : 'No levels available'}</span>
                    <span>Type of Class : {tutor.isOnline ? 'Online' : 'In-person'}</span>  {/* Display online status */}
                    <span>Zip Code: {tutor.zipCode}</span>
                    <span>Tutor ID: {tutor.id}</span>
                    {/* Button for logged-in users to view available courses */}
                    {1 ? (
                      <button className="view-courses-button" onClick={() => viewCourses(tutor.id)}>
                        View Available Courses
                      </button>
                    ) : (
                      <div className="auth-buttons">
                        <button className="login-button" onClick={handleLogin}>Login</button>
                        <button className="register-button" onClick={handleRegister}>Register</button>
                      </div>
                    )}
                  </div>
                  
                </div>
              </li>
            ))
          ) : (
            <li>No matching tutors found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Search;
