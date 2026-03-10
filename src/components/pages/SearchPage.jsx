import React, { useState, useEffect } from "react";
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { getImageUrl } from '../../lib/imageUtils';
import { Search, Star, ShoppingCart } from 'lucide-react';
import { toastSuccess, toastError } from '../../lib/toast';

export default function SearchPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [artworks, setArtworks] = useState([]);
  const [filteredArtworks, setFilteredArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const artworksRes = await api.getPublicArtworks();
        setArtworks(artworksRes || []);
        setFilteredArtworks(artworksRes || []);
      } catch (error) {
        console.error('Error fetching artworks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  useEffect(() => {
    let items = artworks;

    if (searchQuery.trim() !== "") {
      items = items.filter(art =>
        art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (art.artist_id && typeof art.artist_id === 'object' && art.artist_id.artist_name && art.artist_id.artist_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (art.artist_id && typeof art.artist_id === 'string' && art.artist_id.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (categoryFilter) {
      items = items.filter((a) => a.category?.toLowerCase() === categoryFilter.toLowerCase());
    }

    if (minPrice) {
      items = items.filter((a) => Number(a.price) >= Number(minPrice));
    }

    if (maxPrice) {
      items = items.filter((a) => Number(a.price) <= Number(maxPrice));
    }

    if (ratingFilter) {
      items = items.filter((a) => {
        const artworkRating = a.rating ?? a.avg_rating ?? 0;
        return artworkRating >= Number(ratingFilter);
      });
    }

    setFilteredArtworks(items);
  }, [searchQuery, categoryFilter, minPrice, maxPrice, ratingFilter, artworks]);

  const handleAddToCart = async (artwork) => {
    try {
      const currentCart = JSON.parse(localStorage.getItem('cartItems') || '{}');
      const newQuantity = (currentCart[artwork._id] || 0) + 1;
      currentCart[artwork._id] = newQuantity;
      localStorage.setItem('cartItems', JSON.stringify(currentCart));
      window.dispatchEvent(new Event('storage'));
      toastSuccess(`Added "${artwork.title}" to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toastError('Failed to add item to cart. Please try again.');
    }
  };

  const handleViewDetails = (artwork) => {
    // Allow viewing artwork details without login
    navigate(`/artwork-details/${artwork._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading search...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      {/* Search Header */}
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 p-6 mb-6">
        <h1 className="text-2xl font-semibold mb-4">Search Artworks</h1>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by title, artist, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="mt-4 text-gray-600">
          {searchQuery.trim() === "" ? (
            <p>Showing all artworks ({filteredArtworks.length})</p>
          ) : (
            <p>Found {filteredArtworks.length} result{filteredArtworks.length !== 1 ? 's' : ''} for "{searchQuery}"</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar Filters */}
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 transition-all duration-300">
          <h3 className="font-semibold text-lg mb-3">Filters</h3>

          <label className="text-sm block mb-2">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full border p-2 rounded mb-3"
          >
            <option value="">All Categories</option>
            <option value="abstract">Abstract</option>
            <option value="landscapes">Landscapes</option>
            <option value="portraits">Portraits</option>
            <option value="mixed media">Mixed Media</option>
            <option value="digital">Digital</option>
            <option value="sculpture">Sculpture</option>
          </select>

          <label className="text-sm block mb-2">Price Range</label>
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full border p-2 rounded my-2"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full border p-2 rounded mb-3"
          />

          <label className="text-sm block mb-2">Minimum Rating</label>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="1">1+ Stars</option>
          </select>
        </div>

        {/* Right Side Artworks Grid */}
        <div className="md:col-span-3">
          {filteredArtworks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No artworks found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtworks.map((art) => (
                <div key={art._id} className="bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden flex flex-col border border-gray-100 hover:border-orange-200 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-full h-[200px] bg-gray-100 overflow-hidden">
                    <img
                      src={getImageUrl(art.image_url) || 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg'}
                      alt={art.title}
                      className="w-full h-full object-cover cursor-pointer transition-transform duration-500 hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg';
                      }}
                      onClick={() => handleViewDetails(art)}
                    />
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-xs font-medium text-orange-600 uppercase tracking-wide mb-2">
                      {art.category || 'General'}
                    </p>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-1">
                      {art.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                      <span className="text-gray-400">by</span>
                      <span className="font-medium">{art.artist_id?.artist_name || art.artist_id?.full_name || 'Unknown Artist'}</span>
                    </p>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{art.description || 'No description'}</p>

                    {art.rating && typeof art.rating === 'number' && art.rating > 0 && (
                      <div className="flex items-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= art.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">({art.rating})</span>
                      </div>
                    )}

                    <p className="text-gray-800 font-semibold mb-4">
                      ₹{Number(art.price || 0).toLocaleString("en-IN")}
                    </p>

                    <div className="flex gap-2 mt-auto items-center">
                      <button
                        className="flex-1 bg-orange-500 text-white py-2 rounded-2xl shadow-md font-medium text-sm hover:bg-orange-600 cursor-pointer"
                        onClick={() => handleViewDetails(art)}
                      >
                        View Details
                      </button>
                      {profile?.user_type === 'user' && (
                        <button
                          onClick={() => handleAddToCart(art)}
                          disabled={art.status === 'sold'}
                          className={`p-2 rounded-full transition-colors ${
                            art.status === 'sold'
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-gray-100 hover:bg-orange-100 text-orange-600'
                          }`}
                        >
                          <ShoppingCart className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

