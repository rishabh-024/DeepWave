import { motion } from 'framer-motion';

function TrackCardSkeleton() {
  return (
    <div className="relative aspect-[4/5] rounded-2xl overflow-hidden surface border border-white/10 backdrop-blur-xl">
      {/* Shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          repeat: Infinity,
          duration: 1.4,
          ease: 'linear'
        }}
      />

      {/* Content placeholders */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
        <div className="h-4 w-3/4 rounded surface" />
        <div className="h-3 w-1/2 rounded surface" />
      </div>
    </div>
  );
}

export default TrackCardSkeleton;