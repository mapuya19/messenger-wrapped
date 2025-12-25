'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SlideTransitionProps {
  children: React.ReactNode;
  direction?: 'forward' | 'backward';
}

export function SlideTransition({ children, direction = 'forward' }: SlideTransitionProps) {
  const variants = {
    enter: {
      x: direction === 'forward' ? 1000 : -1000,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: direction === 'forward' ? -1000 : 1000,
      opacity: 0,
    },
  };

  return (
    <motion.div
      initial="enter"
      animate="center"
      exit="exit"
      variants={variants}
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}

