import { useState } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const BookingModal = ({ service, onClose, onBooked }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) return toast.error('Please select date and time');

    const booking_date = new Date(`${date}T${time}`).toISOString();

    setLoading(true);
    try {
      await API.post('/bookings', {
        service_id: service.id,
        booking_date,
        notes: notes.trim() || null,
      });
      toast.success('Booking confirmed! 🎉');
      if (onBooked) onBooked();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">📅 Book Service</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Service Summary */}
        <div className="booking-service-info">
          <p className="booking-service-title">{service.title}</p>
          <p className="booking-service-price">
            <span className="price-tag"><span className="currency">$</span>{parseFloat(service.price).toFixed(2)}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="input"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                type="time"
                className="input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes for Provider (optional)</label>
            <textarea
              className="textarea"
              placeholder="Any specific requirements or information..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="booking-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Booking...' : '✅ Confirm Booking'}
            </button>
          </div>
        </form>

        <style>{`
          .booking-service-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255,255,255,0.04);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: var(--space-4);
            margin-bottom: var(--space-6);
          }
          .booking-service-title { font-weight: 700; font-size: 0.95rem; }
          .booking-form { display: flex; flex-direction: column; gap: var(--space-4); }
          .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
          .booking-actions { display: flex; gap: var(--space-3); justify-content: flex-end; margin-top: var(--space-2); }
          @media (max-width: 480px) { .form-row { grid-template-columns: 1fr; } }
        `}</style>
      </div>
    </div>
  );
};

export default BookingModal;
