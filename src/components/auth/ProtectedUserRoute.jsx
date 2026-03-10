import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedUserRoute = ({ children }) => {
  const { profile, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedUserRoute: Checking access...', { profile, loading, pathname: location.pathname });

  if (loading) {
    console.log('ProtectedUserRoute: Still loading...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (profile && profile.user_type !== 'user') {
    console.log('ProtectedUserRoute: Not a user, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedUserRoute: Access granted, rendering children');
  return children;
};

export default ProtectedUserRoute;
