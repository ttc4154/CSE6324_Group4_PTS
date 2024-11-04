// Register.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

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

  const subjects = [
    "Math Tutoring", 
    "Science Tutoring", 
    "Writing Support", 
    "Tennis Coaching", 
    "Piano Lessons", 
    "English Tutoring", 
    "Programming Classes"
  ];

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
      });

      alert("Registration successful!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Phone Number (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="text"
          placeholder="Address (optional)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div>
          <label>
            <input
              type="radio"
              value="student"
              checked={userType === 'student'}
              onChange={() => setUserType('student')}
            />
            Register as Student
          </label>
          <label>
            <input
              type="radio"
              value="tutor"
              checked={userType === 'tutor'}
              onChange={() => setUserType('tutor')}
            />
            Register as Tutor
          </label>
        </div>

        <div>
          <p>Select Subjects:</p>
          {subjects.map((subject) => (
            <label key={subject}>
              <input
                type="checkbox"
                value={subject}
                checked={selectedSubjects.includes(subject)}
                onChange={() => handleSubjectChange(subject)}
              />
              {subject}
            </label>
          ))}
        </div>

        <div>
          <p>Select Member Status:</p>
          <label>
            <input
              type="radio"
              value="regular"
              checked={memberStatus === 'regular'}
              onChange={() => setMemberStatus('regular')}
            />
            Regular Member
          </label>
          <label>
            <input
              type="radio"
              value="coordinator"
              checked={memberStatus === 'coordinator'}
              onChange={() => setMemberStatus('coordinator')}
            />
            Coordinator
          </label>
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
