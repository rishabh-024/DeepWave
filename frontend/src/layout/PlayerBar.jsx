import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListMusic, Repeat, Shuffle, ChevronUp, 
  SkipBack, Play, Pause, SkipForward, 
  Volume2, VolumeX, Heart, Share2, X,
  Maximize2
} from 'lucide-react';
import { useAudioPlayer } from '../context/AudioContext';
import TrackArtwork from '../components/ui/TrackArtwork';

const formatTime = (sec = 0) => {
  const s = Math.floor(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
};

const ControlButton = ({ icon: Icon, active, onClick, label, className = "" }) => (
  <motion.button
    whileHover={{ scale: 1.1, y: -2 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    aria-label={label}
    className={`
      h-10 w-10 grid place-items-center rounded-xl transition-all duration-300
      ${active
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
        : 'bg-zinc-100/50 dark:bg-white/5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-white/10 hover:text-zinc-900 dark:hover:text-white'}
      ${className}
    `}
  >
    <Icon className="h-4.5 w-4.5" />
  </motion.button>
);

function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    playNext,
    playPrev,
    progress,
    duration,
    volume,
    setVolume,
    seek,
    isShuffle,
    repeatMode,
    toggleShuffle,
    cycleRepeatMode
  } = useAudioPlayer();

  const [liked, setLiked] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const progressRef = useRef(null);

  // Auto-reveal player bar when a new track starts
  useEffect(() => {
    if (currentTrack) {
      setIsDismissed(false);
    }
  }, [currentTrack?._id]);

  if (!currentTrack || isDismissed) return null;

  const percent = duration ? (progress / duration) * 100 : 0;

  return (
    <motion.div
      className="fixed bottom-0 inset-x-0 z-[100] px-4 pb-4 pointer-events-none"
      initial={{ y: 150, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 150, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
    >
      <div className="max-w-7xl mx-auto relative group pointer-events-auto">
        
        {/* Progress Container (Floating atop the bar) */}
        <div className="absolute -top-1 left-6 right-6 z-20">
           <div className="relative h-1.5 w-full bg-zinc-200/40 dark:bg-zinc-800/40 backdrop-blur-md rounded-full overflow-hidden group-hover:h-2 transition-all cursor-pointer">
              <motion.div
                className="absolute h-full bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-400 shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                initial={false}
                animate={{ width: `${percent}%` }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              />
              <input
                ref={progressRef}
                type="range"
                min="0"
                max={duration || 0}
                value={progress}
                onChange={(e) => seek(+e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
              />
           </div>
        </div>

        {/* Liquid Glass Chassis */}
        <div className={`
          relative bg-white/70 dark:bg-zinc-950/70 backdrop-blur-3xl 
          border border-white/20 dark:border-white/5 
          rounded-[2.5rem] shadow-2xl shadow-black/10 dark:shadow-black/40 
          px-6 py-4 flex items-center gap-6 overflow-hidden
          transition-all duration-500
          ${isExpanded ? 'h-32' : 'h-24'}
        `}>
          
          {/* Subtle Background Glow */}
          
          {/* Dismiss Button */}
          

          {/* 1. Track Identification */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative group/cover flex-shrink-0">
              <TrackArtwork
                src={currentTrack.cover}
                alt={currentTrack.title}
                title={currentTrack.title}
                className="h-16 w-16 rounded-2xl object-cover shadow-xl ring-1 ring-black/5 transition-transform duration-500 group-hover/cover:scale-105 dark:ring-white/5"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 rounded-2xl transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <Maximize2 className="text-white w-5 h-5" />
              </div>
            </div>

            <div className="min-w-0">
              <motion.h4 
                className="font-black tracking-tighter text-zinc-900 dark:text-white truncate text-base"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {currentTrack.title}
              </motion.h4>
              <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 truncate uppercase tracking-[0.2em] mt-0.5">
                {currentTrack.artist || 'DeepWave'}
              </p>
            </div>

            <motion.button 
              whileTap={{ scale: 0.8 }}
              onClick={() => setLiked(v => !v)}
              className="ml-2 flex-shrink-0"
            >
              <Heart
                className={`h-5 w-5 transition-all duration-500 ${
                  liked ? 'fill-red-500 text-red-500 scale-125' : 'text-zinc-300 dark:text-zinc-600 hover:text-red-400'
                }`}
              />
            </motion.button>
          </div>

          {/* 2. Core Playback Controls */}
          <div className="flex items-center gap-1 sm:gap-2 bg-zinc-200/30 dark:bg-white/5 p-1.5 rounded-[1.8rem] border border-black/5 dark:border-white/5">
            <ControlButton
              icon={Shuffle}
              active={isShuffle}
              onClick={toggleShuffle}
              label="Shuffle"
              className="hidden md:grid"
            />
            <ControlButton
              icon={SkipBack}
              onClick={playPrev}
              label="Previous"
            />

            <motion.button
              onClick={togglePlayPause}
              whileHover={{ scale: 1.05, shadow: "0 15px 30px -5px rgba(79, 70, 229, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="
                h-14 w-14 rounded-2xl
                bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700
                text-white grid place-items-center shadow-lg shadow-indigo-500/20
                relative overflow-hidden group/play
              "
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/play:opacity-100 transition-opacity" />
              <AnimatePresence mode="wait">
                {isPlaying ? (
                  <motion.div key="pause" initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 45 }}>
                    <Pause fill="currentColor" size={24} />
                  </motion.div>
                ) : (
                  <motion.div key="play" initial={{ scale: 0, rotate: 45 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: -45 }}>
                    <Play className="ml-1" fill="currentColor" size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <ControlButton
              icon={SkipForward}
              onClick={playNext}
              label="Next"
            />
            <ControlButton
              icon={Repeat}
              active={repeatMode !== 'off'}
              onClick={cycleRepeatMode}
              label="Repeat"
              className="hidden md:grid"
            />
          </div>

          {/* 3. Utilities & Audio Levels */}
          <div className="flex items-center gap-5 flex-1 justify-end">
            
            <div className="hidden xl:flex flex-col items-end gap-0.5">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500/60 dark:text-indigo-400/60">Playback</span>
              <span className="text-xs font-black tabular-nums text-zinc-900 dark:text-zinc-200">
                {formatTime(progress)} <span className="text-zinc-400 mx-0.5">/</span> {formatTime(duration)}
              </span>
            </div>

            {/* Volume Slide Hub */}
            <div className="hidden lg:flex items-center gap-3 bg-zinc-200/30 dark:bg-white/5 px-4 py-2.5 rounded-2xl border border-black/5 dark:border-white/5 group/vol">
              <button
                onClick={() => setVolume(volume === 0 ? 80 : 0)}
                className="text-zinc-400 dark:text-zinc-500 group-hover/vol:text-indigo-500 transition-colors"
              >
                {volume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(+e.target.value)}
                className="w-20 accent-indigo-500 h-1 cursor-pointer bg-zinc-300 dark:bg-zinc-800 rounded-full appearance-none group-hover/vol:h-1.5 transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <ControlButton icon={ListMusic} label="Queue" className="hidden sm:grid" />
              <ControlButton icon={Share2} label="Share" className="hidden sm:grid" />
              <ControlButton 
                icon={ChevronUp} 
                onClick={() => setIsExpanded(!isExpanded)}
                label="Expand" 
                className={`bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 ${isExpanded ? 'rotate-180' : ''}`} 
              />
            </div>
            <button 
              onClick={() => setIsDismissed(true)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 shadow-sm flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-white dark:hover:bg-zinc-800 transition-all z-40"
              title="Dismiss Player"
            >
              <X size={14} />
          </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default PlayerBar;
