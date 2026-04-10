import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Tabs Component - Tab navigation system
 */
const Tabs = React.forwardRef(({
  tabs = [],
  defaultTab = 0,
  onChange,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    onChange?.(index);
  };

  const variants = {
    default: {
      nav: 'border-b border-slate-600',
      button: 'border-b-2 border-transparent text-slate-400 hover:text-white hover:border-violet-500/50 data-[active=true]:text-white data-[active=true]:border-violet-500',
      buttonClass: 'px-4 py-3 font-medium transition-all duration-200 relative',
    },
    pills: {
      nav: 'gap-2',
      button: 'rounded-lg px-4 py-2 font-medium transition-all bg-slate-700/30 text-slate-300 hover:bg-slate-700/50 data-[active=true]:bg-violet-500 data-[active=true]:text-white',
      buttonClass: '',
    },
  };

  const variantConfig = variants[variant];

  return (
    <div ref={ref} className={className} {...props}>
      <div className={`flex overflow-x-auto ${variantConfig.nav}`}>
        {tabs.map((tab, index) => {
          const isActive = activeTab === index;
          return (
            <motion.button
              key={index}
              onClick={() => handleTabChange(index)}
              data-active={isActive}
              className={variantConfig.button}
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
            >
              <div className="flex items-center gap-2">
                {tab.icon && <tab.icon className="w-4 h-4" />}
                <span>{tab.label}</span>
              </div>
              {variant === 'default' && isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-600"
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="mt-4"
      >
        {tabs[activeTab]?.content}
      </motion.div>
    </div>
  );
});

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
      icon: PropTypes.elementType,
    })
  ),
  defaultTab: PropTypes.number,
  onChange: PropTypes.func,
  variant: PropTypes.oneOf(['default', 'pills']),
  className: PropTypes.string,
};

Tabs.displayName = 'Tabs';

/**
 * Progress Component - Visual progress indicator
 */
const Progress = React.forwardRef(({
  value = 0,
  max = 100,
  animated = true,
  showLabel = true,
  color = 'violet',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    violet: 'from-violet-500 to-purple-600',
    emerald: 'from-emerald-500 to-teal-600',
    blue: 'from-blue-500 to-cyan-600',
    red: 'from-red-500 to-pink-600',
  };

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  return (
    <div ref={ref} className={className} {...props}>
      <div className={`w-full ${sizes[size]} bg-slate-700/50 rounded-full overflow-hidden border border-slate-600/50`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={animated ? { duration: 0.8, ease: 'easeOut' } : { duration: 0 }}
          className={`h-full bg-gradient-to-r ${colors[color]} shadow-lg shadow-${color}-500/50`}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-slate-400">{value}</span>
          <span className="text-sm font-semibold text-white">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
});

Progress.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  animated: PropTypes.bool,
  showLabel: PropTypes.bool,
  color: PropTypes.oneOf(['violet', 'emerald', 'blue', 'red']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

Progress.displayName = 'Progress';

/**
 * Spinner Component - Loading indicator
 */
const Spinner = React.forwardRef(({
  size = 'md',
  color = 'violet',
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  const colorMap = {
    violet: 'border-violet-500/30 border-t-violet-500',
    emerald: 'border-emerald-500/30 border-t-emerald-500',
    blue: 'border-blue-500/30 border-t-blue-500',
  };

  return (
    <motion.div
      ref={ref}
      className={`${sizes[size]} border rounded-full ${colorMap[color]} ${className}`}
      animate={{ rotate: 360 }}
      transition={
        variant === 'pulse'
          ? { duration: 1, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 1, repeat: Infinity, ease: 'linear' }
      }
      {...props}
    />
  );
});

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.oneOf(['violet', 'emerald', 'blue']),
  variant: PropTypes.oneOf(['default', 'pulse']),
  className: PropTypes.string,
};

Spinner.displayName = 'Spinner';

export { Progress, Spinner };
export default Tabs;
