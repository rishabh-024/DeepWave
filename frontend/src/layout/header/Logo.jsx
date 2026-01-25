import { motion } from 'framer-motion';

/**
 * Professional Logo Component
 * - Liquid wave animation
 * - Scales with navbar
 * - Theme-aware text
 */
const Logo = ({ size = 36, showText = true, isLight }) => {
  return (
    <motion.div
      className="inline-flex items-center gap-3 select-none"
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      aria-label="DeepWave Logo"
    >
      {/* Icon */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl" />

        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="relative"
          fill="none"
        >
          <defs>
            <linearGradient id="dwGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
          </defs>

          {/* Core Shape */}
          <motion.path
            d="M25 80V20C55 10 80 30 80 50C80 70 55 90 25 80Z"
            stroke="url(#dwGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />

          {/* Inner Wave */}
          <motion.path
            d="M40 50 Q 50 40, 60 50 T 80 50"
            stroke="url(#dwGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            animate={{
              d: [
                'M40 50 Q 50 40, 60 50 T 80 50',
                'M40 50 Q 50 60, 60 50 T 80 50',
                'M40 50 Q 50 40, 60 50 T 80 50',
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 3.5,
              ease: 'easeInOut',
            }}
          />
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <span
          className={`font-extrabold tracking-tight transition-colors ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
          style={{ fontSize: size * 0.65 }}
        >
          DEEP<span className="text-indigo-500">WAVE</span>
        </span>
      )}
    </motion.div>
  );
};

export default Logo;