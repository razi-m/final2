import React from 'react';

/**
 * ARIADOS logo — emblem + wordmark.
 *
 * The mark is a hexagon (structural / engineering cue) housing a stylized "A"
 * whose base terminates in a glowing scanning "eye" — the drone's aperture.
 * It reads as ARIADOS + aerial inspection, renders on any background (the hex
 * interior is transparent), and stays legible at favicon size.
 *
 * Props:
 *   className  — controls height (e.g. "h-8", "h-12"); width is automatic.
 *   variant    — "light" (default): white wordmark for dark backgrounds.
 *                "dark": near-black wordmark for light backgrounds.
 *   iconOnly   — render just the emblem, no wordmark (nav / favicon use).
 */
export const LogoMark = ({ className = 'h-8' }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="ARIADOS emblem"
  >
    <defs>
      <linearGradient id="ar-g" x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#22D3EE" />   {/* cyan-400 */}
        <stop offset="50%" stopColor="#8B5CF6" />  {/* violet-500 */}
        <stop offset="100%" stopColor="#F472B6" /> {/* pink-400 */}
      </linearGradient>
    </defs>

    {/* Hex shell — outline only, so it sits on any background */}
    <path
      d="M32 4 L54.9 17.2 L54.9 43.8 L32 57 L9.1 43.8 L9.1 17.2 Z"
      stroke="url(#ar-g)"
      strokeWidth="4.5"
      strokeLinejoin="round"
      fill="none"
    />

    {/* Stylized "A" */}
    <path
      d="M20 45 L32 12 L44 45"
      stroke="url(#ar-g)"
      strokeWidth="4.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <line x1="25.5" y1="34" x2="38.5" y2="34" stroke="url(#ar-g)" strokeWidth="4" strokeLinecap="round" />

    {/* Scanning eye / drone aperture at the base of the A */}
    <circle cx="32" cy="45" r="4.6" fill="url(#ar-g)" />
    <circle cx="30.6" cy="43.6" r="1.3" fill="#FFFFFF" opacity="0.85" />
  </svg>
);

const Logo = ({ className = 'h-8', variant = 'light', iconOnly = false }) => {
  const textColor = variant === 'dark' ? '#111827' : '#FFFFFF';

  if (iconOnly) {
    return <LogoMark className={className} />;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-full w-auto shrink-0" />
      <span
        style={{
          color: textColor,
          fontWeight: 700,
          fontSize: '1.3em',
          letterSpacing: '0.14em',
          lineHeight: 1,
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        ARIADOS
      </span>
    </div>
  );
};

export default Logo;
