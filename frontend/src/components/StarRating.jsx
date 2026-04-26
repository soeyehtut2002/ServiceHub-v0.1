import { useState } from 'react';

const StarRating = ({ rating = 0, onRate, readonly = false, size = 'md' }) => {
  const [hovered, setHovered] = useState(0);

  const sizes = { sm: '14px', md: '20px', lg: '28px' };
  const fontSize = sizes[size] || sizes.md;

  const stars = [1, 2, 3, 4, 5];
  const display = hovered || rating;

  return (
    <div className="star-rating" style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {stars.map((star) => (
        <span
          key={star}
          onClick={() => !readonly && onRate && onRate(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          style={{
            fontSize,
            cursor: readonly ? 'default' : 'pointer',
            transition: 'transform 0.15s ease, color 0.15s ease',
            transform: !readonly && hovered >= star ? 'scale(1.25)' : 'scale(1)',
            filter: display >= star ? 'none' : 'grayscale(1)',
            userSelect: 'none',
            display: 'inline-block',
          }}
          title={readonly ? `${rating} stars` : `Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          {display >= star ? '⭐' : '☆'}
        </span>
      ))}
    </div>
  );
};

export default StarRating;
