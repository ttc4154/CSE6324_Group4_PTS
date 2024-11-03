// AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const AdminDashboard = () => {
  const [user] = useAuthState(auth);
  const [users, setUsers] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const usersSnapshot = await getDocs(collection(db, 'students'));
      const tutorsSnapshot = await getDocs(collection(db, 'tutors'));

      const userList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const tutorList = tutorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setUsers(userList);
      setTutors(tutorList);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleDeleteUser = async (userId) => {
    await deleteDoc(doc(db, 'students', userId));
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleDeleteTutor = async (tutorId) => {
    await deleteDoc(doc(db, 'tutors', tutorId));
    setTutors(tutors.filter(tutor => tutor.id !== tutorId));
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user || !user.isAdmin) {
    return <p>You do not have permission to view this page.</p>;
  }

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      <h3>Manage Users</h3>
      {users.map((user) => (
        <div key={user.id}>
          <p>{user.displayName} ({user.email})</p>
          <button onClick={() => handleDeleteUser(user.id)}>Delete User</button>
        </div>
      ))}

      <h3>Manage Tutors</h3>
      {tutors.map((tutor) => (
        <div key={tutor.id}>
          <p>{tutor.displayName} ({tutor.email})</p>
          <button onClick={() => handleDeleteTutor(tutor.id)}>Delete Tutor</button>
        </div>
      ))}

      {/* Implement other admin features like course management and transaction disputes here */}
    </div>
  );
};

export default AdminDashboard;
