// eslint-disable-next-line no-unused-vars
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedArtistRoute = ({ children }) => {
  const { profile, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedArtistRoute: Checking access...', { profile, loading, pathname: location.pathname });

  if (loading) {
    console.log('ProtectedArtistRoute: Still loading...');
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
    console.log('ProtectedArtistRoute: Not logged in, redirecting to artist login');
    return <Navigate to="/artist/login" replace />;
  }

  if (profile.user_type !== 'artist') {
    console.log('ProtectedArtistRoute: Not an artist, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedArtistRoute: Access granted, rendering children');
  return children;
};

export default ProtectedArtistRoute;
