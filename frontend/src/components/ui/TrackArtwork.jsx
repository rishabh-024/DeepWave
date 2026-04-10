import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Music2 } from 'lucide-react';

import { isPlaceholderCoverUrl } from '../../utils/coverArt';

function TrackArtwork({
  src,
  alt,
  title,
  className = '',
  loading = 'lazy',
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const shouldRenderImage =
    Boolean(src) && !hasError && !isPlaceholderCoverUrl(src);

  if (shouldRenderImage) {
    return (
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onError={() => setHasError(true)}
        className={className}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative z-10 overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(155deg,#f8fafc_0%,#ffffff_34%,#eef2ff_100%)] dark:bg-[linear-gradient(155deg,#020617_0%,#0f172a_38%,#312e81_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.24),transparent_38%),radial-gradient(circle_at_85%_20%,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_bottom,rgba(139,92,246,0.16),transparent_42%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.26),transparent_38%),radial-gradient(circle_at_85%_20%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_bottom,rgba(99,102,241,0.16),transparent_42%)]" />

      <div className="absolute inset-5 rounded-[1.75rem] border border-white dark:border-white/10" />
      <div className="absolute -right-8 top-8 h-20 w-20 rounded-full border border-white dark:border-white/10" />
      <div className="absolute -left-10 bottom-8 h-28 w-28 rounded-full border border-white dark:border-violet-400/20" />

      <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/90 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 shadow-[0_10px_24px_rgba(255,255,255,0.95)] dark:border-white/10 dark:bg-white/10 dark:text-slate-300/80 dark:shadow-none">
        <Music2 className="h-3.5 w-3.5 text-violet-500 dark:text-violet-300" />
        DeepWave
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-white/90 bg-white/80 shadow-[0_16px_40px_rgba(255,255,255,0.92)] backdrop-blur-md dark:border-white/10 dark:bg-white/10 dark:shadow-black/20">
          <div className="absolute inset-3 rounded-full border border-white/90 dark:border-white/10" />
          <Music2 className="relative h-10 w-10 text-violet-500 dark:text-white/85" />
        </div>
      </div>

      <div className="absolute bottom-5 left-5 right-5 z-30">
        <div className="inline-flex max-w-full items-center rounded-full border border-white bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-[0_10px_24px_rgba(255,255,255,0.95)] dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-300 dark:shadow-none">
          <span className="truncate">{title || 'Curated Soundscape'}</span>
        </div>
      </div>
    </div>
  );
}

TrackArtwork.propTypes = {
  alt: PropTypes.string,
  className: PropTypes.string,
  loading: PropTypes.oneOf(['eager', 'lazy']),
  src: PropTypes.string,
  title: PropTypes.string,
};

TrackArtwork.defaultProps = {
  alt: 'Soundscape artwork',
  src: '',
  title: '',
};

export default TrackArtwork;
