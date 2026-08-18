import { useState, useMemo } from "react";

const PALETTE = [
  ["#2D1B0E", "#EAB308"], ["#1B2D0E", "#8CB369"], ["#0E1B2D", "#5B9BD5"],
  ["#2D0E1B", "#C75B7A"], ["#1B0E2D", "#9B72CF"], ["#0E2D1B", "#4ECDC4"],
  ["#2D2B0E", "#E8A838"], ["#1A0E2D", "#D4726A"], ["#0E2D2B", "#3AAFA9"],
  ["#2D0E0E", "#E07A5F"], ["#0E1A2D", "#81B29A"], ["#2D0E20", "#F2CC8F"],
  ["#142D0E", "#6B9A3D"], ["#0E2D20", "#2A9D8F"], ["#2D1A0E", "#E76F51"],
  ["#0E0E2D", "#7B68EE"],
];

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(name) {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function FoodPlaceholderSVG({ bg, fg, initials }) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='${bg}'/>
        <stop offset='100%' stop-color='${fg}' stop-opacity='0.3'/>
      </linearGradient>
    </defs>
    <rect width='400' height='300' fill='url(%23g)'/>
    <circle cx='200' cy='110' r='45' fill='${fg}' opacity='0.15'/>
    <text x='200' y='120' text-anchor='middle' dominant-baseline='central' font-family='system-ui,sans-serif' font-size='36' font-weight='800' fill='${fg}' opacity='0.8'>${initials}</text>
    <rect x='120' y='175' width='160' height='3' rx='1.5' fill='${fg}' opacity='0.2'/>
    <text x='200' y='205' text-anchor='middle' font-family='system-ui,sans-serif' font-size='11' font-weight='600' letter-spacing='0.15em' fill='${fg}' opacity='0.3'>AURUM &amp; EMBER</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function DrinkPlaceholderSVG({ fg, initials }) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='0.5' y2='1'>
        <stop offset='0%' stop-color='#1e3a5f'/>
        <stop offset='100%' stop-color='${fg}' stop-opacity='0.3'/>
      </linearGradient>
    </defs>
    <rect width='400' height='300' fill='url(%23g)'/>
    <path d='M180 60 L200 180 L220 60 Z' fill='${fg}' opacity='0.12' stroke='${fg}' stroke-opacity='0.2' stroke-width='1'/>
    <circle cx='200' cy='120' r='30' fill='${fg}' opacity='0.15'/>
    <text x='200' y='128' text-anchor='middle' dominant-baseline='central' font-family='system-ui,sans-serif' font-size='28' font-weight='800' fill='${fg}' opacity='0.8'>${initials}</text>
    <rect x='140' y='190' width='120' height='3' rx='1.5' fill='${fg}' opacity='0.2'/>
    <text x='200' y='220' text-anchor='middle' font-family='system-ui,sans-serif' font-size='11' font-weight='600' letter-spacing='0.15em' fill='${fg}' opacity='0.3'>AURUM &amp; EMBER</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export default function MealImage({ name, image, category, className = "", style = {} }) {
  const [imgSrc, setImgSrc] = useState(() => {
    if (image) return image;
    return null;
  });
  const [attempted, setAttempted] = useState(false);

  const { bg, fg, initials } = useMemo(() => {
    const h = hashCode(name || "unknown");
    const [bg, fg] = PALETTE[h % PALETTE.length];
    return { bg, fg, initials: getInitials(name) };
  }, [name]);

  const isDrink = useMemo(() => {
    const c = (category || '').toLowerCase();
    return c === 'drinks' || c === 'drink' || c === 'cocktail' || c === 'beverage';
  }, [category]);

  const handleError = () => {
    if (!attempted) {
      setAttempted(true);
      if (image) {
        setImgSrc(null);
      }
    }
  };

  const fallbackSrc = isDrink
    ? DrinkPlaceholderSVG({ bg, fg, initials })
    : FoodPlaceholderSVG({ bg, fg, initials });

  if (!imgSrc || attempted) {
    return <img src={fallbackSrc} alt={name || 'Food'} className={className} style={style} loading="lazy" />;
  }

  return (
    <img
      src={imgSrc}
      alt={name || 'Food'}
      className={className}
      style={style}
      loading="lazy"
      onError={handleError}
    />
  );
}
