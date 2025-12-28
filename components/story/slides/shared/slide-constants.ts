/**
 * Shared constants and utilities for slide components
 */

export const slideAnimations = {
  fadeInUp: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  },
  fadeInDown: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  },
  scaleIn: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
  },
  scaleInSpring: {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.8, type: 'spring' as const },
  },
};

export const slideStyles = {
  container: 'flex flex-col items-center justify-center h-full px-4',
  containerWithOverflow: 'flex flex-col items-center justify-center h-full px-4 overflow-y-auto py-4',
  heading: 'text-2xl lg:text-4xl font-bold text-white mb-6 lg:mb-8 text-center',
  card: 'bg-white/5 rounded-xl p-4 lg:p-8 border border-white/10',
  cardCentered: 'bg-white/5 rounded-xl p-4 lg:p-8 border border-white/10 text-center',
  gradientText: 'bg-gradient-messenger bg-clip-text text-transparent',
};

