import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import PropTypes from 'prop-types';

import { getRecommendations } from '../../services/recommandationServices';
import TrackCard from './Tracks/TrackCard';
import TrackCardSkeleton from './Tracks/TrackCardSkeleton';

function Recommendations() {
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getRecommendations();
        if (isMounted) {
          setTracks(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load recommendations:', err);
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchRecommendations();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative">
      {/* Background accent */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 blur-[120px]" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full surface border border-white/10 mb-3">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-xs text-text-secondary">Personalized for you</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Recommended Soundscapes
          </h2>
          <p className="mt-2 text-white/60 max-w-xl">
            Based on your listening patterns, mood insights, and preferences.
          </p>
        </div>

        <motion.button
          whileHover={{ x: 4 }}
          className="hidden sm:inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition"
        >
          Explore more
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-w-[160px]">
              <TrackCardSkeleton />
            </div>
          ))}
        </div>
      ) : tracks.length === 0 || error ? (
        <div className="rounded-2xl p-10 surface border border-white/10 text-center">
          <p className="text-text-secondary">
            We’re still learning your preferences.  
            Explore a few soundscapes to unlock personalized recommendations.
          </p>
        </div>
      ) : (
        <motion.div
          className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {tracks.map((track) => (
            <div key={track._id} className="min-w-[180px]">
              <TrackCard track={track} playlist={tracks} />
            </div>
          ))}
        </motion.div>
      )}
    </section>
  );
}

Recommendations.propTypes = {
  userId: PropTypes.string
};

export default Recommendations;