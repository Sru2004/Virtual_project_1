import React, { useEffect, useState } from "react";
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { toastSuccess, toastError } from '../../lib/toast';
import ArtworkCard from '../artworks/ArtworkCard';

export default function UserDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [artworks, setArtworks] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [categoryFilter, setCategoryFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");

  const [loading, setLoading] = useState(true);

  const resolveArtworkImage = (artwork) => {
    return (
      artwork?.image_url ||
      artwork?.watermarked_image_url ||
      artwork?.watermarkedImage ||
      artwork?.imageUrl ||
      ''
    );
  };

  const resolveArtworkDescription = (artwork) => {
    return (
      artwork?.description ||
      artwork?.details ||
      artwork?.summary ||
      ''
    );
  };

  const resolveArtistName = (artwork) => {
    if (artwork?.artist_name) {
      return artwork.artist_name;
    }

    if (artwork?.artist_id && typeof artwork.artist_id === 'object') {
      return artwork.artist_id.artist_name || artwork.artist_id.full_name || 'Unknown Artist';
    }

    return artwork?.artistName || 'Unknown Artist';
  };

  const handleAddToCart = async (artworkOrId) => {
    try {
      const artworkId = artworkOrId?._id || artworkOrId;
      const currentCart = JSON.parse(localStorage.getItem('cartItems') || '{}');
      const newQuantity = (currentCart[artworkId] || 0) + 1;
      currentCart[artworkId] = newQuantity;
      localStorage.setItem('cartItems', JSON.stringify(currentCart));
      window.dispatchEvent(new Event('storage'));
      toastSuccess(`Added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toastError('Failed to add item to cart. Please try again.');
    }
  };

  const handleWishlistToggle = async (artworkId) => {
    try {
      const isInWishlist = wishlist.some(item => item.artwork_id === artworkId);
      if (isInWishlist) {
        await api.removeFromWishlist(artworkId);
      } else {
        await api.addToWishlist(artworkId);
      }
      const updatedWishlist = await api.getWishlist();
      setWishlist(updatedWishlist || []);
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleViewDetails = (artworkId) => {
    navigate(`/artwork-details/${artworkId}`);
  };

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const artworksRes = await api.getPublicArtworks();
        const artworksArray = Array.isArray(artworksRes) ? artworksRes : [];
        setArtworks(artworksArray);
        setFiltered(artworksArray);
      } catch (error) {
        console.error('Error fetching artworks:', error);
        setArtworks([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchWishlist = async () => {
      try {
        const wishlistData = await api.getWishlist();
        setWishlist(wishlistData || []);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setWishlist([]);
      }
    };

    fetchArtworks();
    fetchWishlist();

    const interval = setInterval(fetchArtworks, 30000);

    const handleArtworkUploaded = () => {
      fetchArtworks();
    };

    const handleWishlistUpdate = () => {
      fetchWishlist();
    };

    window.addEventListener('artworkUploaded', handleArtworkUploaded);
    window.addEventListener('wishlistUpdated', handleWishlistUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('artworkUploaded', handleArtworkUploaded);
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    };
  }, []);

  useEffect(() => {
    let items = artworks;

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

    setFiltered(items);
  }, [categoryFilter, minPrice, maxPrice, ratingFilter, artworks]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 p-6 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome, {profile?.full_name || "User"}
          </h1>
          <p className="text-gray-600">Explore amazing artworks from talented artists.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 transition-all duration-300 h-fit">
          <h3 className="font-semibold text-lg mb-3">Filters</h3>

          <label className="text-sm block mb-2">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg mb-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
            className="w-full border border-gray-300 p-2 rounded-lg my-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg mb-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />

          <label className="text-sm block mb-2">Minimum Rating</label>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="1">1+ Stars</option>
          </select>
        </div>

        <div className="md:col-span-3">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Artworks</h2>
            <div className="h-1 w-12 bg-orange-500 rounded-full"></div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
              <p className="text-gray-500">No artworks match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((art) => (
                <ArtworkCard
                  key={art._id}
                  artworkId={art._id}
                  image={resolveArtworkImage(art)}
                  title={art.title}
                  category={art.category}
                  description={resolveArtworkDescription(art)}
                  price={art.price}
                  artistName={resolveArtistName(art)}
                  rating={art.rating}
                  isInWishlist={wishlist.some(item => item.artwork_id === art._id)}
                  onAddToCart={() => handleAddToCart(art)}
                  onToggleWishlist={handleWishlistToggle}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

