// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const ProtectedRoute = ({ children }) => {
  const [user] = useAuthState(auth);
  
  if (!user) {
    return <Navigate to="/" replace />; // Redirect to home or login page if not logged in
  }

  return children;
};

export default ProtectedRoute;
