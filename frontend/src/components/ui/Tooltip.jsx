import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Tooltip Component - Hover tooltip with smart positioning
 */
const Tooltip = React.forwardRef(({
  children,
  content,
  position = 'top',
  delay = 200,
  className = '',
  ...props
}, ref) => {
  
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const positionStyles = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 -translate-y-1 border-t-8 border-l-4 border-r-4 border-l-transparent border-r-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 translate-y-1 border-b-8 border-l-4 border-r-4 border-l-transparent border-r-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 translate-x-1 border-l-8 border-t-4 border-b-4 border-t-transparent border-b-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 -translate-x-1 border-r-8 border-t-4 border-b-4 border-t-transparent border-b-transparent',
  };

  return (
    <div
      ref={ref}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`absolute z-50 pointer-events-none ${positionStyles[position]} ${className}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
          >
            <div className="relative px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg shadow-lg whitespace-nowrap text-xs text-slate-200">
              {content}
              <div
                className={`absolute w-0 h-0 border-slate-900 ${arrowStyles[position]}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  content: PropTypes.string.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  delay: PropTypes.number,
  className: PropTypes.string,
};

Tooltip.displayName = 'Tooltip';

/**
 * Slider Component - Range input with track visualization
 */
const Slider = React.forwardRef(({
  value = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label,
  showValue = true,
  className = '',
  ...props
}, ref) => {
  
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={className} {...props}>
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label}
        </label>
      )}
      
      <div className="flex items-center gap-4">
        <div className="flex-grow relative">
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange?.(parseFloat(e.target.value))}
            className="range-slider w-full"
          />
          
          {/* Visual track */}
          <div
            className="absolute top-1/2 h-1.5 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full pointer-events-none -translate-y-1/2"
            style={{
              width: `${percentage}%`,
              left: 0,
            }}
          />
        </div>

        {showValue && (
          <motion.span
            className="text-sm font-semibold text-violet-400 bg-violet-500/10 px-3 py-1.5 rounded-lg border border-violet-500/30 min-w-fit"
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {value}
          </motion.span>
        )}
      </div>
    </div>
  );
});

Slider.propTypes = {
  value: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  onChange: PropTypes.func,
  label: PropTypes.string,
  showValue: PropTypes.bool,
  className: PropTypes.string,
};

Slider.displayName = 'Slider';

/**
 * Toggle Component - On/off switch
 */
const Toggle = React.forwardRef(({
  checked = false,
  onChange,
  label,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  
  return (
    <div className={`flex items-center gap-3 ${className}`} {...props}>
      <motion.button
        ref={ref}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked
            ? 'bg-violet-500'
            : 'bg-slate-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={() => !disabled && onChange?.(!checked)}
        disabled={disabled}
      >
        <motion.div
          className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
          animate={{
            x: checked ? 24 : 0,
          }}
          transition={{ duration: 0.2, type: 'spring', stiffness: 400, damping: 30 }}
        />
      </motion.button>
      
      {label && (
        <label className="text-sm font-medium text-white cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
});

Toggle.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  label: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

Toggle.displayName = 'Toggle';

export { Slider, Toggle };
export default Tooltip;
