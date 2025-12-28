'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { MostUsedWord } from '@/types';
import { slideAnimations, slideStyles } from './shared/slide-constants';

interface MostUsedWordSlideProps {
  mostUsedWords: Map<string, MostUsedWord>;
  contributors: Array<{ name: string }>;
}

export function MostUsedWordSlide({ mostUsedWords, contributors }: MostUsedWordSlideProps) {
  // Create array of participants with their most used word
  const participantsWithWords = contributors
    .map(contributor => {
      const mostUsedWord = mostUsedWords.get(contributor.name);
      return {
        name: contributor.name,
        word: mostUsedWord?.word || null,
        count: mostUsedWord?.count || 0,
      };
    })
    .filter(p => p.word !== null); // Only show participants with valid words

  const hasData = participantsWithWords.length > 0;

  return (
    <div className={slideStyles.container}>
      <motion.h2
        {...slideAnimations.fadeInUp}
        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 lg:mb-8 text-center px-4"
      >
        Most Used Word
      </motion.h2>

      {!hasData && (
        <motion.div
          {...slideAnimations.scaleIn}
          className={`${slideStyles.cardCentered} max-w-2xl w-full mx-auto`}
        >
          <p className="text-sm sm:text-base text-white/60">No word data available</p>
        </motion.div>
      )}

      {hasData && (
        <div className="w-full max-w-6xl grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 px-4 mx-auto justify-items-center">
          {participantsWithWords.map((participant, index) => (
            <motion.div
              key={participant.name}
              {...slideAnimations.scaleIn}
              transition={{ delay: index * 0.1 }}
              className={`${slideStyles.cardCentered} flex flex-col items-center justify-center min-h-[90px] sm:min-h-[120px] md:min-h-[140px] lg:min-h-[160px] xl:min-h-[180px] p-2 sm:p-3 md:p-4 w-full`}
            >
              <div className={`text-base sm:text-xl md:text-2xl lg:text-3xl ${slideStyles.gradientText} font-bold mb-1 sm:mb-2 lg:mb-3 break-words text-center px-1`}>
                {participant.word}
              </div>
              <div className="text-xs sm:text-xs md:text-sm lg:text-base text-white/80 font-semibold mb-0.5 sm:mb-1 lg:mb-2 break-words text-center px-1 truncate w-full">
                {participant.name}
              </div>
              <div className="text-xs text-white/60">
                {participant.count.toLocaleString()} {participant.count === 1 ? 'time' : 'times'}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

