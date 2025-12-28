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
    <div className="flex flex-col items-center px-4 sm:px-6 py-4 sm:py-6 lg:py-8 w-full">
      <motion.h2
        {...slideAnimations.fadeInUp}
        className={slideStyles.heading}
      >
        Top Contributors
      </motion.h2>
      
      {/* Desktop: Horizontal layout (bars left, rankings right) | Mobile: Vertical layout */}
      <div className="flex flex-col lg:flex-row items-start justify-center gap-4 sm:gap-6 lg:gap-8 xl:gap-12 w-full max-w-7xl px-2 sm:px-4 lg:px-8">
        {/* Top 3 Visual Chart - Left side on desktop, horizontal bars on mobile */}
        <div className="flex flex-col sm:flex-row lg:flex-row items-end justify-center gap-3 sm:gap-4 lg:gap-6 w-full lg:w-auto lg:flex-shrink-0">
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
                className="flex flex-col items-center flex-1 w-full sm:max-w-[180px] lg:max-w-none mx-auto lg:mx-0"
              >
                {/* Mobile/Tablet: Horizontal bar chart */}
                <div className="flex lg:hidden flex-col w-full gap-2 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="text-base sm:text-lg font-bold text-white">
                        #{position}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-white truncate">
                        {contributor.name}
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white">
                      {contributor.messageCount.toLocaleString()}
                    </div>
                  </div>
                  <div className="w-full h-7 sm:h-8 bg-white/10 rounded-full overflow-hidden">
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
                  <div className="text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-2">
                    #{position}
                  </div>
                  
                  {/* Fixed height container for bars to align at bottom */}
                  <div className="flex flex-col items-center justify-end w-full h-[180px] lg:h-[200px] xl:h-[220px] mb-2 lg:mb-3">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.8 }}
                      className="w-16 lg:w-24 xl:w-32 rounded-t-lg bg-gradient-messenger flex items-end justify-center p-2 lg:p-3 xl:p-4 min-h-[50px] lg:min-h-[70px] xl:min-h-[80px]"
                    >
                      <div className="text-white font-bold text-sm lg:text-xl xl:text-2xl">
                        {contributor.messageCount.toLocaleString()}
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Fixed height container for name and percentage to prevent layout shift */}
                  <div className="h-[50px] lg:h-[60px] xl:h-[65px] flex flex-col justify-start items-center text-center w-full">
                    <div className="text-sm lg:text-base xl:text-lg font-semibold text-white break-words px-1">
                      {contributor.name}
                    </div>
                    <div className="text-xs lg:text-sm text-white/60 mt-1">
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
          className="w-full lg:w-auto lg:flex-1 max-w-2xl lg:max-w-xs xl:max-w-sm"
        >
          <div className="text-xs sm:text-sm lg:text-sm xl:text-base text-white/60 mb-2 sm:mb-3 lg:mb-3 text-center lg:text-left">Full Rankings</div>
          <div className="space-y-0.5 sm:space-y-0.5 lg:space-y-1">
            {contributors.map((contributor, index) => (
            <div
              key={contributor.name}
              className="flex items-center justify-between gap-2 sm:gap-2 lg:gap-2 px-2 sm:px-2 lg:px-2 py-1 sm:py-1 lg:py-1.5 bg-white/5 rounded-md lg:rounded-lg border border-white/10 min-w-0"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2 min-w-0 flex-1">
                <div className="text-xs sm:text-sm lg:text-sm xl:text-base font-bold text-white/60 w-4 sm:w-5 lg:w-5 xl:w-6 flex-shrink-0">
                  #{index + 1}
                </div>
                <div className="text-xs sm:text-sm lg:text-sm xl:text-base font-semibold text-white truncate min-w-0">
                  {contributor.name}
                </div>
              </div>
              <div className="text-xs sm:text-sm lg:text-sm xl:text-base font-semibold text-white flex-shrink-0 whitespace-nowrap">
                {contributor.messageCount.toLocaleString()}
              </div>
            </div>
          ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}




