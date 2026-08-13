import { getCountryFlag } from './countries';

export const CountryFlagImg = ({ value, size = 'w40', alt, className = '', fallbackEmoji = '🌍' }) => {
  const url = getCountryFlag(value, size);
  if (!url) {
    return (
      <span className={`shrink-0 select-none ${className}`} aria-hidden>
        {fallbackEmoji}
      </span>
    );
  }
  return (
    <img
      src={url}
      alt={alt || ''}
      loading="lazy"
      className={`shrink-0 rounded object-cover border border-black/5 ${className}`}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};

export default CountryFlagImg;
