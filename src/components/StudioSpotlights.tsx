import React from 'react';

interface StudioSpotlightsProps {
  mode?: 'intro' | 'playing' | 'urgent' | 'victory' | 'gameover';
}

export const StudioSpotlights: React.FC<StudioSpotlightsProps> = ({ mode = 'intro' }) => {
  const centerGlow =
    mode === 'victory'
      ? 'radial-gradient(ellipse at 50% 0%, rgba(251, 191, 36, 0.16) 0%, rgba(245, 158, 11, 0.05) 45%, transparent 72%)'
      : mode === 'urgent'
      ? 'radial-gradient(ellipse at 50% 0%, rgba(239, 68, 68, 0.14) 0%, rgba(185, 28, 28, 0.04) 45%, transparent 72%)'
      : mode === 'playing'
      ? 'radial-gradient(ellipse at 50% 0%, rgba(59, 130, 246, 0.13) 0%, rgba(30, 58, 138, 0.05) 45%, transparent 72%)'
      : 'radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.12) 0%, rgba(30, 58, 138, 0.06) 45%, transparent 72%)';

  const floorGlow =
    mode === 'victory'
      ? 'radial-gradient(ellipse at 50% 100%, rgba(251, 191, 36, 0.14) 0%, transparent 65%)'
      : mode === 'urgent'
      ? 'radial-gradient(ellipse at 50% 100%, rgba(225, 29, 72, 0.12) 0%, transparent 65%)'
      : 'radial-gradient(ellipse at 50% 100%, rgba(245, 158, 11, 0.10) 0%, transparent 65%)';

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* Calm, completely static overhead studio ambiance (zero flicker, zero blur repaint) */}
      <div className="absolute inset-0" style={{ background: centerGlow }} />

      {/* Subtle steady floor wash */}
      <div className="absolute inset-0" style={{ background: floorGlow }} />

      {/* Steady ceiling studio lamp accents (no pulse, no blur filter overhead) */}
      <div className="absolute top-0 inset-x-0 flex justify-around px-10 opacity-50">
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
      </div>
    </div>
  );
};
