import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { secureGetItem, secureRemoveItem } from '../utils/storage';

const ProtectedRoute: React.FC = () => {
  const token = secureGetItem('token');
  const adminDataString = secureGetItem('admin_data');
  console.log(adminDataString);
  console.log(token);

  if (!token) {
    // If no token is found, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  if (adminDataString) {
    try {
      if (adminDataString.hasChangedPassword === false) {
        // Force the user back to login so they are presented with the change password modal
        secureRemoveItem('token');
        secureRemoveItem('admin_data');
        return <Navigate to="/login" replace />;
      }
    } catch (e) {
      console.error('Failed to parse admin data', e);
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
