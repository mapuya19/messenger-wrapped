'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LinguisticSlideProps {
  linguisticStats: Map<string, { vocabularyDiversity: number; averageMessageLength: number; emojiUsage: { count: number; topEmojis: Array<{ emoji: string; count: number }> } }>;
  contributors: Array<{ name: string }>;
}

export function LinguisticSlide({ linguisticStats, contributors }: LinguisticSlideProps) {
  // Find wordsmith (highest vocabulary diversity)
  let wordsmith = { name: '', diversity: 0 };
  for (const [name, stats] of linguisticStats.entries()) {
    if (stats.vocabularyDiversity > wordsmith.diversity) {
      wordsmith = { name, diversity: stats.vocabularyDiversity };
    }
  }

  // Find emoji champion
  let emojiChampion = { name: '', count: 0, topEmojis: [] as Array<{ emoji: string; count: number }> };
  for (const [name, stats] of linguisticStats.entries()) {
    if (stats.emojiUsage.count > emojiChampion.count) {
      emojiChampion = {
        name,
        count: stats.emojiUsage.count,
        topEmojis: stats.emojiUsage.topEmojis.slice(0, 5),
      };
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 space-y-12">
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl md:text-4xl font-bold text-white text-center"
      >
        Linguistic Champions
      </motion.h2>

      {wordsmith.name && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 rounded-xl p-6 md:p-8 border border-white/10 text-center max-w-2xl w-full"
        >
          <div className="text-5xl mb-4">📚</div>
          <div className="text-2xl md:text-3xl font-bold text-white mb-2">
            Wordsmith Award
          </div>
          <div className="text-xl md:text-2xl bg-gradient-messenger bg-clip-text text-transparent font-semibold mb-2">
            {wordsmith.name}
          </div>
          <div className="text-white/60">
            Highest vocabulary diversity
          </div>
        </motion.div>
      )}

      {emojiChampion.name && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 rounded-xl p-6 md:p-8 border border-white/10 text-center max-w-2xl w-full"
        >
          <div className="text-5xl mb-4">😎</div>
          <div className="text-2xl md:text-3xl font-bold text-white mb-2">
            Emoji Champion
          </div>
          <div className="text-xl md:text-2xl bg-gradient-messenger bg-clip-text text-transparent font-semibold mb-4">
            {emojiChampion.name}
          </div>
          <div className="text-3xl mb-2">
            {emojiChampion.topEmojis.map(e => e.emoji).join(' ')}
          </div>
          <div className="text-white/60">
            {emojiChampion.count.toLocaleString()} emojis used
          </div>
        </motion.div>
      )}
    </div>
  );
}

