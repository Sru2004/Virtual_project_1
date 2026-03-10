import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../lib/adminApi';
import AdminSidebar from './AdminSidebar';
import OverviewSection from './OverviewSection';
import UsersSection from './UsersSection';
import ArtworksSection from './ArtworksSection';
import TransactionsSection from './TransactionsSection';
import ReviewsSection from './ReviewsSection';
import AnalyticsSection from './AnalyticsSection';
import ExhibitionsSection from './ExhibitionsSection';
import CertificatesSection from './CertificatesSection';
import ARVRSection from './ARVRSection';
import AIInsightsSection from './AIInsightsSection';
import NotificationsSection from './NotificationsSection';
import SettingsSection from './SettingsSection';
import MaintenanceSection from './MaintenanceSection';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('overview');
  const pollingRef = useRef(false);

  // State management
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArtists: 0,
    totalArtworks: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [userGrowth, setUserGrowth] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [artworkStatus, setArtworkStatus] = useState({
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [users, setUsers] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [error, setError] = useState(null);

  const POLL_INTERVAL_MS = 30000;

  // Sync active section with URL
  useEffect(() => {
    const path = location.pathname;
    const section = path.split('/admin/')[1] || 'overview';
    setActiveSection(section || 'overview');
  }, [location.pathname]);

  // Data fetching functions
  const fetchOverview = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setOverviewLoading(true);
    }
    setError(null);

    try {
      const [statsRes, growthRes, salesRes, statusRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUserGrowth(),
        adminApi.getSalesTrend(),
        adminApi.getArtworkStatus(),
      ]);

      setStats(statsRes);
      setUserGrowth(growthRes);
      setSalesTrend(salesRes);
      setArtworkStatus(statusRes);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load dashboard metrics.';
      setError(message);
    } finally {
      if (showSpinner) {
        setOverviewLoading(false);
      }
    }
  }, []);

  const fetchSectionData = useCallback(async (section, showSpinner = false) => {
    const needsData = ['users', 'artworks', 'transactions', 'reviews'];
    if (!needsData.includes(section)) {
      return;
    }

    if (showSpinner) {
      setSectionLoading(true);
    }
    setError(null);

    try {
      if (section === 'users') {
        const usersRes = await adminApi.getUsers();
        setUsers(usersRes);
      }

      if (section === 'artworks') {
        const artworksRes = await adminApi.getArtworks();
        setArtworks(artworksRes);
      }

      if (section === 'transactions') {
        const ordersRes = await adminApi.getOrders();
        setOrders(ordersRes);
      }

      if (section === 'reviews') {
        const reviewsRes = await adminApi.getReviews();
        setReviews(reviewsRes);
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load admin data.';
      setError(message);
    } finally {
      if (showSpinner) {
        setSectionLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (profile?.user_type !== 'admin') {
      return;
    }

    let isMounted = true;
    const load = async () => {
      setLoading(true);
      await fetchOverview(true);
      await fetchSectionData(activeSection, true);
      if (isMounted) {
        setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [profile?.user_type, activeSection, fetchOverview, fetchSectionData]);

  useEffect(() => {
    if (profile?.user_type !== 'admin') {
      return undefined;
    }

    const interval = setInterval(() => {
      if (pollingRef.current) {
        return;
      }

      pollingRef.current = true;
      fetchOverview(false).finally(() => {
        pollingRef.current = false;
      });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [profile?.user_type, fetchOverview]);

  // Artwork action handlers
  const handleApproveArtwork = async (artworkId) => {
    try {
      await adminApi.approveArtwork(artworkId);
      await Promise.all([
        fetchOverview(false),
        fetchSectionData('artworks', false)
      ]);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to approve artwork.';
      setError(message);
    }
  };

  const handleRejectArtwork = async (artworkId) => {
    try {
      await adminApi.rejectArtwork(artworkId);
      await Promise.all([
        fetchOverview(false),
        fetchSectionData('artworks', false)
      ]);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Failed to reject artwork.';
      setError(message);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Access control
  if (!profile || profile.user_type !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg">Access denied. Admin privileges required.</div>
        </div>
      </div>
    );
  }

  // Render active section
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <OverviewSection
            stats={stats}
            userGrowth={userGrowth}
            salesTrend={salesTrend}
            artworkStatus={artworkStatus}
          />
        );
      case 'users':
        return <UsersSection users={users} />;
      case 'artworks':
        return (
          <ArtworksSection
            artworks={artworks}
            onApprove={handleApproveArtwork}
            onReject={handleRejectArtwork}
          />
        );
      case 'exhibitions':
        return <ExhibitionsSection />;
      case 'transactions':
        return <TransactionsSection orders={orders} onOrdersUpdated={() => fetchSectionData('transactions', false)} />;
      case 'reviews':
        return <ReviewsSection reviews={reviews} />;
      case 'certificates':
        return <CertificatesSection />;
      case 'arvr':
        return <ARVRSection />;
      case 'ai-insights':
        return <AIInsightsSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'settings':
        return <SettingsSection />;
      case 'maintenance':
        return <MaintenanceSection />;
      default:
        return (
          <OverviewSection
            stats={stats}
            userGrowth={userGrowth}
            salesTrend={salesTrend}
            artworkStatus={artworkStatus}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}
        {(overviewLoading || sectionLoading) && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            Updating dashboard data...
          </div>
        )}
        <div className="flex gap-8">
          {/* Left Sidebar */}
          <AdminSidebar profile={profile} />

          {/* Right Panel */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {renderActiveSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
