
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Edit, Trash2, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { api } from '../../lib/api';
import { getImageUrl } from '../../lib/imageUtils';
import toast from 'react-hot-toast';

const Artists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const response = await api.getAllUsers();
      const artistsData = response.filter(user => user.user_type === 'artist');
      setArtists(artistsData);
    } catch (error) {
      console.error('Error fetching artists:', error);
      toast.error('Failed to load artists');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveArtist = async (artistId) => {
    try {
      await api.updateUser(artistId, { status: 'approved' });
      toast.success('Artist approved successfully');
      fetchArtists();
    } catch (error) {
      console.error('Error approving artist:', error);
      toast.error('Failed to approve artist');
    }
  };

  const handleRejectArtist = async (artistId) => {
    try {
      await api.updateUser(artistId, { status: 'rejected' });
      toast.success('Artist rejected');
      fetchArtists();
    } catch (error) {
      console.error('Error rejecting artist:', error);
      toast.error('Failed to reject artist');
    }
  };

  const handleSuspendArtist = async (artistId) => {
    try {
      await api.updateUser(artistId, { status: 'suspended' });
      toast.success('Artist suspended');
      fetchArtists();
    } catch (error) {
      console.error('Error suspending artist:', error);
      toast.error('Failed to suspend artist');
    }
  };

  const handleActivateArtist = async (artistId) => {
    try {
      await api.updateUser(artistId, { status: 'approved' });
      toast.success('Artist activated');
      fetchArtists();
    } catch (error) {
      console.error('Error activating artist:', error);
      toast.error('Failed to activate artist');
    }
  };

  const handleResetPassword = async (artistId) => {
    try {
      // This would typically send a password reset email
      toast.success('Password reset email sent');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };

  const openArtistModal = (artist) => {
    setSelectedArtist(artist);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedArtist(null);
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading artists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Artist Management</h1>
        <div className="text-sm text-gray-600">
          Total Artists: {artists.length} |
          Pending: {artists.filter(a => a.status === 'pending').length} |
          Approved: {artists.filter(a => a.status === 'approved').length} |
          Suspended: {artists.filter(a => a.status === 'suspended').length}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artworks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {artists.map((artist) => (
                <tr key={artist.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {artist.profile_picture ? (
                          <img
                            src={getImageUrl(artist.profile_picture)}
                            alt={artist.full_name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {artist.full_name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{artist.full_name}</div>
                        <div className="text-sm text-gray-500">{artist.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      artist.status === 'approved' ? 'bg-green-100 text-green-800' :
                      artist.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      artist.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {artist.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(artist.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* This would be fetched from artworks count */}
                    0
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openArtistModal(artist)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {artist.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveArtist(artist.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRejectArtist(artist.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {artist.status === 'approved' && (
                        <button
                          onClick={() => handleSuspendArtist(artist.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Suspend"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                      {artist.status === 'suspended' && (
                        <button
                          onClick={() => handleActivateArtist(artist.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Activate"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleResetPassword(artist.id)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Reset Password"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Artist Details Modal */}
      {showModal && selectedArtist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Artist Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                    {selectedArtist.profile_picture ? (
                      <img
                        src={getImageUrl(selectedArtist.profile_picture)}
                        alt={selectedArtist.full_name}
                        className="w-20 h-20 object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-2xl font-medium text-gray-700">
                          {selectedArtist.full_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{selectedArtist.full_name}</h3>
                    <p className="text-gray-600">{selectedArtist.email}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium mt-2 inline-block ${
                      selectedArtist.status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedArtist.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedArtist.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedArtist.status || 'pending'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email</p>
                        <p className="text-sm text-gray-600">{selectedArtist.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Joined</p>
                        <p className="text-sm text-gray-600">{new Date(selectedArtist.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Total Artworks</p>
                      <p className="text-lg font-semibold text-gray-800">0</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">AR-Enabled Artworks</p>
                      <p className="text-lg font-semibold text-gray-800">0</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6 border-t">
                  {selectedArtist.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleApproveArtist(selectedArtist.id);
                          closeModal();
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve Artist
                      </button>
                      <button
                        onClick={() => {
                          handleRejectArtist(selectedArtist.id);
                          closeModal();
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject Artist
                      </button>
                    </>
                  )}
                  {selectedArtist.status === 'approved' && (
                    <button
                      onClick={() => {
                        handleSuspendArtist(selectedArtist.id);
                        closeModal();
                      }}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Suspend Artist
                    </button>
                  )}
                  {selectedArtist.status === 'suspended' && (
                    <button
                      onClick={() => {
                        handleActivateArtist(selectedArtist.id);
                        closeModal();
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Activate Artist
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleResetPassword(selectedArtist.id);
                      closeModal();
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Artists;
