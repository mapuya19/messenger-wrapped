'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Exclude conflicting props from HTML button attributes
type ExcludedProps = 'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragEnd' | 'onDragStart';
type FilteredHTMLProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, ExcludedProps>;

interface ButtonProps extends FilteredHTMLProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-messenger-dark';
  
  const variants = {
    primary: 'bg-gradient-messenger text-white focus:ring-messenger-blue',
    secondary: 'bg-white/10 text-white focus:ring-white/50',
    outline: 'border-2 border-messenger-blue text-messenger-blue focus:ring-messenger-blue',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={!disabled ? { 
        scale: 1.05,
        transition: { duration: 0.2 }
      } : undefined}
      whileTap={!disabled ? { 
        scale: 0.95,
        transition: { duration: 0.1 }
      } : undefined}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}



