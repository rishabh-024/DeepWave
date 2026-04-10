import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Card Component - Base component for content containers
 * Supports multiple variants with proper visual hierarchy
 */
const Card = React.forwardRef(({
  children,
  variant = 'default',
  type = 'surface', // 'surface', 'elevated', 'outlined'
  className = '',
  hoverEffect = true,
  ...props
}, ref) => {
  
  const baseStyles = 'rounded-2xl transition-all duration-300';
  
  const typeStyles = {
    surface: 'bg-slate-800/40 border border-white/5 backdrop-blur-sm',
    elevated: 'bg-gradient-to-br from-slate-700/60 to-slate-800/40 border border-white/10 backdrop-blur-lg shadow-2xl',
    outlined: 'border-2 border-violet-500/30 bg-transparent backdrop-blur-sm',
  };

  const cardClass = `${baseStyles} ${typeStyles[type]} ${className}`;

  return (
    <motion.div
      ref={ref}
      className={cardClass}
      whileHover={hoverEffect ? { y: -4, boxShadow: '0 20px 40px rgba(139, 92, 246, 0.2)' } : {}}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.string,
  type: PropTypes.oneOf(['surface', 'elevated', 'outlined']),
  className: PropTypes.string,
  hoverEffect: PropTypes.bool,
};

Card.displayName = 'Card';

export const CardContent = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <div ref={ref} className={`p-6 ${className}`} {...props}>
    {children}
  </div>
));

CardContent.propTypes = { children: PropTypes.node.isRequired, className: PropTypes.string };
CardContent.displayName = 'CardContent';

export const CardHeader = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <div ref={ref} className={`px-6 pt-6 pb-0 ${className}`} {...props}>
    {children}
  </div>
));

CardHeader.propTypes = { children: PropTypes.node.isRequired, className: PropTypes.string };
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <h3 ref={ref} className={`text-xl font-bold text-white ${className}`} {...props}>
    {children}
  </h3>
));

CardTitle.propTypes = { children: PropTypes.node.isRequired, className: PropTypes.string };
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <p ref={ref} className={`text-sm text-slate-400 mt-1.5 ${className}`} {...props}>
    {children}
  </p>
));

CardDescription.propTypes = { children: PropTypes.node.isRequired, className: PropTypes.string };
CardDescription.displayName = 'CardDescription';

export const CardFooter = React.forwardRef(({ children, className = '', ...props }, ref) => (
  <div ref={ref} className={`px-6 pb-6 pt-0 flex gap-3 justify-end ${className}`} {...props}>
    {children}
  </div>
));

CardFooter.propTypes = { children: PropTypes.node.isRequired, className: PropTypes.string };
CardFooter.displayName = 'CardFooter';

export default Card;
