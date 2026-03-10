import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Download, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { toastSuccess, toastError } from '../../lib/toast';
import ProtectedImage from '../common/ProtectedImage';
import { getImageUrl } from '../../lib/imageUtils';

const MyPurchases = () => {
  const { profile } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [showOriginalModal, setShowOriginalModal] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await api.getOrders();
      
      // Extract purchased artworks from orders
      const purchasedArtworks = [];
      const orders = response.orders || response;
      
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const artwork = item.product || item.artwork_id;
            if (artwork) {
              purchasedArtworks.push({
                ...artwork,
                purchased_at: order.order_date || order.created_at,
                order_id: order._id,
                order_status: order.status
              });
            }
          });
        }
      });
      
      setPurchases(purchasedArtworks);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toastError('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadOriginal = async (artwork) => {
    try {
      toastSuccess('Preparing your high-resolution download...');

      const blob = await api.downloadOriginalImage(artwork._id);
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${artwork.title}-original-hires.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(objectUrl);
      
      toastSuccess('Download started!');
    } catch (error) {
      console.error('Error downloading original:', error);
      toastError(error.message || 'Failed to download original image');
    }
  };

  const handleViewOriginal = async (artwork) => {
    try {
      const blob = await api.downloadOriginalImage(artwork._id);
      const objectUrl = URL.createObjectURL(blob);
      setSelectedArtwork({ ...artwork, original_url: objectUrl });
      setShowOriginalModal(true);
    } catch (error) {
      console.error('Error viewing original:', error);
      toastError('Failed to load original image');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your purchases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-rose-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Purchases</h1>
          <p className="text-gray-600">View and download your purchased artworks in high resolution</p>
        </div>

        {/* Purchases Grid */}
        {purchases.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-10 w-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Purchases Yet</h2>
            <p className="text-gray-600 mb-6">Start exploring our gallery and purchase artworks to see them here!</p>
            <a href="/user-dashboard" className="inline-block bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold py-3 px-8 rounded-xl hover:from-amber-600 hover:to-rose-600 transition-all">
              Browse Artworks
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((artwork) => (
              <div key={artwork._id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all">
                {/* Watermarked Preview */}
                <div className="relative h-64">
                  <ProtectedImage
                    src={getImageUrl(artwork.watermarked_image_url || artwork.image_url)}
                    alt={artwork.title}
                    className="w-full h-full object-cover"
                    showProtectionNotice={false}
                  />
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Owned
                  </div>
                </div>

                {/* Details */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{artwork.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Purchased: {new Date(artwork.purchased_at).toLocaleDateString()}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewOriginal(artwork)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                    >
                      <Lock className="w-4 h-4" />
                      View Original
                    </button>
                    <button
                      onClick={() => handleDownloadOriginal(artwork)}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-amber-600 hover:to-rose-600 transition-all"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Original Image Modal */}
      {showOriginalModal && selectedArtwork && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => {
            if (selectedArtwork.original_url) {
              URL.revokeObjectURL(selectedArtwork.original_url);
            }
            setShowOriginalModal(false);
          }}
        >
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{selectedArtwork.title} - Original</h2>
                <button
                  onClick={() => {
                    if (selectedArtwork.original_url) {
                      URL.revokeObjectURL(selectedArtwork.original_url);
                    }
                    setShowOriginalModal(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Original Image (No Protection) */}
              <div className="mb-4">
                <img
                  src={selectedArtwork.original_url}
                  alt={selectedArtwork.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleDownloadOriginal(selectedArtwork)}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-amber-600 hover:to-rose-600 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download High Resolution
                </button>
                <button
                  onClick={() => setShowOriginalModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPurchases;
