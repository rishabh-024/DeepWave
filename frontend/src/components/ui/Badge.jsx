import React from 'react';
import PropTypes from 'prop-types';

/**
 * Badge Component - Status and category indicators
 */
const Badge = React.forwardRef(({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  
  const baseStyles = 'inline-flex items-center font-semibold rounded-full transition-all duration-200';
  
  const variants = {
    default: 'bg-violet-500/20 text-violet-300 border border-violet-500/50',
    success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50',
    warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/50',
    danger: 'bg-red-500/20 text-red-300 border border-red-500/50',
    info: 'bg-blue-500/20 text-blue-300 border border-blue-500/50',
    outline: 'border-2 border-slate-400 text-slate-300',
    neutral: 'bg-slate-700 text-slate-200',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  const badgeClass = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <span ref={ref} className={badgeClass} {...props}>
      {children}
    </span>
  );
});

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'danger', 'info', 'outline', 'neutral']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

Badge.displayName = 'Badge';

/**
 * Avatar Component - User profile images
 */
const Avatar = React.forwardRef(({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  className = '',
  ...props
}, ref) => {
  
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-2xl',
  };

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const baseStyles = 'rounded-full flex items-center justify-center font-bold overflow-hidden border-2 border-violet-500/50';

  return (
    <div
      ref={ref}
      className={`${baseStyles} ${sizes[size]} ${src ? 'bg-slate-700' : 'bg-gradient-to-br from-violet-500 to-purple-600'} ${className}`}
      title={alt}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      ) : (
        <span className="text-white">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
});

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
};

Avatar.displayName = 'Avatar';

/**
 * Badge Group - Multiple badges together
 */
const BadgeGroup = React.forwardRef(({
  badges = [],
  className = '',
  ...props
}, ref) => (
  <div ref={ref} className={`flex flex-wrap gap-2 ${className}`} {...props}>
    {badges.map((badge, idx) => (
      <Badge
        key={idx}
        variant={badge.variant || 'default'}
        size={badge.size || 'md'}
      >
        {badge.label}
      </Badge>
    ))}
  </div>
));

BadgeGroup.propTypes = {
  badges: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      variant: PropTypes.string,
      size: PropTypes.string,
    })
  ),
  className: PropTypes.string,
};

BadgeGroup.displayName = 'BadgeGroup';

export { Avatar, BadgeGroup };
export default Badge;
