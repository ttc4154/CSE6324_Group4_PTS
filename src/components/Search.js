import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebase'; // Firebase config import
import { collection, getDocs, query, where } from 'firebase/firestore'; // Firestore methods
import axios from 'axios'; // For geocoding API
import '../styles/Search.css';
import ReactStars from "react-rating-stars-component";

const Search = () => {
  const location = useLocation();
  const { searchValue, zipCode, isOnline } = location.state || {};  // Extract searchValue, zipCode, and isOnline

  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [showSubjectsMenu, setShowSubjectsMenu] = useState(false); 
  const [showTypeMenu, setShowTypeMenu] = useState(false); 
  const [showDistanceMenu, setShowDistanceMenu] = useState(false); 
  const [showRateMenu, setShowRateMenu] = useState(false); 
  const [showRatingMenu, setShowRatingMenu] = useState(false);
  const [showLevelMenu, setShowLevelMenu] = useState(false);
  const [subjects, setSubjects] = useState([]); // Store subjects from Firestore
  const [activeMenu, setActiveMenu] = useState(null); // State to track the currently active menu

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDistance, setSelectedDistance] = useState(null);
  const [selectedRate, setSelectedRate] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedLevels, setSelectedLevels] = useState([]);
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

  const handleSelectSubject = (index) => setSelectedSubject(index);
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

  const getCoordinatesFromZip = async (zip) => {
    try {
      // Example geocoding API (Google Maps API or similar)
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=YOUR_GOOGLE_API_KEY`);
      const location = response.data.results[0]?.geometry.location;
      return location || null;
    } catch (error) {
      console.error('Error getting coordinates from zip code:', error);
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

  // Fetch tutors based on zipCode, searchValue (subject), and isOnline flag
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching tutors with zipCode:', zipCode);
        
        // Get the user's coordinates based on the zip code
        const userLocationData = await getCoordinatesFromZip(zipCode);
        if (userLocationData) {
          setUserLocation(userLocationData);
        }

        // Start Firestore query
        let tutorQuery = query(collection(db, 'tutors'));

        // Filter by isOnline flag if it's true
        if (isOnline) {
          tutorQuery = query(tutorQuery, where('isOnline', '==', true));
        }
        
        // Fetch tutors from Firestore
        const tutorSnapshot = await getDocs(tutorQuery);
        const tutorsData = tutorSnapshot.docs.map(doc => doc.data());
        console.log('Fetched Tutors Data:', tutorsData);

        // Filter tutors by searchValue (subject)
        let filteredTutors = tutorsData;

        if (searchValue) {
          filteredTutors = filteredTutors.filter(tutor => {
            return tutor.selectedSubjects &&
              Array.isArray(tutor.selectedSubjects) &&
              tutor.selectedSubjects.some(subject =>
                subject.toLowerCase().includes(searchValue.toLowerCase())  // Partial match
              );
          });
        }

        // Perform filtering based on selectedSubject if it exists
        if (selectedSubject !== null && subjects[selectedSubject]) {
          const selectedSubjectName = subjects[selectedSubject].toLowerCase();

          filteredTutors = filteredTutors.filter((tutor) => {
            return (
              tutor.selectedSubjects &&
              Array.isArray(tutor.selectedSubjects) &&
              tutor.selectedSubjects.some((subject) =>
                //subject.toLowerCase() === selectedSubjectName // Exact match
                subject.toLowerCase().includes(selectedSubjectName.toLowerCase())  // Partial match
              )
            );
          });
        }
        // Perform filtering based on selectedType if it exists
        if (selectedType !== null) {
          const isOnlineSelected = selectedType === 1; // Assuming index 1 is "Online" and index 0 is "In-Person"

          filteredTutors = filteredTutors.filter((tutor) => {
            return tutor.isOnline === isOnlineSelected; // Match isOnline with the selected type
          });
        }

        // If we have a valid user location, filter tutors by distance asynchronously
        if (userLocation) {
          const tutorsWithinRange = await Promise.all(filteredTutors.map(async (tutor) => {
            const tutorCoordinates = await getCoordinatesFromZip(tutor.zipCode);

            if (tutorCoordinates) {
              const distance = haversineDistance(
                userLocation.lat,
                userLocation.lng,
                tutorCoordinates.lat,
                tutorCoordinates.lng
              );
              return distance <= 25 ? tutor : null; // Include tutor if within 25 miles
            }
            return null;
          }));

          // Remove any null values (tutors that didn't meet the distance criteria)
          filteredTutors = tutorsWithinRange.filter(tutor => tutor !== null);
        }

        console.log('Filtered Tutors after applying zipCode, subject, and distance filters:', filteredTutors);
        setTutors(filteredTutors);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [searchValue, zipCode, userLocation, isOnline, selectedSubject,selectedType, selectedDistance, selectedRate, selectedRating, selectedLevels]); // Include isOnline in dependency array
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

  // Toggle functions for each menu
  const toggleSubjectsMenu = () => setShowSubjectsMenu(prev => !prev);
  const toggleTypeMenu = () => setShowTypeMenu(prev => !prev);
  const toggleDistanceMenu = () => setShowDistanceMenu(prev => !prev);
  const toggleRateMenu = () => setShowRateMenu(prev => !prev);
  const toggleRatingMenu = () => setShowRatingMenu(prev => !prev);
  const toggleLevelMenu = () => setShowLevelMenu(prev => !prev);

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
              {['In-Person', 'Online'].map((type, index) => (
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
        <button className="search-menu-button " onClick={() => toggleMenu('distance')}>
          Distance
        </button>
        {activeMenu === 'distance' && (
          <div className="dropdown-content">
            <ul>
              {['Within 10 miles', 'Within 25 miles', 'Within 50 miles'].map((distance, index) => (
                <li
                  key={distance}
                  className={selectedDistance === index ? 'selected' : ''}
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
        <button className="search-menu-button " onClick={() => toggleMenu('rate')}>
          Rate
        </button>
        {activeMenu === 'rate' && (
          <div className="dropdown-content">
            <ul>
              {['$10 - $40', '$40 - $60', '$60+'].map((rate) => (
                <li
                  key={rate}
                  className={selectedRate === rate ? 'selected' : ''}
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
        <button className="search-menu-button " onClick={() => toggleMenu('rating')}>
          Rating
        </button>
        {activeMenu === 'rating' && (
          <div className="dropdown-content">
            <ul>
              {['4 Stars and above', '3 Stars and above', 'Any Rating'].map((rating) => (
                <li
                  key={rating}
                  className={selectedRating === rating ? 'selected' : ''}
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
                    <span>Zip Code: {tutor.zipCode}</span><br />
                    <span>Phone: {tutor.phone}</span><br />
                    <span>Rates: ${tutor.rates}/hr</span><br />
                    <span>Levels: {tutor.level ? tutor.level.join(', ') : 'No levels available'}</span><br />
                    <span>Type of Class : {tutor.isOnline ? 'Online' : 'In-person'}</span>  {/* Display online status */}
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
