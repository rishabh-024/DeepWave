// HomePage.jsx
// Redesigned composition layer for DeepWave Home
// JavaScript-only, production-ready

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import Shell from '../../app/Shell';
import Hero from './Hero';
import Discover from './Discover';
import TrackGrid from './Tracks/TrackGrid';
import Recommendations from './Recommendations';
import Preferences from './Preferences';

import { getAllTracks } from '../../services/trackService';

/* -------------------- MOTION -------------------- */
const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
};

function HomePage() {
  const { hash } = useLocation();
  const [tracks, setTracks] = useState([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /* -------------------- DATA -------------------- */
  useEffect(() => {
    const controller = new AbortController();

    const loadTracks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getAllTracks({ signal: controller.signal });
        setTracks(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Failed to load tracks:', err);
          setError('Unable to load sound library. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTracks();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!hash) return;

    const targetElement = document.getElementById(hash.replace('#', ''));
    if (targetElement) {
      requestAnimationFrame(() => {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [hash]);

  /* -------------------- FILTER -------------------- */
  const filteredTracks = useMemo(() => {
    if (!query.trim()) return tracks;
    const q = query.toLowerCase();

    return tracks.filter((t) =>
      t.title?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q) ||
      t.artist?.toLowerCase().includes(q)
    );
  }, [tracks, query]);

  /* -------------------- RENDER -------------------- */
  return (
    <Shell>
      {/* HERO */}
      <Hero onSearch={setQuery} onSuggestionClick={setQuery} />

      {/* DISCOVER */}
      <Discover />

      {/* LIBRARY */}
      <motion.section
        id="library"
        className="mt-24 sm:mt-32"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary">
            Sound{' '}
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Library
            </span>
          </h2>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 px-4 py-2 text-sm font-medium surface shadow-sm shadow-slate-200/60 backdrop-blur-sm dark:border-white/10 dark:shadow-none">
            <Music2 className="h-4 w-4 text-violet-500 dark:text-violet-300" />
            <span>{filteredTracks.length} Soundscapes</span>
          </div>
        </div>

        {error ? (
          <div className="py-12 text-center text-red-400">{error}</div>
        ) : (
          <TrackGrid tracks={filteredTracks} isLoading={isLoading} />
        )}
      </motion.section>

      {/* RECOMMENDATIONS */}
      <motion.section
        id="recommendations"
        className="mt-24 sm:mt-32"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Recommendations />
      </motion.section>

      {/* CTA */}
      <motion.section
        id="personalize"
        className="mt-24 sm:mt-36 mb-32"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <Preferences />
      </motion.section>
    </Shell>
  );
}

export default HomePage;
