import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase'; // Make sure to import your Firebase auth instance
import { useNavigate } from 'react-router-dom'; // Updated import

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

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
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={handleForgotPassword}>Forgot Password?</button>
    </div>
  );
}

export default Login;
