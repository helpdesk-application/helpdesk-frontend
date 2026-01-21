import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  
  // 1. Check if user data exists in localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // 2. If no token, redirect to login page
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Check for Role-Based Access Control (RBAC)
  // If allowedRoles is provided, check if the user's role matches
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user doesn't have the right role, send them to an unauthorized page or dashboard
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. If everything is fine, render the protected component
  return children;
};

export default ProtectedRoute;