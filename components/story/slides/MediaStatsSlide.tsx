'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MediaStatsSlideProps {
  photos: number;
  videos: number;
  audioMinutes: number;
}

export function MediaStatsSlide({ photos, videos, audioMinutes }: MediaStatsSlideProps) {
  const stats = [
    { label: 'Photos', value: photos, icon: '📸' },
    { label: 'Videos', value: videos, icon: '🎥' },
    { label: 'Audio Minutes', value: audioMinutes, icon: '🎤' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl md:text-4xl font-bold text-white mb-12 text-center"
      >
        Your Media Stats
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full max-w-4xl">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.1, type: 'spring' }}
            className="bg-white/5 rounded-xl p-6 md:p-8 text-center border border-white/10"
          >
            <div className="text-5xl md:text-6xl mb-4">{stat.icon}</div>
            <div className="text-4xl md:text-5xl font-bold bg-gradient-messenger bg-clip-text text-transparent mb-2">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-lg md:text-xl text-white/80">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


