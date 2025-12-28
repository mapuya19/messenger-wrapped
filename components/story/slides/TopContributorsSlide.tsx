'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { slideAnimations, slideStyles } from './shared/slide-constants';

interface TopContributorsSlideProps {
  contributors: Array<{ name: string; messageCount: number }>;
}

export function TopContributorsSlide({ contributors }: TopContributorsSlideProps) {
  const top3 = contributors.slice(0, 3);
  const maxCount = contributors[0]?.messageCount || 1;
  const totalMessages = contributors.reduce((sum, c) => sum + c.messageCount, 0);

  return (
    <div className={slideStyles.container}>
      <motion.h2
        {...slideAnimations.fadeInUp}
        className={slideStyles.heading}
      >
        Top Contributors
      </motion.h2>
      
      {/* Desktop: Horizontal layout (bars left, rankings right) | Mobile: Vertical layout */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center lg:justify-evenly gap-6 lg:gap-16 w-full max-w-7xl px-4 lg:px-8">
        {/* Top 3 Visual Chart - Left side on desktop, horizontal bars on mobile */}
        <div className="flex flex-col lg:flex-row items-end justify-center gap-4 lg:gap-8 w-full lg:w-auto lg:flex-shrink-0">
          {top3.map((contributor, index) => {
            const heightPercent = (contributor.messageCount / maxCount) * 100;
            const widthPercent = (contributor.messageCount / maxCount) * 100;
            const position = index + 1; // 1st place, 2nd place, 3rd place (in order)
            
            return (
              <motion.div
                key={contributor.name}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1, type: 'spring' }}
                className="flex flex-col items-center flex-1 w-full lg:w-auto max-w-[200px] lg:max-w-none mx-auto lg:mx-0"
              >
                {/* Mobile: Horizontal bar chart */}
                <div className="flex lg:hidden flex-col w-full gap-2 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-bold text-white">
                        #{position}
                      </div>
                      <div className="text-sm font-semibold text-white truncate">
                        {contributor.name}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-white">
                      {contributor.messageCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="w-full h-8 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercent}%` }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
                      className="h-full bg-gradient-messenger rounded-full flex items-center justify-end pr-2"
                    >
                      <div className="text-xs font-bold text-white">
                        {((contributor.messageCount / totalMessages) * 100).toFixed(1)}%
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Desktop: Vertical bar chart */}
                <div className="hidden lg:flex flex-col items-center w-full">
                  <div className="text-xl lg:text-3xl font-bold text-white mb-2">
                    #{position}
                  </div>
                  
                  {/* Fixed height container for bars to align at bottom */}
                  <div className="flex flex-col items-center justify-end w-full h-[180px] lg:h-[280px] mb-2 lg:mb-4">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
                      className="w-20 lg:w-32 rounded-t-lg bg-gradient-messenger flex items-end justify-center p-2 lg:p-4 min-h-[50px] lg:min-h-[80px]"
                    >
                      <div className="text-white font-bold text-base lg:text-2xl">
                        {contributor.messageCount.toLocaleString()}
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Fixed height container for name and percentage to prevent layout shift */}
                  <div className="h-[50px] lg:h-[80px] flex flex-col justify-start items-center text-center w-full">
                    <div className="text-sm lg:text-xl font-semibold text-white break-words px-1">
                      {contributor.name}
                    </div>
                    <div className="text-xs lg:text-base text-white/60 mt-1">
                      {((contributor.messageCount / totalMessages) * 100).toFixed(1)}% of messages
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Full Rankings List - Right side on desktop, shows ALL contributors */}
        <motion.div
          {...slideAnimations.fadeInDown}
          transition={{ delay: 0.7 }}
          className="w-full lg:w-auto lg:flex-1 max-w-2xl lg:max-w-md space-y-2 max-h-[60vh] lg:max-h-[70vh] overflow-y-auto pr-2"
        >
          <div className="text-sm lg:text-base text-white/60 mb-2 text-center lg:text-left">Full Rankings</div>
          {contributors.map((contributor, index) => (
            <div
              key={contributor.name}
              className={`flex items-center justify-between gap-4 p-2 lg:p-3 ${slideStyles.card} min-w-0`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="text-base lg:text-lg font-bold text-white/60 w-6 flex-shrink-0">
                  #{index + 1}
                </div>
                <div className="text-sm lg:text-base font-semibold text-white truncate min-w-0">
                  {contributor.name}
                </div>
              </div>
              <div className="text-sm lg:text-base font-semibold text-white flex-shrink-0 whitespace-nowrap">
                {contributor.messageCount.toLocaleString()} messages
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}




