'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { slideAnimations, slideStyles } from './shared/slide-constants';

interface MediaStatsSlideProps {
  photos: number;
  videos: number;
  audioMinutes: number;
  chatName: string;
}

export function MediaStatsSlide({ photos, videos, audioMinutes, chatName }: MediaStatsSlideProps) {
  const stats = [
    { label: 'Photos', value: photos, icon: '📸' },
    { label: 'Videos', value: videos, icon: '🎥' },
    { label: 'Audio Minutes', value: audioMinutes, icon: '🎤' },
  ];

  return (
    <div className={slideStyles.container}>
      <motion.h2
        {...slideAnimations.fadeInUp}
        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 lg:mb-8 xl:mb-12 text-center px-4"
      >
        <span className={slideStyles.gradientText}>{chatName}</span> Media Stats
      </motion.h2>
      <div className="flex flex-col sm:flex-row lg:flex-row items-stretch justify-center gap-3 sm:gap-4 lg:gap-6 xl:gap-8 w-full max-w-6xl px-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.1, type: 'spring' }}
            className={`${slideStyles.cardCentered} flex-1 w-full lg:max-w-none`}
          >
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 sm:mb-3 lg:mb-4 reaction-emoji">{stat.icon}</div>
            <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold ${slideStyles.gradientText} mb-2`}>
              {stat.value.toLocaleString()}
            </div>
            <div className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}




