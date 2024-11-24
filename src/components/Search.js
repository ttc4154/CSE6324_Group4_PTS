import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebase'; // Firebase config import
import { collection, getDocs, query, where } from 'firebase/firestore'; // Firestore methods
import axios from 'axios'; // For geocoding API
import '../styles/Search.css';

const Search = () => {
  const location = useLocation();
  const { searchValue, zipCode, isOnline } = location.state || {};  // Extract searchValue, zipCode, and isOnline

  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

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
  }, [searchValue, zipCode, userLocation, isOnline]); // Include isOnline in dependency array

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="search-results">
      <h2>Search Results</h2>

      <div className="tutors">
        <h3>Tutors</h3>
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
                    </div>
                    <div className="tutor-details">
                    <strong>{tutor.displayName}</strong><br />
                    <span>Subjects: {tutor.selectedSubjects ? tutor.selectedSubjects.join(', ') : 'No subjects listed'}</span><br />
                    <span>Zip Code: {tutor.zipCode}</span><br />
                    <span>Phone: {tutor.phone}</span><br />
                    <span>Online Status: {tutor.isOnline ? 'Online' : 'Offline'}</span>  {/* Display online status */}
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
