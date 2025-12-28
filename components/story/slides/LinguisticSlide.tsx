'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { LinguisticStats } from '@/types';
import { findLinguisticChampions } from '@/lib/utils/linguistic-utils';
import { slideAnimations, slideStyles } from './shared/slide-constants';

interface LinguisticSlideProps {
  linguisticStats: Map<string, LinguisticStats>;
  contributors: Array<{ name: string }>;
}

export function LinguisticSlide({ linguisticStats, contributors }: LinguisticSlideProps) {
  const { wordsmith, emojiChampion, linguisticChampion } = findLinguisticChampions(linguisticStats, contributors);
  const hasAnyChampion = wordsmith.name || emojiChampion.name || linguisticChampion.name;

  return (
    <div className={slideStyles.container}>
      <motion.h2
        {...slideAnimations.fadeInUp}
        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center mb-4 sm:mb-6 lg:mb-8 xl:mb-12 px-4"
      >
        Superlatives
      </motion.h2>

      {!hasAnyChampion && (
        <motion.div
          {...slideAnimations.scaleIn}
          className={`${slideStyles.cardCentered} max-w-2xl w-full`}
        >
          <p className="text-sm sm:text-base text-white/60">No linguistic data available</p>
        </motion.div>
      )}

      {hasAnyChampion && (
        <div className="flex flex-col sm:flex-row lg:flex-row items-stretch justify-center gap-3 sm:gap-4 lg:gap-6 xl:gap-8 w-full max-w-6xl px-4">
          {wordsmith.name && (
            <motion.div
              {...slideAnimations.scaleIn}
              transition={{ delay: 0.2 }}
              className={`${slideStyles.cardCentered} flex-1 w-full lg:max-w-none`}
            >
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl mb-2 sm:mb-3 lg:mb-4 reaction-emoji">📚</div>
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
                Wordsmith Award
              </div>
              <div className={`text-base sm:text-lg md:text-xl lg:text-2xl ${slideStyles.gradientText} font-semibold mb-2 break-words`}>
                {wordsmith.name || 'Unknown'}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-white/60">
                Highest vocabulary diversity (score: {wordsmith.diversity.toFixed(2)})
                <br />
                <span className="text-xs text-white/40">Unique words per unit of text written</span>
              </div>
            </motion.div>
          )}

          {emojiChampion.name && (
            <motion.div
              {...slideAnimations.scaleIn}
              transition={{ delay: 0.4 }}
              className={`${slideStyles.cardCentered} flex-1 w-full lg:max-w-none`}
            >
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl mb-2 sm:mb-3 lg:mb-4 reaction-emoji">😎</div>
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
                Emoji Champion
              </div>
              <div className={`text-base sm:text-lg md:text-xl lg:text-2xl ${slideStyles.gradientText} font-semibold mb-2 sm:mb-3 lg:mb-4 break-words`}>
                {emojiChampion.name}
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-3xl mb-2 reaction-emoji">
                {emojiChampion.topEmojis.map(e => e.emoji).join(' ')}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-white/60">
                {emojiChampion.count.toLocaleString()} emojis used
              </div>
            </motion.div>
          )}

          {linguisticChampion.name && (
            <motion.div
              {...slideAnimations.scaleIn}
              transition={{ delay: 0.6 }}
              className={`${slideStyles.cardCentered} flex-1 w-full lg:max-w-none`}
            >
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl mb-2 sm:mb-3 lg:mb-4 reaction-emoji">🏆</div>
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
                Linguistic Champion
              </div>
              <div className={`text-base sm:text-lg md:text-xl lg:text-2xl ${slideStyles.gradientText} font-semibold mb-2 break-words`}>
                {linguisticChampion.name || 'Unknown'}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-white/60">
                Most eloquent messages ({Math.round(linguisticChampion.avgLength)} avg characters)
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}




