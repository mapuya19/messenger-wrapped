'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatDateRange } from '@/lib/utils/date-utils';
import { slideAnimations, slideStyles } from './shared/slide-constants';

interface TotalMessagesSlideProps {
  count: number;
  chatName: string;
  totalParticipants?: number;
  dateRange?: { start: number; end: number };
}

export function TotalMessagesSlide({ count, chatName, totalParticipants, dateRange }: TotalMessagesSlideProps) {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = count / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= count) {
        setDisplayCount(count);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [count]);

  const formattedDateRange = formatDateRange(dateRange);

  return (
    <div className={slideStyles.container}>
      <motion.div
        {...slideAnimations.scaleInSpring}
        className="space-y-6 w-full max-w-5xl text-center"
      >
        <motion.p
          {...slideAnimations.fadeInDown}
          transition={{ delay: 0.3 }}
          className="text-xl sm:text-2xl lg:text-3xl text-white/80"
        >
          <span className="font-semibold text-white">{chatName}</span> sent a total of
        </motion.p>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          className={`text-6xl lg:text-9xl font-bold ${slideStyles.gradientText}`}
        >
          {displayCount.toLocaleString()}
        </motion.div>
        <motion.p
          {...slideAnimations.fadeInUp}
          transition={{ delay: 0.7 }}
          className="text-xl sm:text-2xl lg:text-3xl text-white/80"
        >
          messages
        </motion.p>
        
        {/* Additional details */}
        <motion.div
          {...slideAnimations.fadeInDown}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap justify-center gap-4 lg:gap-6 mt-8 text-sm lg:text-base text-white/60"
        >
          {totalParticipants && (
            <div>
              <span className="font-semibold text-white/80">{totalParticipants}</span> participants
            </div>
          )}
          {formattedDateRange && (
            <div>
              <span className="font-semibold text-white/80">{formattedDateRange}</span>
            </div>
          )}
          <div>
            Avg: <span className="font-semibold text-white/80">{Math.round(count / (totalParticipants || 1)).toLocaleString()}</span> per person
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}




