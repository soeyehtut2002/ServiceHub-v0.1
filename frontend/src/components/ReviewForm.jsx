import { useState } from 'react';
import API from '../api/axios';
import StarRating from './StarRating';
import toast from 'react-hot-toast';

const ReviewForm = ({ serviceId, bookingId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error('Please select a rating');

    setLoading(true);
    try {
      await API.post('/reviews', {
        service_id: serviceId,
        booking_id: bookingId || null,
        rating,
        comment,
      });
      toast.success('Review submitted! Thank you 🌟');
      setRating(0);
      setComment('');
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h4 className="review-form-title">✍️ Write a Review</h4>
      <div className="form-group">
        <label className="form-label">Your Rating</label>
        <StarRating rating={rating} onRate={setRating} size="lg" />
      </div>
      <div className="form-group">
        <label className="form-label">Comment (optional)</label>
        <textarea
          className="textarea"
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? 'Submitting...' : '⭐ Submit Review'}
      </button>

      <style>{`
        .review-form {
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .review-form-title { font-size: 1.05rem; font-weight: 700; }
      `}</style>
    </form>
  );
};

export default ReviewForm;
