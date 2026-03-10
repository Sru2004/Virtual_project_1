import React from 'react';
import { Star, Upload, ShoppingCart } from 'lucide-react';
import { getImageUrl } from '../../lib/imageUtils';

const ArtistOverviewTab = ({ orders = [], artworks = [], stats = {} }) => {
  // Calculate average rating from reviews if not provided in stats
  const avgRating = stats?.avgRating || 0;
  
  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{artworks?.length || 0}</p>
              <p className="text-sm text-gray-600">Total Artworks</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{orders?.length || 0}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}</p>
              <p className="text-sm text-gray-600">Avg Rating</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.orders || 0}</p>
              <p className="text-sm text-gray-600">Order Count</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
        <div className="space-y-4">
          {orders && orders.slice(0, 5).map((order) => {
            const artwork = order.artwork_id;
            return (
              <div key={order._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={getImageUrl(artwork?.image_url) || 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg'}
                  alt=""
                  className="w-12 h-12 rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg';
                  }}
                />
                <div className="flex-1">
                  <p className="font-medium">{artwork?.title || 'Artwork'}</p>
                  <p className="text-sm text-gray-600">Sold for ₹{order.total_amount || order.amount}</p>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(order.order_date || order.created_at).toLocaleDateString()}
                </span>
              </div>
            );
          })}
          {(!orders || orders.length === 0) && (
            <p className="text-gray-500 text-center py-8">No recent activity yet</p>
          )}
        </div>
      </div>

      {/* Recent Artworks Added */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Artworks Added</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {artworks && artworks.slice(0, 4).map((art) => (
            <div key={art._id || art.id} className="bg-white rounded-lg border overflow-hidden">
              <img
                src={getImageUrl(art.image_url || art.watermarked_image_url) || 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg'}
                alt={art.title}
                className="w-full h-24 object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg';
                }}
              />
              <div className="p-2">
                <p className="font-medium text-sm truncate">{art.title}</p>
                <p className="text-xs text-gray-500">₹{Number(art.price).toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
          {(!artworks || artworks.length === 0) && (
            <p className="text-gray-500 text-center py-4 col-span-4">No artworks uploaded yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistOverviewTab;
