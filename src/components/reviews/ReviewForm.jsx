import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { api } from '../../lib/api';
import { toastSuccess, toastError } from '../../lib/toast';

const ReviewForm = ({ artworkId, onReviewSubmitted, existingReview = null }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toastError('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (existingReview) {
        result = await api.updateReview(existingReview._id, { rating, comment });
        toastSuccess('Review updated successfully!');
      } else {
        result = await api.createReview({ artwork_id: artworkId, rating, comment });
        toastSuccess('Review submitted successfully!');
      }
      
      setRating(0);
      setComment('');
      onReviewSubmitted?.(result.review);
    } catch (error) {
      console.error('Error submitting review:', error);
      toastError(error.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        {existingReview ? 'Update Your Review' : 'Write a Review'}
      </h3>
      
      {/* Star Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Very Good'}
          {rating === 5 && 'Excellent'}
        </p>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review (optional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this artwork..."
          maxLength={1000}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
        />
        <p className="text-sm text-gray-500 text-right mt-1">
          {comment.length}/1000
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || rating === 0}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
          loading || rating === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-600 hover:to-rose-600 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
        }`}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            {existingReview ? 'Update Review' : 'Submit Review'}
          </>
        )}
      </button>
    </form>
  );
};

export default ReviewForm;
