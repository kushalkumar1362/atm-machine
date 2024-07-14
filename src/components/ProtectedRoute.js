import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ token, children }) => {
  return token ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
