import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * StatCard Component - Enhanced stat display card
 */
const StatCard = React.forwardRef(({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  trendValue,
  backgroundColor = 'from-violet-500/20 to-purple-500/20',
  className = '',
  ...props
}, ref) => {
  
  const trendIndicator = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '';
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : '';

  return (
    <motion.div
      ref={ref}
      className={`relative p-6 rounded-2xl bg-gradient-to-br ${backgroundColor} border border-white/10 overflow-hidden group cursor-pointer ${className}`}
      whileHover={{
        y: -4,
        boxShadow: '0 20px 40px rgba(139, 92, 246, 0.15)',
      }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {/* Animated background element */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="p-3 bg-violet-500/20 rounded-lg text-violet-400"
          >
            {Icon && <Icon className="w-6 h-6" />}
          </div>
          {trend && (
            <span className={`text-sm font-semibold ${trendColor}`}>
              {trendIndicator} {trendValue}
            </span>
          )}
        </div>

        {/* Content */}
        <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white mb-2">{value}</p>
        {subtitle && (
          <p className="text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
});

StatCard.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  trend: PropTypes.oneOf(['up', 'down', null]),
  trendValue: PropTypes.string,
  backgroundColor: PropTypes.string,
  className: PropTypes.string,
};

StatCard.displayName = 'StatCard';

/**
 * BarChart Component - Simple bar chart
 */
const BarChart = React.forwardRef(({
  data = [],
  height = 200,
  animated = true,
  showLabels = true,
  color = 'violet',
  className = '',
  ...props
}, ref) => {
  
  const max = Math.max(...data.map(d => d.value), 100);
  
  const colors = {
    violet: 'from-violet-500 to-purple-600',
    emerald: 'from-emerald-500 to-teal-600',
    blue: 'from-blue-500 to-cyan-600',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const barVariants = {
    hidden: { height: 0 },
    visible: (i) => ({
      height: '100%',
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <div ref={ref} className={className} {...props}>
      <motion.div
        className="flex items-end justify-between gap-2"
        style={{ height }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2">
            <motion.div
              custom={idx}
              variants={barVariants}
              className={`w-full bg-gradient-to-t ${colors[color]} rounded-t-lg shadow-lg opacity-80 hover:opacity-100 transition-opacity`}
              style={{
                maxHeight: `${(item.value / max) * 100}%`,
              }}
            />
            {showLabels && (
              <span className="text-xs text-slate-400 text-center truncate w-full">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
});

BarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ),
  height: PropTypes.number,
  animated: PropTypes.bool,
  showLabels: PropTypes.bool,
  color: PropTypes.oneOf(['violet', 'emerald', 'blue']),
  className: PropTypes.string,
};

BarChart.displayName = 'BarChart';

/**
 * GaugeChart Component - Circular progress indicator
 */
const GaugeChart = React.forwardRef(({
  value = 0,
  max = 100,
  size = 120,
  color = 'violet',
  animated = true,
  showLabel = true,
  className = '',
  ...props
}, ref) => {
  
  const percentage = Math.min(value / max, 1);
  const circumference = 2 * Math.PI * (size / 2 - 8);
  const strokeDashoffset = circumference * (1 - percentage);

  const colors = {
    violet: { circle: 'text-violet-500', text: 'text-violet-400' },
    emerald: { circle: 'text-emerald-500', text: 'text-emerald-400' },
    blue: { circle: 'text-blue-500', text: 'text-blue-400' },
  };

  return (
    <div ref={ref} className={`flex items-center justify-center ${className}`} {...props}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 8}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-slate-700"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 8}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={animated ? strokeDashoffset : circumference * (1 - percentage)}
            className={`${colors[color].circle} transition-all`}
            style={{ strokeLinecap: 'round' }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: animated ? strokeDashoffset : strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>

        {/* Center label */}
        {showLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-lg font-bold ${colors[color].text}`}>
              {Math.round(percentage * 100)}%
            </span>
            <span className="text-xs text-slate-400">of {max}</span>
          </div>
        )}
      </div>
    </div>
  );
});

GaugeChart.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  size: PropTypes.number,
  color: PropTypes.oneOf(['violet', 'emerald', 'blue']),
  animated: PropTypes.bool,
  showLabel: PropTypes.bool,
  className: PropTypes.string,
};

GaugeChart.displayName = 'GaugeChart';

export { BarChart, GaugeChart };
export default StatCard;
