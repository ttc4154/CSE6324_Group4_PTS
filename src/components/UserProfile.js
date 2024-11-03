import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; 
import '../styles/styles.css';

const UserProfile = () => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 

  const handleNavigateToAdmin = () => {
    navigate('/admin');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const docRef = doc(db, user.userType === 'student' ? 'students' : 'tutors', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
          } else {
            console.log("No such document in the main collection!");

            const otherCollection = user.userType === 'student' ? 'tutors' : 'students';
            const otherDocRef = doc(db, otherCollection, user.uid);
            const otherDocSnap = await getDoc(otherDocRef);

            if (otherDocSnap.exists()) {
              const data = otherDocSnap.data();
              setUserData(data);
            } else {
              console.log("No such document in the other collection!");
            }
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError("Failed to load user data.");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!user) {
    return <p>Please log in to view your profile.</p>;
  }

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      {userData && userData.isAdmin && (
        <button onClick={handleNavigateToAdmin}>Go to Admin Dashboard</button>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {userData ? (
        <div>
          <p><strong>Name:</strong> {userData.displayName || 'Not provided'}</p>
          <p><strong>Email:</strong> {userData.email || 'Not provided'}</p>
          <p><strong>User Type:</strong> {userData.userType || 'Not provided'}</p>
          <p><strong>Phone:</strong> {userData.phone || 'Not provided'}</p>
          <p><strong>Address:</strong> {userData.address || 'Not provided'}</p>
          <p><strong>Member Status:</strong> {userData.memberStatus || 'Not specified'}</p>
          <p><strong>Subjects:</strong> {userData.selectedSubjects?.join(', ') || 'None selected'}</p>
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
};

export default UserProfile;
