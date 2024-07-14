import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ token, children }) => {
  // If there is a token, render the children components; otherwise, redirect to the home page
  return token ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
