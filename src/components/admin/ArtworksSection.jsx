import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { getImageUrl } from '../../lib/imageUtils';

const ArtworksSection = ({ artworks, onApprove, onReject }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Artwork Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks.map((artwork) => {
          const artworkId = artwork._id || artwork.id;
          const approvalStatus = artwork.approval_status || artwork.status || 'pending';
          return (
            <div key={artworkId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gray-200">
                <img
                  src={getImageUrl(artwork.image_url)}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-1">{artwork.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{artwork.category}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold text-blue-600">₹{artwork.price.toFixed(2)}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    approvalStatus === 'approved' || approvalStatus === 'published' ? 'bg-green-100 text-green-700' :
                    approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {approvalStatus}
                  </span>
                </div>
                <div className="flex gap-2">
                  {approvalStatus === 'pending' && (
                    <>
                      <button
                        onClick={() => onApprove(artworkId)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => onReject(artworkId)}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center justify-center gap-1"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </>
                  )}
                  <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ArtworksSection;
