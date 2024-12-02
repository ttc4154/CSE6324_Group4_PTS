import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase'; // Make sure to import your Firebase auth instance
import { useNavigate } from 'react-router-dom'; // Updated import
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

//   try {
//     const user = auth.currentUser;
//     const userDocRef = doc(db, "users", user.uid);
//     const userDoc = await getDoc(userDocRef);
//     const userData = userDoc.data();
//     const userMoney = userData.money;

//     // Pass userMoney to App component (using context)
    


// } catch (error) {
//     console.error("Error fetching user data:", error);
// }

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/user-profile'); // Redirect to user profile or dashboard
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForgotPassword = async () => {
    const emailAddress = prompt("Please enter your email address for password recovery:");
    if (emailAddress) {
      await sendPasswordResetEmail(auth, emailAddress);
      alert("Password reset email sent!");
    }
  };
  

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <label htmlFor="email">Username:</label>
        <input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="save-button" type="submit">Login</button>
        <button className="save-button" type="button" onClick={handleForgotPassword}>Forgot Password?</button>
      </form>
    </div>
  );
}

export default Login;
