import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Grid Layout Component - Responsive grid system
 */
const Grid = React.forwardRef(({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 6,
  className = '',
  ...props
}, ref) => {
  
  const columnsClass = `grid-cols-${columns.xs} sm:grid-cols-${columns.sm || columns.xs} md:grid-cols-${columns.md || columns.sm || columns.xs} lg:grid-cols-${columns.lg || columns.md || columns.sm || columns.xs}`;
  const gapClass = `gap-${gap}`;

  return (
    <div
      ref={ref}
      className={`grid ${columnsClass} ${gapClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Grid.propTypes = {
  children: PropTypes.node.isRequired,
  columns: PropTypes.shape({
    xs: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
  }),
  gap: PropTypes.number,
  className: PropTypes.string,
};

Grid.displayName = 'Grid';

/**
 * Container Component - Max-width wrapper
 */
const Container = React.forwardRef(({
  children,
  size = 'lg',
  className = '',
  ...props
}, ref) => {
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-7xl',
    xl: 'max-w-8xl',
    full: 'w-full',
  };

  return (
    <div
      ref={ref}
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Container.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  className: PropTypes.string,
};

Container.displayName = 'Container';

/**
 * Section Component - Page section with consistent spacing
 */
const Section = React.forwardRef(({
  children,
  title,
  subtitle,
  className = '',
  ...props
}, ref) => {
  
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <motion.section
      ref={ref}
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className={`py-8 md:py-12 lg:py-16 ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-8 md:mb-12">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg text-slate-400">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </motion.section>
  );
});

Section.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string,
};

Section.displayName = 'Section';

/**
 * Flex Component - Flex layout helper
 */
const Flex = React.forwardRef(({
  children,
  direction = 'row',
  justify = 'start',
  align = 'center',
  gap = 4,
  wrap = false,
  className = '',
  ...props
}, ref) => {
  
  const directionClass = direction === 'row' ? 'flex-row' : 'flex-col';
  const justifyClass = `justify-${justify}`;
  const alignClass = `items-${align}`;
  const gapClass = `gap-${gap}`;
  const wrapClass = wrap ? 'flex-wrap' : '';

  return (
    <div
      ref={ref}
      className={`flex ${directionClass} ${justifyClass} ${alignClass} ${gapClass} ${wrapClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Flex.propTypes = {
  children: PropTypes.node.isRequired,
  direction: PropTypes.oneOf(['row', 'col']),
  justify: PropTypes.string,
  align: PropTypes.string,
  gap: PropTypes.number,
  wrap: PropTypes.bool,
  className: PropTypes.string,
};

Flex.displayName = 'Flex';

/**
 * Stack Component - Vertical stack with consistent spacing
 */
const Stack = React.forwardRef(({
  children,
  spacing = 4,
  className = '',
  ...props
}, ref) => {
  
  return (
    <div
      ref={ref}
      className={`flex flex-col gap-${spacing} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Stack.propTypes = {
  children: PropTypes.node.isRequired,
  spacing: PropTypes.number,
  className: PropTypes.string,
};

Stack.displayName = 'Stack';

export { Grid, Container, Section, Flex, Stack };
