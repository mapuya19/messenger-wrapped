'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  delay?: number;
  hover?: boolean;
}

export function Card({ 
  children, 
  className = '', 
  padding = 'md',
  delay = 0,
  hover = true
}: CardProps) {
  const paddings = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={hover ? {
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2 }
      } : undefined}
      className={`bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 ${paddings[padding]} ${className}`}
    >
      {children}
    </motion.div>
  );
}



