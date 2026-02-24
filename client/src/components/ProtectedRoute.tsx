import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  // Explicitly typing token to show it can be a string or null
  const token: string | null = localStorage.getItem('token');
  
  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
