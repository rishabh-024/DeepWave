import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Hero Section Component - Landing page hero with animations
 */
const HeroSection = React.forwardRef(({
  title,
  subtitle,
  description,
  primaryButton,
  secondaryButton,
  badge,
  image,
  imagePosition = 'right',
  className = '',
  ...props
}, ref) => {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div
      ref={ref}
      className={`relative min-h-[90vh] flex items-center justify-center overflow-hidden ${className}`}
      {...props}
    >
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full bg-violet-600/10 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full bg-cyan-600/10 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-12 items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left content */}
        <div>
          {badge && (
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/50 mb-6 w-fit"
            >
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-sm font-semibold text-violet-300">{badge}</span>
            </motion.div>
          )}

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.h2
              variants={itemVariants}
              className="text-2xl md:text-3xl text-violet-300 font-semibold mb-4"
            >
              {subtitle}
            </motion.h2>
          )}

          {description && (
            <motion.p
              variants={itemVariants}
              className="text-lg text-slate-400 mb-8 max-w-xl"
            >
              {description}
            </motion.p>
          )}

          {(primaryButton || secondaryButton) && (
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-4"
            >
              {primaryButton && (
                <motion.button
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg font-semibold shadow-lg shadow-violet-500/50 hover:shadow-xl hover:shadow-violet-500/60 transition-all"
                  onClick={primaryButton.onClick}
                >
                  {primaryButton.label}
                </motion.button>
              )}
              {secondaryButton && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3.5 border-2 border-slate-600 text-white rounded-lg font-semibold hover:border-violet-500 hover:text-violet-300 transition-all"
                  onClick={secondaryButton.onClick}
                >
                  {secondaryButton.label}
                </motion.button>
              )}
            </motion.div>
          )}
        </div>

        {/* Right image */}
        {image && (
          <motion.div
            variants={itemVariants}
            className="relative h-96 lg:h-full"
          >
            <motion.div
              animate={{
                y: [0, 20, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-full h-full"
            >
              {image}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
});

HeroSection.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  primaryButton: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  }),
  secondaryButton: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func,
  }),
  badge: PropTypes.string,
  image: PropTypes.node,
  imagePosition: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
};

HeroSection.displayName = 'HeroSection';

/**
 * Feature Grid Component
 */
const FeatureGrid = React.forwardRef(({
  features = [],
  columns = 3,
  className = '',
  ...props
}, ref) => {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const columnClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <motion.div
      ref={ref}
      className={`grid ${columnClass[columns]} gap-6 ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      {...props}
    >
      {features.map((feature, idx) => (
        <motion.div
          key={idx}
          variants={itemVariants}
          className="p-6 rounded-2xl bg-gradient-to-br from-slate-700/30 to-slate-800/30 border border-white/10 hover:border-violet-500/50 transition-all group"
          whileHover={{
            y: -8,
            boxShadow: '0 20px 40px rgba(139, 92, 246, 0.15)',
          }}
        >
          {feature.icon && (
            <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center mb-4 text-violet-400 group-hover:text-violet-300 transition-colors">
              {feature.icon}
            </div>
          )}
          <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
          <p className="text-slate-400 text-sm">{feature.description}</p>
        </motion.div>
      ))}
    </motion.div>
  );
});

FeatureGrid.propTypes = {
  features: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })
  ),
  columns: PropTypes.oneOf([2, 3, 4]),
  className: PropTypes.string,
};

FeatureGrid.displayName = 'FeatureGrid';

/**
 * Testimonial Component
 */
const TestimonialCard = React.forwardRef(({
  quote,
  author,
  role,
  avatar,
  rating = 5,
  className = '',
  ...props
}, ref) => {
  
  return (
    <motion.div
      ref={ref}
      className={`p-6 rounded-2xl bg-gradient-to-br from-slate-700/40 to-slate-800/40 border border-white/10 ${className}`}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <span key={i} className="text-amber-400">★</span>
        ))}
      </div>

      {/* Quote */}
      <p className="text-slate-300 mb-4 italic">"{quote}"</p>

      {/* Author */}
      <div className="flex items-center gap-3">
        {avatar && (
          <img
            src={avatar}
            alt={author}
            className="w-10 h-10 rounded-full object-cover"
          />
        )}
        <div>
          <p className="font-semibold text-white">{author}</p>
          <p className="text-xs text-slate-500">{role}</p>
        </div>
      </div>
    </motion.div>
  );
});

TestimonialCard.propTypes = {
  quote: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  role: PropTypes.string,
  avatar: PropTypes.string,
  rating: PropTypes.number,
  className: PropTypes.string,
};

TestimonialCard.displayName = 'TestimonialCard';

export { HeroSection, FeatureGrid, TestimonialCard };
