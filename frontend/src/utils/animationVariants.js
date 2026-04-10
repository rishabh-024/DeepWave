/**
 * Animation Variants Library
 * Reusable Framer Motion animation definitions for consistent motion throughout the app
 */

/* Container animations - stagger children */
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const fastContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

/* Item animations - fade and slide */
export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export const itemVariantsLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export const itemVariantsRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export const itemVariantsScale = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

/* Page transitions */
export const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
};

/* Modal animations */
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/* Tooltip/Popover animations */
export const popoverVariants = {
  hidden: { opacity: 0, scale: 0.8, y: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: { opacity: 0, scale: 0.8, y: -10, transition: { duration: 0.15 } },
};

/* Notification/Toast animations */
export const toastVariants = {
  hidden: { opacity: 0, x: 400, y: 0 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: { opacity: 0, x: 400, y: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

/* Drawer/Sidebar animations */
export const drawerVariants = (direction = 'left') => {
  const isLeft = direction === 'left';
  return {
    hidden: {
      x: isLeft ? -300 : 300,
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
    },
    exit: {
      x: isLeft ? -300 : 300,
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeIn' },
    },
  };
};

/* Card animations */
export const cardHoverVariants = {
  rest: { y: 0 },
  hover: { y: -8 },
};

export const cardTapVariants = {
  rest: { scale: 1 },
  tap: { scale: 0.95 },
};

/* Button animations */
export const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, y: -2 },
  tap: { scale: 0.95 },
};

/* Loading skeleton */
export const skeletonVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/* Floating animation */
export const floatingVariants = {
  animate: {
    y: [0, -20, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/* Rotation animation */
export const rotationVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/* Glow animation */
export const glowVariants = {
  animate: {
    boxShadow: [
      '0 0 5px rgba(139, 92, 246, 0.5)',
      '0 0 20px rgba(139, 92, 246, 0.8)',
      '0 0 5px rgba(139, 92, 246, 0.5)',
    ],
  },
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

/* Pulse animation */
export const pulseVariants = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/* Gradient animation */
export const gradientVariants = {
  animate: {
    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

/* Shake animation for errors */
export const shakeVariants = {
  shake: {
    x: [-10, 10, -10, 10, -10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
};

/* Bounce animation */
export const bounceVariants = {
  bounce: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

/* Flip animation */
export const flipVariants = {
  hidden: { rotateY: -90, opacity: 0 },
  visible: {
    rotateY: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default {
  containerVariants,
  fastContainerVariants,
  itemVariants,
  itemVariantsLeft,
  itemVariantsRight,
  itemVariantsScale,
  pageVariants,
  modalVariants,
  backdropVariants,
  popoverVariants,
  toastVariants,
  drawerVariants,
  cardHoverVariants,
  cardTapVariants,
  buttonVariants,
  skeletonVariants,
  floatingVariants,
  rotationVariants,
  glowVariants,
  pulseVariants,
  gradientVariants,
  shakeVariants,
  bounceVariants,
  flipVariants,
};
