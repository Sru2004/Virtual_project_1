import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';

// Page Components
import HomePage from './components/pages/HomePage.jsx';
import SearchPage from './components/pages/SearchPage.jsx';
import Settings from './components/pages/Settings.jsx';
import PublicArtistProfile from './components/pages/PublicArtistProfile.jsx';
import NotFound from './components/pages/NotFound.jsx';
import { AboutPage, ContactPage, HelpPage, TermsPage, PrivacyPage } from './components/pages/StaticPages.jsx';

// Auth Components
import LoginSelect from './components/auth/LoginSelect.jsx';
import UserAuth from './components/auth/UserAuth.jsx';
import ForgotPassword from './components/auth/ForgotPassword.jsx';
import ResetPassword from './components/auth/ResetPassword.jsx';
import ProtectedUserRoute from './components/auth/ProtectedUserRoute.jsx';

// Admin Components
import AdminLogin from './components/admin/AdminLogin.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute.jsx';

// Artist Components
import ArtistAuth from './components/artist/ArtistAuth.jsx';
import ArtistProfileDashboard from './components/artist/ArtistProfileDashboard.jsx';
import EditArtistProfile from './components/artist/EditArtistProfile.jsx';
import Artists from './components/artist/Artists.jsx';
import ArtistsPage from './components/artist/ArtistsPage.jsx';
import ProtectedArtistRoute from './components/artist/ProtectedArtistRoute.jsx';

// Buyer Components
import UserProfile from './components/buyer/UserProfile.jsx';
import UserDashboard from './components/buyer/UserDashboard.jsx';
import Cart from './components/buyer/Cart.jsx';
import MyOrders from './components/buyer/MyOrders.jsx';
import MyPurchases from './components/buyer/MyPurchases.jsx';

// Artwork Components
import ArtworkDetails from './components/artworks/ArtworkDetails.jsx';
import ARView from './components/artworks/ARView.jsx';
import WebcamAR from './components/artworks/WebcamAR.jsx';
import Desktop3DPreview from './components/artworks/Desktop3DPreview.jsx';
import MobileAR from './components/artworks/MobileAR.jsx';

// Admin - Other
import AddAddress from './components/buyer/AddAddress.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes with Navbar and Footer */}
          <Route path="/" element={
            <>
              <Navbar />
              <HomePage />
              <Footer onNavigate={(page) => window.location.href = `/${page}`} />
            </>
          } />

          {/* Static Pages */}
          <Route path="/about" element={
            <>
              <Navbar />
              <AboutPage />
              <Footer onNavigate={(page) => window.location.href = `/${page}`} />
            </>
          } />
          <Route path="/contact" element={
            <>
              <Navbar />
              <ContactPage />
              <Footer onNavigate={(page) => window.location.href = `/${page}`} />
            </>
          } />
          <Route path="/help" element={
            <>
              <Navbar />
              <HelpPage />
              <Footer onNavigate={(page) => window.location.href = `/${page}`} />
            </>
          } />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginSelect />} />
          <Route path="/login/artist" element={<ArtistAuth />} />
          <Route path="/login/user" element={<UserAuth />} />
          <Route path="/artist/login" element={<ArtistAuth />} />
          <Route path="/buyer/login" element={<UserAuth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          } />

          {/* Artist Protected Routes */}
          <Route path="/artist/profile" element={
            <ProtectedArtistRoute>
              <ArtistProfileDashboard />
            </ProtectedArtistRoute>
          } />
          <Route path="/artist/dashboard" element={
            <ProtectedArtistRoute>
              <ArtistProfileDashboard />
            </ProtectedArtistRoute>
          } />
          <Route path="/artist/profile/edit" element={
            <ProtectedArtistRoute>
              <>
                <Navbar />
                <EditArtistProfile />
                <Footer onNavigate={(page) => window.location.href = `/${page}`} />
              </>
            </ProtectedArtistRoute>
          } />

          {/* User/Buyer Protected Routes */}
          <Route path="/user/dashboard" element={
            <ProtectedUserRoute>
              <>
                <Navbar />
                <UserDashboard />
                <Footer onNavigate={(page) => window.location.href = `/${page}`} />
              </>
            </ProtectedUserRoute>
          } />
          <Route path="/user/profile" element={
            <ProtectedUserRoute>
              <>
                <Navbar />
                <UserProfile />
                <Footer />
              </>
            </ProtectedUserRoute>
          } />
          <Route path="/cart" element={
            <ProtectedUserRoute>
              <>
                <Navbar />
                <Cart />
                <Footer onNavigate={(page) => window.location.href = `/${page}`} />
              </>
            </ProtectedUserRoute>
          } />
          <Route path="/add-address" element={
            <ProtectedUserRoute>
              <>
                <Navbar />
                <AddAddress />
                <Footer onNavigate={(page) => window.location.href = `/${page}`} />
              </>
            </ProtectedUserRoute>
          } />
          <Route path="/my-orders" element={
            <ProtectedUserRoute>
              <>
                <Navbar />
                <MyOrders />
                <Footer onNavigate={(page) => window.location.href = `/${page}`} />
              </>
            </ProtectedUserRoute>
          } />
          <Route path="/my-purchases" element={
            <ProtectedUserRoute>
              <>
                <Navbar />
                <MyPurchases />
                <Footer onNavigate={(page) => window.location.href = `/${page}`} />
              </>
            </ProtectedUserRoute>
          } />

          {/* Artwork & Artist Pages */}
          <Route path="/artwork-details/:id" element={
            <>
              <Navbar />
              <ArtworkDetails />
              <Footer onNavigate={(page) => window.location.href = `/${page}`} />
            </>
          } />
          {/* AR experience routes - now public for all users */}
          <Route path="/ar-preview/:id" element={
            <>
              <ARView />
            </>
          } />
          <Route path="/ar-webcam/:artworkId" element={
            <>
              <WebcamAR />
            </>
          } />
          <Route path="/ar-3d-preview/:artworkId" element={
            <>
              <Desktop3DPreview />
            </>
          } />
          <Route path="/ar-mobile/:artworkId" element={
            <>
              <MobileAR />
            </>
          } />
          <Route path="/search" element={
            <>
              <Navbar />
              <SearchPage />
              <Footer />
            </>
          } />
          <Route path="/artists" element={
            <ProtectedUserRoute>
              <>
                <Navbar />
                <ArtistsPage />
                <Footer onNavigate={(page) => window.location.href = `/${page}`} />
              </>
            </ProtectedUserRoute>
          } />
          <Route path="/artists/:id" element={
            <ProtectedUserRoute>
              <>
                <Navbar />
                <PublicArtistProfile />
                <Footer onNavigate={(page) => window.location.href = `/${page}`} />
              </>
            </ProtectedUserRoute>
          } />

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
