import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase'; // Correct import for Firebase config
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore'; // Ensure these are imported

const AdminDashboard = () => {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if the current user is an admin
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        // Check if the user is an admin in either students or tutors collection
        const studentDoc = await getDoc(doc(db, 'students', user.uid));
        const tutorDoc = await getDoc(doc(db, 'tutors', user.uid));
        
        // If the user exists in either students or tutors and has isAdmin as true
        if ((studentDoc.exists() && studentDoc.data().isAdmin) || 
            (tutorDoc.exists() && tutorDoc.data().isAdmin)) {
          setIsAdmin(true);
        }
      }
      setLoading(false);
    };

    fetchUserRole();
  }, [user]);

  // Fetch students and tutors if the user is an admin
  useEffect(() => {
    if (isAdmin) {
      const fetchStudentsAndTutors = async () => {
        const studentSnapshot = await getDocs(collection(db, 'students'));
        const tutorSnapshot = await getDocs(collection(db, 'tutors'));
        
        const studentList = studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const tutorList = tutorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setStudents(studentList);
        setTutors(tutorList);
      };
      
      fetchStudentsAndTutors();
    }
  }, [isAdmin]);

  // Handle deleting a user (student or tutor)
  const handleDeleteUser = async (userId, userType) => {
    try {
      await deleteDoc(doc(db, userType, userId)); // Delete user from appropriate collection
      if (userType === 'students') {
        setStudents(students.filter(student => student.id !== userId)); // Remove from state
      } else {
        setTutors(tutors.filter(tutor => tutor.id !== userId)); // Remove from state
      }
    } catch (error) {
      console.error('Error deleting user: ', error);
    }
  };

  // Handle modifying a user's data (e.g., toggle isAdmin status)
  const handleModifyUser = async (userId, userType, updatedData) => {
    try {
      const userDocRef = doc(db, userType, userId);
      await updateDoc(userDocRef, updatedData); // Update user document in Firestore
      if (userType === 'students') {
        setStudents(students.map(student => student.id === userId ? { ...student, ...updatedData } : student));
      } else {
        setTutors(tutors.map(tutor => tutor.id === userId ? { ...tutor, ...updatedData } : tutor));
      }
    } catch (error) {
      console.error('Error updating user: ', error);
    }
  };

  // Loading or access denied UI
  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isAdmin) {
    return <p>You do not have permission to view this page.</p>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {/* Manage Students */}
      <h2>Manage Students</h2>
      {students.map(student => (
        <div key={student.id}>
          <p>{student.displayName} ({student.email})</p>
          <button onClick={() => handleModifyUser(student.id, 'students', { isAdmin: !student.isAdmin })}>
            Toggle Admin Status
          </button>
          <button onClick={() => handleDeleteUser(student.id, 'students')}>
            Delete
          </button>
        </div>
      ))}

      {/* Manage Tutors */}
      <h2>Manage Tutors</h2>
      {tutors.map(tutor => (
        <div key={tutor.id}>
          <p>{tutor.displayName} ({tutor.email})</p>
          <button onClick={() => handleModifyUser(tutor.id, 'tutors', { isAdmin: !tutor.isAdmin })}>
            Toggle Admin Status
          </button>
          <button onClick={() => handleDeleteUser(tutor.id, 'tutors')}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
