// src/context/UserContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../firebase'; // Firebase imports
import { doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';

// Create the User Context
const UserContext = createContext();

// Create a custom hook to use the UserContext
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const studentDocRef = doc(db, 'students', user.uid);
        const tutorDocRef = doc(db, 'tutors', user.uid);
        const studentSnap = await getDoc(studentDocRef);
        const tutorSnap = await getDoc(tutorDocRef);

        if (studentSnap.exists()) {
          const data = studentSnap.data();
          setUserData({
            ...data,
            userType: 'student',
            selectedSubjects: data.selectedSubjects || [],
            photoURL: data.photoURL || null,
          });
          setProfilePicture(data.photoURL || null);
        } else if (tutorSnap.exists()) {
          const data = tutorSnap.data();
          setUserData({
            ...data,
            userType: 'tutor',
            selectedSubjects: data.selectedSubjects || [],
            photoURL: data.photoURL || null,
          });
          setProfilePicture(data.photoURL || null);
        }
      }
    };
    fetchUserData();
  }, [user]);

  return (
    <UserContext.Provider value={{ userData, profilePicture }}>
      {children}
    </UserContext.Provider>
  );
};
