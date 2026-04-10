import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Input Component - Advanced form input with validation states
 */
const Input = React.forwardRef(({
  label,
  error,
  success,
  icon: Icon,
  variant = 'default',
  size = 'md',
  className = '',
  placeholder = '',
  disabled = false,
  ...props
}, ref) => {
  
  const baseStyles = 'w-full rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-950';
  
  const variants = {
    default: `border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500`,
    outline: `border-violet-500 bg-transparent text-white placeholder:text-slate-500 focus:border-violet-400 focus:ring-violet-400`,
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-5 py-3 text-lg',
  };

  const stateStyles = error 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
    : success 
    ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500' 
    : '';

  const inputClass = `${baseStyles} ${variants[variant]} ${sizes[size]} ${stateStyles} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          className={`${inputClass} ${Icon ? 'pl-10' : ''}`}
          disabled={disabled}
          placeholder={placeholder}
          {...props}
        />
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
          >
            <AlertCircle className="w-5 h-5" />
          </motion.div>
        )}
        {success && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"
          >
            <CheckCircle2 className="w-5 h-5" />
          </motion.div>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400 mt-1.5"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  success: PropTypes.bool,
  icon: PropTypes.elementType,
  variant: PropTypes.oneOf(['default', 'outline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
};

Input.displayName = 'Input';

/**
 * Textarea Component - Extended input for longer text
 */
const Textarea = React.forwardRef(({
  label,
  error,
  className = '',
  disabled = false,
  rows = 4,
  ...props
}, ref) => {
  
  const baseStyles = 'w-full rounded-lg border-2 border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-slate-950 focus:border-violet-500 focus:ring-violet-500';

  const textareaClass = `${baseStyles} ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-white mb-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={textareaClass}
        disabled={disabled}
        rows={rows}
        {...props}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400 mt-1.5"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

Textarea.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  rows: PropTypes.number,
};

Textarea.displayName = 'Textarea';

export { Textarea };
export default Input;
