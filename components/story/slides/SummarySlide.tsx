'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import type { WrappedData } from '@/types';
import { findLinguisticChampions } from '@/lib/utils/linguistic-utils';
import { slideAnimations, slideStyles } from './shared/slide-constants';

interface SummarySlideProps {
  wrappedData: WrappedData;
  onViewDashboard: () => void;
  groupPhotoUri?: string;
}

export function SummarySlide({ wrappedData, onViewDashboard, groupPhotoUri }: SummarySlideProps) {
  const { stats, contributors, linguisticStats, topReactedImages, topReactedVideos, topReactedText } = wrappedData;
  
  // Get top contributor
  const topContributor = contributors[0];
  
  // Get linguistic champions (all three for summary)
  const { wordsmith, emojiChampion, linguisticChampion } = findLinguisticChampions(linguisticStats, contributors);

  return (
    <div className={`${slideStyles.container} text-center`}>
      <motion.div
        {...slideAnimations.scaleIn}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl lg:max-w-6xl space-y-6 lg:space-y-8"
      >
        {/* Header Section */}
        <motion.div
          {...slideAnimations.fadeInUp}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {groupPhotoUri && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              className="flex justify-center"
            >
              <img
                src={groupPhotoUri}
                alt="Group photo"
                className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-messenger-blue/60 shadow-2xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </motion.div>
          )}
          <motion.h2
            {...slideAnimations.fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight"
          >
            That&apos;s Your
            <br />
            <span className={slideStyles.gradientText}>Wrapped!</span>
          </motion.h2>
        </motion.div>
        
        {/* Main Stats Grid - 2x2 on mobile, 4x1 on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className={`${slideStyles.card} p-6 sm:p-8`}
          >
            <div className={`text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold ${slideStyles.gradientText} mb-2`}>
              {stats.totalMessages.toLocaleString()}
            </div>
            <div className="text-sm sm:text-base text-white/70 font-medium">Messages</div>
          </motion.div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`${slideStyles.card} p-6 sm:p-8`}
          >
            <div className={`text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold ${slideStyles.gradientText} mb-2`}>
              {stats.totalPhotos.toLocaleString()}
            </div>
            <div className="text-sm sm:text-base text-white/70 font-medium">Photos</div>
          </motion.div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.45 }}
            className={`${slideStyles.card} p-6 sm:p-8`}
          >
            <div className={`text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold ${slideStyles.gradientText} mb-2`}>
              {stats.totalVideos.toLocaleString()}
            </div>
            <div className="text-sm sm:text-base text-white/70 font-medium">Videos</div>
          </motion.div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`${slideStyles.card} p-6 sm:p-8`}
          >
            <div className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-bold text-white mb-2 truncate">
              {topContributor?.name || 'N/A'}
            </div>
            <div className="text-sm sm:text-base text-white/70 font-medium">Top Contributor</div>
          </motion.div>
        </motion.div>
        
        {/* Champions and Reactions - Side by side on desktop */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:justify-center">
          {/* Champions Section */}
          {(wordsmith.name || emojiChampion.name || linguisticChampion.name) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="flex-1 lg:max-w-md space-y-3"
            >
              <div className="text-lg sm:text-xl text-white/80 font-semibold mb-3"><span className="reaction-emoji">🏆</span> Champions</div>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {wordsmith.name && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className={`${slideStyles.card} px-5 py-3 sm:px-6 sm:py-4`}
                  >
                    <div className="text-lg sm:text-xl font-bold text-white truncate max-w-[140px] sm:max-w-none">
                      {wordsmith.name}
                    </div>
                    <div className="text-xs sm:text-sm text-white/60 mt-1">Wordsmith</div>
                  </motion.div>
                )}
                
                {emojiChampion.name && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.65 }}
                    className={`${slideStyles.card} px-5 py-3 sm:px-6 sm:py-4`}
                  >
                    <div className="text-lg sm:text-xl font-bold text-white truncate max-w-[140px] sm:max-w-none">
                      {emojiChampion.name}
                    </div>
                    <div className="text-xs sm:text-sm text-white/60 mt-1">Emoji Champ</div>
                  </motion.div>
                )}
                
                {linguisticChampion.name && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className={`${slideStyles.card} px-5 py-3 sm:px-6 sm:py-4`}
                  >
                    <div className="text-lg sm:text-xl font-bold text-white truncate max-w-[140px] sm:max-w-none">
                      {linguisticChampion.name}
                    </div>
                    <div className="text-xs sm:text-sm text-white/60 mt-1">Linguistic Champ</div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
          
          {/* Top Reactions Section */}
          {(topReactedImages.length > 0 || topReactedVideos.length > 0 || topReactedText.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className={`${slideStyles.card} flex-1 lg:max-w-md p-5 sm:p-6 space-y-3`}
            >
              <div className="text-lg sm:text-xl text-white/90 font-semibold mb-2"><span className="reaction-emoji">🔥</span> Top Reactions</div>
              <div className="space-y-2 text-sm sm:text-base text-white/70">
                {topReactedImages.length > 0 && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="text-xl reaction-emoji">📸</span>
                    <span>Photo: <span className="font-semibold text-white">{topReactedImages[0].reactionCount}</span> reactions</span>
                  </motion.div>
                )}
                {topReactedVideos.length > 0 && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.85 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="text-xl reaction-emoji">🎥</span>
                    <span>Video: <span className="font-semibold text-white">{topReactedVideos[0].reactionCount}</span> reactions</span>
                  </motion.div>
                )}
                {topReactedText.length > 0 && (
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <span className="text-xl reaction-emoji">💬</span>
                    <span>Message: <span className="font-semibold text-white">{topReactedText[0].reactionCount}</span> reactions</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </div>
        
        {/* CTA Button */}
        <motion.div
          {...slideAnimations.fadeInDown}
          transition={{ delay: 0.95 }}
          className="pt-2"
        >
          <Button onClick={onViewDashboard} size="lg" className="text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4">
            View Full Dashboard
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}




