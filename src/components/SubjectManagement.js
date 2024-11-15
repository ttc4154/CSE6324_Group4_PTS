import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Import for authentication
import { db } from '../firebase'; // Firebase config
import '../styles/Admin.css'; // Optional for styling

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState(''); // New state for description
  const [editingSubject, setEditingSubject] = useState(null);
  const [updatedSubject, setUpdatedSubject] = useState('');
  const [updatedDescription, setUpdatedDescription] = useState(''); // State for updated description
  const [isAdmin, setIsAdmin] = useState(false); // Track admin status

  // Check if user has admin access
  useEffect(() => {
    const checkAdminStatus = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const idTokenResult = await user.getIdTokenResult();
        setIsAdmin(idTokenResult.claims.isAdmin === true);
      }
    };

    checkAdminStatus();
  }, []);

  // Fetch subjects from Firestore
  useEffect(() => {
    if (isAdmin) {
      const fetchSubjects = async () => {
        const snapshot = await getDocs(collection(db, 'subjects'));
        const subjectList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSubjects(subjectList);
      };

      fetchSubjects();
    }
  }, [isAdmin]);

  // Add a new subject
  const handleAddSubject = async () => {
    if (!newSubject.trim() || !newDescription.trim()) {
      alert('Subject name and description cannot be empty.');
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'subjects'), {
        name: newSubject,
        description: newDescription,
      });
      setSubjects([...subjects, { id: docRef.id, name: newSubject, description: newDescription }]);
      setNewSubject('');
      setNewDescription('');
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  // Edit an existing subject
  const handleEditSubject = async (id) => {
    if (!updatedSubject.trim() || !updatedDescription.trim()) {
      alert('Subject name and description cannot be empty.');
      return;
    }
    try {
      const subjectDoc = doc(db, 'subjects', id);
      await updateDoc(subjectDoc, { name: updatedSubject, description: updatedDescription });
      setSubjects(subjects.map(subject =>
        subject.id === id ? { ...subject, name: updatedSubject, description: updatedDescription } : subject
      ));
      setEditingSubject(null);
      setUpdatedSubject('');
      setUpdatedDescription('');
    } catch (error) {
      console.error('Error updating subject:', error);
    }
  };

  // Delete a subject
  const handleDeleteSubject = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this subject?');
    if (!confirmDelete) return;

    try {
      const subjectDoc = doc(db, 'subjects', id);
      await deleteDoc(subjectDoc);
      setSubjects(subjects.filter(subject => subject.id !== id));
    } catch (error) {
      console.error('Error deleting subject:', error);
    }
  };

  if (!isAdmin) {
    return <p>Access denied. You do not have permission to view this page.</p>;
  }

  return (
    <div>
        <h4>Add a New Subject</h4>
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="Enter subject name"
        />
        <textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Enter subject description"
        />
        <p><button onClick={handleAddSubject}>Add Subject</button></p>
      <div>
        <h4>Subjects List</h4>
        {subjects.map(subject => (
          <div key={subject.id} className="admin-item">
            {editingSubject === subject.id ? (
              <div>
                <input
                  type="text"
                  value={updatedSubject}
                  onChange={(e) => setUpdatedSubject(e.target.value)}
                  placeholder="Edit subject name"
                />
                <textarea
                  value={updatedDescription}
                  onChange={(e) => setUpdatedDescription(e.target.value)}
                  placeholder="Edit subject description"
                />
                <div style={{ display: 'flex', justifyContent: 'left', gap: '10px' }}>
                    <button onClick={() => handleEditSubject(subject.id)}>Save</button>
                    <button onClick={() => setEditingSubject(null)}>Cancel</button>
                </div>
                
              </div>
            ) : (
              <div>
                <p><strong>{subject.name}</strong></p>
                <p>{subject.description}</p>
                <div style={{ display: 'flex', justifyContent: 'left', gap: '10px' }}>
                  <button onClick={() => {
                    setEditingSubject(subject.id);
                    setUpdatedSubject(subject.name);
                    setUpdatedDescription(subject.description);
                  }}>Edit</button>
                  <button onClick={() => handleDeleteSubject(subject.id)}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubjectManagement;
