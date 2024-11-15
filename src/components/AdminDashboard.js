import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase'; // Correct import for Firebase config
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore'; // Ensure these are imported
import SubjectManagement from './SubjectManagement'; // Import the SubjectManagement component
import '../styles/Admin.css';

const AdminDashboard = () => {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const studentDoc = await getDoc(doc(db, 'students', user.uid));
        const tutorDoc = await getDoc(doc(db, 'tutors', user.uid));

        if (
          (studentDoc.exists() && studentDoc.data().isAdmin) ||
          (tutorDoc.exists() && tutorDoc.data().isAdmin)
        ) {
          setIsAdmin(true);
        }
      }
      setLoading(false); // Set loading to false after checking the role
    };

    fetchUserRole();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      const fetchStudentsAndTutors = async () => {
        const studentSnapshot = await getDocs(collection(db, 'students'));
        const tutorSnapshot = await getDocs(collection(db, 'tutors'));

        const studentList = studentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const tutorList = tutorSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        setStudents(studentList);
        setTutors(tutorList);
      };

      fetchStudentsAndTutors();
    }
  }, [isAdmin]);

  const handleDeleteUser = async (id, collectionName) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this user? This action cannot be undone.'
    );
    if (!confirmDelete) {
      return; // Exit if the user cancels
    }
    try {
      const idTokenResult = await auth.currentUser.getIdTokenResult(true);
      const isAdmin = idTokenResult.claims.isAdmin || false;
      console.log('isAdmin claim:', idTokenResult.claims.isAdmin);
      if (!isAdmin) {
        console.error("You don't have permission to delete users.");
        return;
      }

      // Proceed with deletion
      const userDocRef = doc(db, collectionName, id);
      await deleteDoc(userDocRef);

      // Re-fetch updated data
      const snapshot = await getDocs(collection(db, collectionName));
      const updatedList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (collectionName === 'students') {
        setStudents(updatedList);
      } else if (collectionName === 'tutors') {
        setTutors(updatedList);
      }

      console.log('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isAdmin) {
    return <p>You do not have permission to view this page.</p>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <div className="admin-section">
        <h2>Manage Students</h2>
        {students.map((student) => (
          <div key={student.id} className="admin-item">
            <p>
              {student.displayName} ({student.email})
            </p>
            <button
              className="admin-delete-button"
              onClick={() => handleDeleteUser(student.id, 'students')}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="admin-section">
        <h2>Manage Tutors</h2>
        {tutors.map((tutor) => (
          <div key={tutor.id} className="admin-item">
            <p>
              {tutor.displayName} ({tutor.email})
            </p>
            <button
              className="admin-delete-button"
              onClick={() => handleDeleteUser(tutor.id, 'tutors')}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="admin-section">
        <h2>Manage Subjects</h2>
        <SubjectManagement
          onSubjectChange={(updatedSubjects) => {
            console.log('Subjects updated:', updatedSubjects);
          }}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
