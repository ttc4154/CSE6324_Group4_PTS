import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../firebase'; // Correct import for Firebase config
import { useAuthState } from 'react-firebase-hooks/auth'; // Firebase hook
import { doc, getDoc } from 'firebase/firestore'; // For Firestore operations
import '../styles/Menu.css'; // Import styles for menu

const Menu = () => {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false); // State for checking if user is admin
  const [userType, setUserType] = useState(null); // State for storing user type ('student' or 'tutor')
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (user) {
        // Check if user exists in 'students' collection
        const studentDoc = await getDoc(doc(db, 'students', user.uid));
        // Check if user exists in 'tutors' collection
        const tutorDoc = await getDoc(doc(db, 'tutors', user.uid));

        // Check if the user is an admin
        if ((studentDoc.exists() && studentDoc.data().isAdmin) || 
            (tutorDoc.exists() && tutorDoc.data().isAdmin)) {
          setIsAdmin(true);
        }

        // Determine if the user is a student or tutor
        if (studentDoc.exists()) {
          setUserType('student');
          setSelectedSubjects(studentDoc.data().selectedSubjects || []);
        } else if (tutorDoc.exists()) {
          setUserType('tutor');
          setSelectedSubjects(tutorDoc.data().selectedSubjects || []);
        }
      }
    };

    checkUserStatus();
  }, [user]); // Re-run when user changes

  return (
    <div className="menu-container">
      <ul className="menu">
        <li><Link to="/user-profile">Profile</Link></li>
        <li><Link to="/my-courses">Courses</Link></li>
        {user && user.uid && userType === 'tutor' && (
          <li><Link to={`/tutor-scheduler/${user.uid}`}>Schedules</Link></li>
        )}
        {user && user.uid && userType === 'student' && (
          <li>
            <Link to={`/student-scheduler/${user.uid}`}>Schedules</Link>
          </li>
        )}
        <li><Link to="/my-messages">Messages</Link></li>
        {user && user.uid && userType === 'tutor' && (
          <li><Link to="/my-tutor-ads">Tutor Ads</Link></li>
        )}        
        <li><Link to="/my-account">Account</Link></li>
        
        {/* Conditionally render the Admin Dashboard link if the user is an admin */}
        {isAdmin && <li><Link to="/admin">Admin</Link></li>}
      </ul>

      
    </div>
  );
};

export default Menu;
