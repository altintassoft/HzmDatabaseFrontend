import React from 'react';
import { Navigate } from 'react-router-dom';
import { useDatabase } from '../context/DatabaseContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { state } = useDatabase();

  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!state.user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;