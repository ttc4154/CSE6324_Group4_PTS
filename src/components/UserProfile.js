import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Firebase Storage imports
import { storage } from '../firebase'; // Firebase Storage instance
import '../styles/UserProfile.css';
import ReactStars from "react-rating-stars-component";


const UserProfile = () => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]); // Store subjects from Firestore
  const [profilePicture, setProfilePicture] = useState(null); // Store the profile picture URL
  const [uploading, setUploading] = useState(false); // State to handle uploading status
  const navigate = useNavigate();

  const handleNavigateToAdmin = () => {
    navigate('/admin');
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setUploading(true);
  
    try {
      // Ensure the file path uses a valid string
      const fileRef = ref(storage, `profilePictures/${user.uid}/${file.name}`);
      await uploadBytes(fileRef, file);
  
      // Get the file URL
      const photoURL = await getDownloadURL(fileRef);
      setProfilePicture(photoURL);
  
      // Update Firestore with the photo URL
      const collectionName = userData.userType === 'student' ? 'students' : 'tutors';
      const docRef = doc(db, collectionName, user.uid);
      await updateDoc(docRef, { photoURL });
  
      alert('Profile picture updated successfully!');
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      alert('Failed to upload profile picture.');
    } finally {
      setUploading(false);
    }
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
          zipCode: userData.zipCode,
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
              selectedSubjects: data.selectedSubjects || [],
              photoURL: data.photoURL || null
            });
            setProfilePicture(data.photoURL || null);
          } else if (tutorSnap.exists()) {
            const data = tutorSnap.data();
            setUserData({
              ...data,
              userType: 'tutor',
              selectedSubjects: data.selectedSubjects || [],
              photoURL: data.photoURL || null
            });
            setProfilePicture(data.photoURL || null);
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
          <div className="profile-picture-section">
          {profilePicture ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={profilePicture}
                alt="Profile"
                className="profile-picture"
                style={{
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
              {userData.userType === 'tutor' && (
                <ReactStars
                  count={5}
                  size={24}
                  value={userData.averageRating || 0} // Replace with the actual user's average rating
                  edit={false} // Read-only stars
                  activeColor="#ffd700"
                />
              )}
            </div>
            ) : (
              <p>No profile picture uploaded.</p>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              disabled={uploading}
            />
            {uploading && <p>Uploading...</p>}
          </div>
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
            <label>
              Zipcode:
              <input
                type="text"
                value={userData.zipCode || ""}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
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
