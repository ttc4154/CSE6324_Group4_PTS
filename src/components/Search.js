import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebase'; // Firebase config import
import { collection, getDocs, query, where } from 'firebase/firestore'; // Firestore methods
import '../styles/Search.css';

const Search = () => {
  const location = useLocation();
  const { searchValue, zipCode } = location.state || {};  // Extract only searchValue and zipCode

  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch tutors based on zipCode and searchValue (subject)
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching tutors with zipCode:', zipCode);
  
        let tutorQuery = query(collection(db, 'tutors'));
  
        // Filter by zipCode if provided
        if (zipCode) {
          tutorQuery = query(tutorQuery, where('zipCode', '==', zipCode));
        }
  
        // Fetch tutors from Firestore
        const tutorSnapshot = await getDocs(tutorQuery);
        const tutorsData = tutorSnapshot.docs.map(doc => doc.data());
        console.log('Fetched Tutors Data:', tutorsData);
  
        // Filter tutors by searchValue (subject)
        let filteredTutors = tutorsData;
  
        if (searchValue) {
          filteredTutors = filteredTutors.filter(tutor => {
            // Ensure selectedSubjects is an array and check for partial matching (case-insensitive)
            return tutor.selectedSubjects &&
              Array.isArray(tutor.selectedSubjects) &&
              tutor.selectedSubjects.some(subject =>
                subject.toLowerCase().includes(searchValue.toLowerCase())  // Partial match
              );
          });
        }
  
        console.log('Filtered Tutors after applying zipCode and subject filters:', filteredTutors);
        setTutors(filteredTutors);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
  
    fetchData();
  }, [searchValue, zipCode]);

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
              <li key={index}>
                <strong>{tutor.displayName}</strong><br />
                <span>Subjects: {tutor.selectedSubjects ? tutor.selectedSubjects.join(', ') : 'No subjects listed'}</span><br />
                <span>Zip Code: {tutor.zipCode}</span><br />
                <span>Phone: {tutor.phone}</span>
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
