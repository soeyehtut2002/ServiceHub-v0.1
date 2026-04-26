import { Link } from 'react-router-dom';
import StarRating from './StarRating';

const ServiceCard = ({ service }) => {
  const imageUrl = service.image_url
    ? service.image_url.startsWith('/uploads')
      ? `http://localhost:5000${service.image_url}`
      : service.image_url
    : `https://source.unsplash.com/400x250/?${encodeURIComponent(service.category)},service`;

  const truncate = (text, len = 90) =>
    text?.length > len ? text.slice(0, len) + '…' : text;

  return (
    <Link to={`/services/${service.id}`} className="service-card">
      <div className="service-card-image">
        <img src={imageUrl} alt={service.title} loading="lazy" />
        <div className="service-card-category">{service.category}</div>
        {service.provider_verified && (
          <div className="service-card-verified">✓ Verified</div>
        )}
      </div>
      <div className="service-card-body">
        <h3 className="service-card-title">{service.title}</h3>
        <p className="service-card-desc">{truncate(service.description)}</p>
        <div className="service-card-meta">
          <span className="service-card-location">📍 {service.location}</span>
          <span className="service-card-provider">by {service.provider_name}</span>
        </div>
        <div className="service-card-footer">
          <div className="service-card-rating">
            <StarRating rating={parseFloat(service.avg_rating || 0)} readonly size="sm" />
            <span className="rating-value">{parseFloat(service.avg_rating || 0).toFixed(1)}</span>
            <span className="rating-count">({service.review_count || 0})</span>
          </div>
          <div className="service-card-price">
            <span className="currency">$</span>
            {parseFloat(service.price).toFixed(2)}
          </div>
        </div>
      </div>

      <style>{`
        .service-card {
          display: flex;
          flex-direction: column;
          background: var(--gradient-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: var(--transition);
          box-shadow: var(--shadow-card);
          cursor: pointer;
        }
        .service-card:hover {
          border-color: var(--border-hover);
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg), var(--shadow-glow);
        }
        .service-card-image {
          position: relative;
          height: 200px;
          overflow: hidden;
          background: var(--bg-input);
        }
        .service-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .service-card:hover .service-card-image img { transform: scale(1.08); }
        .service-card-category {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          color: var(--primary-light);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid rgba(108,99,255,0.3);
        }
        .service-card-verified {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0,212,170,0.9);
          color: #000;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          font-size: 0.7rem;
          font-weight: 700;
        }
        .service-card-body {
          padding: var(--space-4) var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          flex: 1;
        }
        .service-card-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .service-card-desc {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.5;
          flex: 1;
        }
        .service-card-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .service-card-location, .service-card-provider {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .service-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: var(--space-3);
          border-top: 1px solid var(--border);
          margin-top: var(--space-2);
        }
        .service-card-rating {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .rating-value { font-size: 0.85rem; font-weight: 700; color: var(--text-primary); }
        .rating-count { font-size: 0.75rem; color: var(--text-muted); }
        .service-card-price {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--success);
        }
        .service-card-price .currency { font-size: 0.75em; font-weight: 600; }
      `}</style>
    </Link>
  );
};

export default ServiceCard;
