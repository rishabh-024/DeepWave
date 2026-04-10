import { motion } from 'framer-motion';

function TrackCardSkeleton() {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl surface shadow-[0_18px_40px_rgba(15,23,42,0.05)] backdrop-blur-xl dark:shadow-[0_18px_40px_rgba(2,6,23,0.22)]">
      {/* Shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-300/35 to-transparent dark:via-white/10"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          repeat: Infinity,
          duration: 1.4,
          ease: 'linear'
        }}
      />

      {/* Content placeholders */}
      <div className="absolute inset-x-0 top-0 aspect-[4/5] bg-slate-200/50 dark:bg-slate-950/60" />
      <div className="absolute inset-x-0 bottom-0 border-t border-slate-900/6 bg-white/90 p-4 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/75">
        <div className="space-y-3">
          <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-white/10" />
          <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default TrackCardSkeleton;
