import React from 'react';
import { Star } from 'lucide-react';

const ArtistReviewsTab = ({ reviews }) => {
  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Filter reviews to only show ones with actual ratings and comments from buyers
  const validReviews = reviews.filter(review => 
    review && 
    review.rating && 
    review.rating > 0 && 
    review.user_id && 
    (review.comment || review.rating > 0)
  );

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
      {validReviews.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No reviews yet</p>
      ) : (
        <div className="space-y-4">
          {validReviews.map((review) => (
            <div key={review._id || review.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-700 font-medium">
                      {review?.user_id?.full_name || 'Anonymous'}
                    </span>
                  </div>
                  {review?.artwork_id?.title && (
                    <p className="text-xs text-gray-500">
                      {review.artwork_id.title}
                    </p>
                  )}
                </div>
                <span className="text-sm text-gray-600">
                  {new Date(review.created_at || review.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
              {review.comment && <p className="text-gray-700">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtistReviewsTab;
