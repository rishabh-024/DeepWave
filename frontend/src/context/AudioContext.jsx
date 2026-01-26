import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback
} from 'react';

const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  /* -------------------- STATE -------------------- */
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);

  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // off | all | one

  const audioRef = useRef(null);
  const shuffledOrderRef = useRef([]);

  /* -------------------- AUDIO EVENTS -------------------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgress(audio.currentTime || 0);
    const onLoadedMetadata = () =>
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.min(1, Math.max(0, volume / 100));
    }
  }, [volume]);

  /* -------------------- PLAY / PAUSE -------------------- */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  /* -------------------- HELPERS -------------------- */
  const buildShuffleOrder = useCallback((list, currentId) => {
    const rest = list.filter(t => t._id !== currentId);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    return rest;
  }, []);

  const getNextTrack = useCallback(() => {
    if (!playlist.length) return null;

    if (repeatMode === 'one') return currentTrack;

    if (isShuffle) {
      if (!shuffledOrderRef.current.length) {
        shuffledOrderRef.current = buildShuffleOrder(
          playlist,
          currentTrack?._id
        );
      }
      return shuffledOrderRef.current.shift() || null;
    }

    const index = playlist.findIndex(t => t._id === currentTrack?._id);
    if (index === -1) return playlist[0];

    if (index + 1 < playlist.length) return playlist[index + 1];
    return repeatMode === 'all' ? playlist[0] : null;
  }, [playlist, currentTrack, isShuffle, repeatMode, buildShuffleOrder]);

  const getPrevTrack = useCallback(() => {
    if (!playlist.length) return null;

    const index = playlist.findIndex(t => t._id === currentTrack?._id);
    if (index > 0) return playlist[index - 1];
    return repeatMode === 'all' ? playlist[playlist.length - 1] : null;
  }, [playlist, currentTrack, repeatMode]);

  /* -------------------- CORE CONTROLS -------------------- */
  const playTrack = useCallback((track, contextPlaylist = []) => {
    if (!track?.url) return;

    setPlaylist(contextPlaylist);
    setCurrentTrack(track);
    shuffledOrderRef.current = [];

    const audio = audioRef.current;
    if (!audio) return;

    if (audio.src !== track.url) {
      audio.src = track.url;
      audio.load();
    }

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, []);

  const togglePlayPause = useCallback(() => {
    if (currentTrack) setIsPlaying(p => !p);
  }, [currentTrack]);

  const playNext = useCallback(() => {
    const next = getNextTrack();
    if (next) playTrack(next, playlist);
    else setIsPlaying(false);
  }, [getNextTrack, playTrack, playlist]);

  const playPrev = useCallback(() => {
    const prev = getPrevTrack();
    if (prev) playTrack(prev, playlist);
  }, [getPrevTrack, playTrack, playlist]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio || isNaN(time)) return;
    audio.currentTime = Math.min(time, audio.duration || time);
    setProgress(audio.currentTime);
  }, []);

  /* -------------------- SHUFFLE / REPEAT -------------------- */
  const toggleShuffle = useCallback(() => {
    setIsShuffle(v => {
      shuffledOrderRef.current = [];
      return !v;
    });
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode(m =>
      m === 'off' ? 'all' : m === 'all' ? 'one' : 'off'
    );
  }, []);

  /* -------------------- KEYBOARD SHORTCUTS (GLOBAL) -------------------- */
  useEffect(() => {
    const handleKey = (e) => {
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowRight':
          playNext();
          break;
        case 'ArrowLeft':
          playPrev();
          break;
        case 'KeyS':
          toggleShuffle();
          break;
        case 'KeyR':
          cycleRepeatMode();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [
    togglePlayPause,
    playNext,
    playPrev,
    toggleShuffle,
    cycleRepeatMode
  ]);

  /* -------------------- TRACK END -------------------- */
  const handleEnded = () => {
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }
    playNext();
  };

  /* -------------------- CONTEXT VALUE -------------------- */
  const value = {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    setVolume,
    playlist,

    playTrack,
    togglePlayPause,
    playNext,
    playPrev,
    seek,

    isShuffle,
    repeatMode,
    toggleShuffle,
    cycleRepeatMode
  };

  return (
    <AudioContext.Provider value={value}>
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        preload="metadata"
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />
      {children}
    </AudioContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error('useAudioPlayer must be used within AudioProvider');
  }
  return ctx;
};