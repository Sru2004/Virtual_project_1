import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedAdminRoute = ({ children }) => {
  const { profile, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedAdminRoute: Checking access...', { profile, loading, pathname: location.pathname });

  if (loading) {
    console.log('ProtectedAdminRoute: Still loading...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    console.log('ProtectedAdminRoute: No profile, redirecting to admin login');
    // Redirect to admin login with return url
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (profile.user_type !== 'admin') {
    console.log('ProtectedAdminRoute: Not admin, redirecting to home');
    // Not an admin, redirect to home
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedAdminRoute: Access granted, rendering children');
  return children;
};

export default ProtectedAdminRoute;
