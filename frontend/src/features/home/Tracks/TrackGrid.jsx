import { motion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import PropTypes from 'prop-types';

import TrackCard from './TrackCard';
import TrackCardSkeleton from './TrackCardSkeleton';

const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-full surface flex items-center justify-center mb-6">
        <Music2 className="h-8 w-8 text-violet-400" />
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-2">
        No soundscapes found
      </h3>
      <p className="text-white/60 max-w-sm">
        Try adjusting your search or explore different moods to discover new
        experiences.
      </p>
    </div>
  );
}

function TrackGrid({ tracks, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <TrackCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!tracks || tracks.length === 0) {
    return <EmptyState />;
  }

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
      variants={gridVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      {tracks.map((track) => (
        <motion.div key={track._id} variants={itemVariants}>
          <TrackCard track={track} playlist={tracks} />
        </motion.div>
      ))}
    </motion.div>
  );
}

TrackGrid.propTypes = {
  tracks: PropTypes.array,
  isLoading: PropTypes.bool
};

export default TrackGrid;