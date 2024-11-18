import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import '../styles/Register.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userType, setUserType] = useState('student'); // Default to 'student'
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]); // Store selected subjects
  const [phone, setPhone] = useState(''); // State for phone number
  const [address, setAddress] = useState(''); // State for address
  const [memberStatus, setMemberStatus] = useState('regular'); // Default member status
  const [error, setError] = useState('');
  const [subjects, setSubjects] = useState([]); // Store subjects from Firestore
  const [resetPasswordEmail, setResetPasswordEmail] = useState(''); // For resetting password
  const [resetEmailError, setResetEmailError] = useState('');

  // Fetch subjects from Firestore
  useEffect(() => {
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
  }, []); // Empty dependency array to run only once when the component mounts

  // Toggle subject selection
  const handleSubjectChange = (subject) => {
    setSelectedSubjects((prev) =>
      prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      await updateProfile(user, { displayName });
      
      const collection = userType === 'student' ? 'students' : 'tutors';
      
      console.log("User authenticated successfully:", user);
  
      // Attempt to save to Firestore
      await setDoc(doc(db, collection, user.uid), {
        displayName,
        email,
        userType,
        additionalInfo,
        selectedSubjects,
        phone,
        address,
        memberStatus,
        createdAt: new Date(),
        id: user.uid,
      });
  
      console.log("User data saved to Firestore:", user.uid);
  
      alert("Registration successful!");

      await setDoc(doc(db, "userchats", user.uid), {
        chats: [],
      });
      
    } catch (err) {
      setError(err.message);
      console.error("Error in registration:", err);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async () => {
    if (!resetPasswordEmail) {
      setResetEmailError('Please enter your email address.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetPasswordEmail);
      alert('Password reset email sent!');
      setResetPasswordEmail('');
      setResetEmailError('');
    } catch (error) {
      setResetEmailError('Error sending password reset email. Please try again.');
      console.error('Error in sending password reset email:', error);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Phone Number (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Address (optional)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
  
        <div style={{ marginBottom: '10px' }}>
          <p>Register as:</p>
          <label style={{ display: 'inline-flex', alignItems: 'center', marginRight: '20px' }}>
            <input
              type="radio"
              value="student"
              checked={userType === 'student'}
              onChange={() => setUserType('student')}
              style={{ marginRight: '5px' }} // Adds space between checkbox and text
            />
            Student
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center' }}>
            <input
              type="radio"
              value="tutor"
              checked={userType === 'tutor'}
              onChange={() => setUserType('tutor')}
              style={{ marginRight: '5px' }} // Adds space between checkbox and text
            />
            Tutor
          </label>
        </div>
  
        <div style={{ marginBottom: '10px' }}>
          <p>Select Subjects:</p>
          {subjects.map((subject) => (
            <label key={subject} style={{ display: 'inline-flex', alignItems: 'center', marginRight: '10px' }}>
              <input
                type="checkbox"
                value={subject}
                checked={selectedSubjects.includes(subject)}
                onChange={() => handleSubjectChange(subject)}
                style={{ marginRight: '5px' }} // Adds space between checkbox and text
              />
              {subject}
            </label>
          ))}
        </div>
  
        <div style={{ marginBottom: '10px' }}>
          <p>Select Member Status:</p>
          <label style={{ display: 'inline-flex', alignItems: 'center', marginRight: '20px' }}>
            <input
              type="radio"
              value="regular"
              checked={memberStatus === 'regular'}
              onChange={() => setMemberStatus('regular')}
              style={{ marginRight: '5px' }} // Adds space between checkbox and text
            />
            Regular
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center' }}>
            <input
              type="radio"
              value="coordinator"
              checked={memberStatus === 'coordinator'}
              onChange={() => setMemberStatus('coordinator')}
              style={{ marginRight: '5px' }} // Adds space between checkbox and text
            />
            Coordinator
          </label>
        </div>
  
        <button type="submit">Register</button>
      </form>

      {/* Forgot Password Section */}
      <div>
        <p>Forgot your password?</p>
        <input
          type="email"
          placeholder="Enter your email"
          value={resetPasswordEmail}
          onChange={(e) => setResetPasswordEmail(e.target.value)}
        />
        {resetEmailError && <p style={{ color: 'red' }}>{resetEmailError}</p>}
        <button type="button" onClick={handleForgotPassword}>
          Reset Password
        </button>
      </div>
    </div>
  );
}

export default Register;
