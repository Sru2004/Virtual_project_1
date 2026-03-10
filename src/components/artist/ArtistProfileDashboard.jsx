import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
// eslint-disable-next-line no-unused-vars
import Navbar from '../layout/Navbar';
// eslint-disable-next-line no-unused-vars
import ArtistHeader from './ArtistHeader';
// eslint-disable-next-line no-unused-vars
import ArtistStatsCards from './ArtistStatsCards';
// eslint-disable-next-line no-unused-vars
import ArtistOverviewTab from './ArtistOverviewTab';
// eslint-disable-next-line no-unused-vars
import ArtistArtworksTab from './ArtistArtworksTab';
// eslint-disable-next-line no-unused-vars
import ArtistOrdersTab from './ArtistOrdersTab';
// eslint-disable-next-line no-unused-vars
import ArtistReviewsTab from './ArtistReviewsTab';

const ArtistProfileDashboard = () => {
  const { profile, artistProfile, refreshProfile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [artworks, setArtworks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);
  const initialFetchDone = useRef(false);
  const [stats, setStats] = useState({
    totalUploads: 0,
    avgRating: 0,
    orders: 0,
  });

  useEffect(() => {
    // Wait for auth to finish loading before fetching dashboard data
    if (authLoading) {
      return;
    }

    // Only fetch on initial load, not on every profile change
    if (!initialFetchDone.current && (profile?._id || profile?.id)) {
      initialFetchDone.current = true;
      fetchDashboardData();
      refreshProfile();
    } else if (!initialFetchDone.current && profile) {
      initialFetchDone.current = true;
      fetchDashboardData();
    }

    const handleArtworkUploaded = () => {
      fetchDashboardData();
    };

    window.addEventListener('artworkUploaded', handleArtworkUploaded);

    return () => {
      window.removeEventListener('artworkUploaded', handleArtworkUploaded);
    };
  }, [authLoading, profile?._id, profile?.id]);

  const fetchDashboardData = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setLoading(true);
    setError(null);

    try {
      // Fetch data sequentially with individual error handling
      const statsRes = await api.getArtistDashboardStats().catch(() => null);
      const artworksRes = await api.getMyArtworks().catch(() => []);
      const ordersRes = await api.getArtistOrders().catch(() => []);
      const reviewsRes = await api.getArtistReviews().catch(() => []);

      // Handle stats response
      if (statsRes?.success && statsRes?.stats) {
        setStats({
          totalUploads: statsRes.stats.totalUploads || 0,
          avgRating: statsRes.stats.avgRating || 0,
          orders: statsRes.stats.orders || 0,
        });
      }

      // Handle artworks response
      const artworksData = Array.isArray(artworksRes)
        ? artworksRes
        : artworksRes?.artworks || artworksRes?.data || [];

      // Handle orders response
      const ordersData =
        ordersRes?.success && Array.isArray(ordersRes.orders)
          ? ordersRes.orders
          : Array.isArray(ordersRes)
          ? ordersRes
          : [];

      // Handle reviews response
      const reviewsData =
        reviewsRes?.success && Array.isArray(reviewsRes.reviews)
          ? reviewsRes.reviews
          : Array.isArray(reviewsRes)
          ? reviewsRes
          : [];

      setArtworks(artworksData);
      setOrders(ordersData);
      setReviews(reviewsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <ArtistHeader
        profile={profile}
        artistProfile={artistProfile}
        onProfilePictureUpdate={() => {
          refreshProfile();
          fetchDashboardData();
        }}
      />

      <ArtistStatsCards stats={stats} />

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Error loading dashboard data</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Loading dashboard data...
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            
            {/* Premium Tabs */}
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex overflow-x-auto px-6 py-3 space-x-4">
                {['overview', 'artworks', 'orders', 'reviews'].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative px-5 py-3 text-sm font-semibold rounded-lg transition-all duration-300 whitespace-nowrap
                        ${
                          activeTab === tab
                            ? 'text-blue-600 bg-white shadow-sm'
                            : 'text-gray-500 hover:text-blue-600 hover:bg-white/70'
                        }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}

                      <span
                        className={`absolute left-0 -bottom-2 h-0.5 w-full transition-all duration-300 ${
                          activeTab === tab
                            ? 'bg-blue-600'
                            : 'bg-transparent'
                        }`}
                      />
                    </button>
                  )
                )}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <ArtistOverviewTab
                  orders={orders}
                  artworks={artworks}
                  stats={stats}
                />
              )}

              {activeTab === 'artworks' && (
                <ArtistArtworksTab
                  artworks={artworks}
                  profile={profile}
                  artistProfile={artistProfile}
                  onArtworkDeleted={(artworkId) => {
                    if (artworkId) {
                      setArtworks((prev) =>
                        prev.filter(
                          (art) => (art._id || art.id) !== artworkId
                        )
                      );
                    }
                    fetchDashboardData();
                  }}
                  onArtworkUploaded={() => {
                    window.dispatchEvent(
                      new CustomEvent('artworkUploaded')
                    );
                  }}
                />
              )}

              {activeTab === 'orders' && (
                <ArtistOrdersTab orders={orders} />
              )}

              {activeTab === 'reviews' && (
                <ArtistReviewsTab reviews={reviews} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistProfileDashboard;
