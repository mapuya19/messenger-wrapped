'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TopContributorsSlideProps {
  contributors: Array<{ name: string; messageCount: number }>;
}

export function TopContributorsSlide({ contributors }: TopContributorsSlideProps) {
  const top3 = contributors.slice(0, 3);
  const maxCount = contributors[0]?.messageCount || 1;

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl md:text-4xl font-bold text-white mb-12 text-center"
      >
        Top Contributors
      </motion.h2>
      <div className="flex items-end justify-center gap-4 md:gap-8 w-full max-w-4xl">
        {top3.map((contributor, index) => {
          const height = (contributor.messageCount / maxCount) * 100;
          const positions = [2, 1, 2]; // 2nd place, 1st place, 3rd place
          const position = positions[index];
          
          return (
            <motion.div
              key={contributor.name}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1, type: 'spring' }}
              className="flex flex-col items-center"
            >
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">
                #{position}
              </div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
                className={`w-20 md:w-32 rounded-t-lg bg-gradient-messenger flex items-end justify-center p-4 min-h-[100px]`}
              >
                <div className="text-white font-bold text-lg md:text-2xl">
                  {contributor.messageCount.toLocaleString()}
                </div>
              </motion.div>
              <div className="mt-4 text-center">
                <div className="text-lg md:text-xl font-semibold text-white">
                  {contributor.name}
                </div>
                <div className="text-sm md:text-base text-white/60">
                  messages
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

