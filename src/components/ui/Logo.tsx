import React, { useState } from 'react';

const FALLBACK_LOGOS = [
  "https://cryptologos.cc/logos/binance-coin-bnb-logo.svg",
  "https://cryptologos.cc/logos/binance-coin-bnb-logo.png",
  "https://upload.wikimedia.org/wikipedia/commons/5/57/Binance_Logo.png",
  "https://bin.bnbstatic.com/static/images/common/favicon.ico"
];

interface LogoProps {
  className?: string;
  alt?: string;
}

export const Logo: React.FC<LogoProps> = ({ className, alt = "Binance Logo" }) => {
  const [index, setIndex] = useState(0);

  return (
    <img 
      src={FALLBACK_LOGOS[index]} 
      className={`${className} object-contain`} 
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => {
        if (index < FALLBACK_LOGOS.length - 1) {
          setIndex(index + 1);
        }
      }}
      style={{ filter: 'drop-shadow(0 0 10px rgba(243, 186, 47, 0.2))' }}
    />
  );
};
