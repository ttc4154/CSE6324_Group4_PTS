import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc, collection, getDocs, setDoc} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; 
import '../styles/UserProfile.css';

const UserProfile = () => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]); // Store subjects from Firestore
  const navigate = useNavigate();

  const handleNavigateToAdmin = () => {
    navigate('/admin');
  };
  
  const handleInputChange = (field, value) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubjectChange = (subject) => {
    setUserData((prev) => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects
        ? prev.selectedSubjects.includes(subject)
          ? prev.selectedSubjects.filter((s) => s !== subject)
          : [...prev.selectedSubjects, subject]
        : [subject]
    }));
  };

  const saveChanges = async () => {
    if (user && userData) {
      const collectionName = userData.userType === 'student' ? 'students' : 'tutors';
      const docRef = doc(db, collectionName, user.uid);

      try {
        await updateDoc(docRef, {
          displayName: userData.displayName,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          memberStatus: userData.memberStatus,
          selectedSubjects: userData.selectedSubjects || []
        });
        alert('Profile updated successfully!');
      } catch (err) {
        console.error("Error updating profile:", err);
        setError("Failed to update profile.");
      }
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/'); 
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const studentDocRef = doc(db, 'students', user.uid);
          const tutorDocRef = doc(db, 'tutors', user.uid);
          const studentSnap = await getDoc(studentDocRef);
          const tutorSnap = await getDoc(tutorDocRef);

          if (studentSnap.exists()) {
            const data = studentSnap.data();
            setUserData({
              ...data,
              userType: 'student',
              selectedSubjects: data.selectedSubjects || []
            });
          } else if (tutorSnap.exists()) {
            const data = tutorSnap.data();
            setUserData({
              ...data,
              userType: 'tutor',
              selectedSubjects: data.selectedSubjects || []
            });
          } else {
            console.warn("User document does not exist in both collections.");
            setError("User profile does not exist.");
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

    const fetchUsers = async () => {
      try {
        const studentsSnap = await getDocs(collection(db, 'students'));
        const tutorsSnap = await getDocs(collection(db, 'tutors'));
        
        const studentsData = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const tutorsData = tutorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setStudents(studentsData);
        setTutors(tutorsData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    const fetchSubjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'subjects'));
        const subjectList = querySnapshot.docs.map((doc) => doc.data().name);
        setSubjects(subjectList);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    fetchSubjects();
    fetchUserData().then(() => {
      fetchUsers();
    });
  }, [user]);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!user) {
    return <p>Please log in to view your profile.</p>;
  }

  return (
    <div className="user-profile-container">
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {userData ? (
        <div>
          <h1>User Profile</h1>
          <div>
            <label>
              Name:
              <input
                type="text"
                value={userData.displayName}
                onChange={(e) => handleInputChange("displayName", e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Email:
              <input
                type="email"
                value={userData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Phone:
              <input
                type="text"
                value={userData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>
              Address:
              <input
                type="text"
                value={userData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </label>
          </div>
          <div>
            <label>User Type: </label>
            <label1>{userData.userType}</label1>
          </div>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
          <label>Member Status:</label>
            <li>
              <label1 style={{ display: 'inline-flex', alignItems: 'center' }}>
                <input
                  type="radio"
                  value="regular"
                  checked={userData.memberStatus === 'regular'}
                  onChange={() => handleInputChange("memberStatus", "regular")}
                  style={{
                    marginLeft: '52px',
                    width: '15px', // Adjusts the width of the radio button
                    height: '15px', // Adjusts the height of the radio button
                    accentColor: '#4A90E2', // Changes the radio button color (modern browsers)
                    cursor: 'pointer', // Changes cursor to pointer on hover
                  }}
                />
                Regular
              </label1>
            </li>
            <li>
              <label1>                
                <input
                  type="radio"
                  value="coordinator"
                  checked={userData.memberStatus === 'coordinator'}
                  onChange={() => handleInputChange("memberStatus", "coordinator")}
                  style={{
                    marginLeft: '52px',
                    width: '15px', // Adjusts the width of the radio button
                    height: '15px', // Adjusts the height of the radio button
                    accentColor: '#4A90E2', // Changes the radio button color (modern browsers)
                    cursor: 'pointer', // Changes cursor to pointer on hover
                  }}
                />
                Coordinator
              </label1>
            </li>
          </ul>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
                    <label>Subjects:</label>
                    {subjects.length > 0 ? (
                      subjects.map((subject) => (
                        <li key={subject} style={{ marginBottom: '0px', marginLeft: '52px' }}>
                          {subject}
                          <label style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <input
                              type="checkbox"
                              value={subject}
                              checked={userData.selectedSubjects.includes(subject)}
                              onChange={() => handleSubjectChange(subject)}
                            />
                          </label>
                        </li>
                      ))
                    ) : (
              <p>Loading subjects...</p>
            )}
          </ul>
          <div style={{ marginTop: '20px' }}>
            <button onClick={saveChanges} className="save-button">Save Changes</button>
            <button onClick={handleLogout} className="auth-link">Logout</button>
          </div>
        </div>
      ) : (
        <p>No user data available.</p>
      )}
    </div>
  );
};

export default UserProfile;
