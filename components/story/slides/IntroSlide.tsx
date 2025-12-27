'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface IntroSlideProps {
  chatName: string;
}

export function IntroSlide({ chatName }: IntroSlideProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold bg-gradient-messenger bg-clip-text text-transparent"
        >
          Your
        </motion.h1>
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-4xl md:text-6xl font-bold text-white"
        >
          {chatName}
        </motion.h2>
        <motion.h3
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-3xl md:text-5xl font-bold bg-gradient-messenger bg-clip-text text-transparent"
        >
          Wrapped
        </motion.h3>
      </motion.div>
    </div>
  );
}


