import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Music2 } from 'lucide-react';
import PropTypes from 'prop-types';
import { useAudioPlayer } from '../../../context/AudioContext';
import TrackArtwork from '../../../components/ui/TrackArtwork';

function TrackCard({ track, playlist }) {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlayPause
  } = useAudioPlayer();

  const isActive = currentTrack?._id === track?._id;
  const showPause = isActive && isPlaying;

  const handlePlayClick = () => {
    if (isActive) {
      togglePlayPause();
    } else {
      playTrack(track, playlist);
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden rounded-2xl surface shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:shadow-[0_24px_50px_rgba(79,70,229,0.12)] cursor-pointer dark:shadow-[0_18px_40px_rgba(2,6,23,0.28)]"
    >
      {/* Cover */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <TrackArtwork
          src={track.cover}
          alt={track.title || 'Soundscape'}
          title={track.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950/58 via-slate-950/12 to-transparent dark:from-black/70 dark:via-black/30" />

        {/* Play / Pause */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.button
            onClick={handlePlayClick}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-lg grid place-items-center shadow-lg ring-1 ring-white/30"
            aria-label={showPause ? 'Pause track' : 'Play track'}
          >
            <AnimatePresence mode="wait">
              {showPause ? (
                <motion.div
                  key="pause"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                >
                  <Pause className="h-7 w-7 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="play"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                >
                  <Play className="h-7 w-7 text-white ml-1" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Active Indicator */}
        {isActive && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-violet-600/80 text-xs text-white font-medium">
            Playing
          </div>
        )}
      </div>

      {/* Info */}
      <div className="border-t border-slate-900/6 p-4 dark:border-white/10">
        <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
          {track.title || 'Untitled Sound'}
        </h3>

        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-white/60">
          <Music2 className="h-4 w-4 text-violet-500 dark:text-violet-400" />
          <span className="capitalize truncate">
            {track.category || 'Sound'}
          </span>
        </div>
      </div>

      {/* Hover Glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-cyan-600/10" />
      </div>
    </motion.div>
  );
}

TrackCard.propTypes = {
  track: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string,
    cover: PropTypes.string,
    category: PropTypes.string
  }).isRequired,
  playlist: PropTypes.array
};

export default TrackCard;
