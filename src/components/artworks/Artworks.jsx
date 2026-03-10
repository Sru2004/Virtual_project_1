import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Search,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../../lib/api';
import { getImageUrl } from '../../lib/imageUtils';
import toast from 'react-hot-toast';
import ConfirmModal from '../auth/ConfirmModal';

const Artworks = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, artworkId: null, artworkTitle: '' });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchArtworks();
  }, []);

  /* ---------------- FETCH ---------------- */
  const fetchArtworks = async () => {
    try {
      setLoading(true);
      const response = await api.getAllArtworks();
      setArtworks(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      toast.error('Failed to load artworks');
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- ACTIONS ---------------- */
  const handleApproveArtwork = async (artworkId) => {
    try {
      await api.updateArtwork(artworkId, { status: 'published' });
      toast.success('Artwork approved');
      fetchArtworks();
    } catch (error) {
      console.error(error);
      toast.error('Approval failed');
    }
  };

  const handleRejectArtwork = async (artworkId) => {
    try {
      await api.updateArtwork(artworkId, { status: 'rejected' });
      toast.success('Artwork rejected');
      fetchArtworks();
    } catch (error) {
      console.error(error);
      toast.error('Rejection failed');
    }
  };

  const handleDeleteArtwork = async (artworkId) => {
    const artwork = artworks.find(a => a.id === artworkId);
    setDeleteModal({
      isOpen: true,
      artworkId: artworkId,
      artworkTitle: artwork?.title || 'this artwork'
    });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteArtwork(deleteModal.artworkId);
      toast.success('Artwork deleted');
      setDeleteModal({ isOpen: false, artworkId: null, artworkTitle: '' });
      fetchArtworks();
    } catch (error) {
      console.error(error);
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  /* ---------------- FILTER ---------------- */
  const filteredArtworks = artworks.filter((artwork) => {
    const matchesFilter = filter === 'all' || artwork.status === filter;

    const title = (artwork.title || '').toLowerCase();
    const category = (artwork.category || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      title.includes(search) || category.includes(search);

    return matchesFilter && matchesSearch;
  });

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading artworks...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Artwork Management</h1>
        <div className="text-sm text-gray-600">
          Total: {artworks.length} | Pending:{' '}
          {artworks.filter(a => a.status === 'pending').length}
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            placeholder="Search artworks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {['all', 'pending', 'published', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* EMPTY STATE */}
      {filteredArtworks.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          No artworks found
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredArtworks.map((artwork) => (
          <div key={artwork.id} className="bg-white rounded-lg shadow border">
            <img
              src={getImageUrl(artwork.image_url)}
              alt={artwork.title}
              className="h-48 w-full object-cover"
              onError={(e) =>
                (e.currentTarget.src =
                  'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg')
              }
            />

            <div className="p-4">
              <h3 className="font-semibold truncate">{artwork.title}</h3>
              <p className="text-sm text-gray-600">{artwork.category}</p>

              <p className="font-bold text-blue-600 mt-1">
                ₹{Number(artwork.price || 0).toFixed(2)}
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setSelectedArtwork(artwork);
                    setShowModal(true);
                  }}
                  className="flex-1 bg-blue-100 text-blue-700 py-1 rounded"
                >
                  <Eye size={16} />
                </button>

                {artwork.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApproveArtwork(artwork.id)}
                      className="flex-1 bg-green-600 text-white py-1 rounded"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => handleRejectArtwork(artwork.id)}
                      className="flex-1 bg-red-600 text-white py-1 rounded"
                    >
                      <XCircle size={16} />
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleDeleteArtwork(artwork.id)}
                  className="bg-red-100 text-red-600 px-2 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && selectedArtwork && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full">
            <h2 className="text-xl font-bold mb-2">
              {selectedArtwork.title}
            </h2>
            <p>{selectedArtwork.description}</p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>
              <button
                onClick={async () => {
                  await handleDeleteArtwork(selectedArtwork.id);
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, artworkId: null, artworkTitle: '' })}
        onConfirm={confirmDelete}
        title="Delete Artwork"
        message={`Are you sure you want to delete "${deleteModal.artworkTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleting}
      />
    </div>
  );
};

export default Artworks;
