import React from 'react';

const ReviewsSection = ({ reviews }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Review Moderation</h1>
      <div className="space-y-4">
        {reviews.map((review) => {
          const reviewId = review._id || review.id;
          const reviewUser = review.user_id;
          const reviewUserLabel = typeof reviewUser === 'object'
            ? (reviewUser.full_name || reviewUser.email || reviewUser._id)
            : reviewUser;
          const reviewArtwork = review.artwork_id;
          const reviewArtworkLabel = typeof reviewArtwork === 'object'
            ? (reviewArtwork.title || reviewArtwork._id)
            : reviewArtwork;
          return (
            <div key={reviewId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-800">
                      {reviewUserLabel ? `User ${reviewUserLabel.toString().slice(0, 8)}...` : 'User'}
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-sm ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">
                    Approve
                  </button>
                  <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                    Reject
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Artwork: {reviewArtworkLabel ? `${reviewArtworkLabel.toString().slice(0, 8)}...` : 'N/A'} • {new Date(review.created_at || Date.now()).toLocaleDateString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewsSection;
