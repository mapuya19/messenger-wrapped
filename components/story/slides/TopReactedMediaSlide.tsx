'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { handleMediaError } from './shared/MediaErrorHandler';
import { slideAnimations, slideStyles } from './shared/slide-constants';
import { normalizeReactionEmoji } from '@/lib/utils/message-utils';
import type { ReactionStats } from '@/types';

interface TopReactedMediaSlideProps {
  title: string;
  item: ReactionStats | null;
  type: 'photo' | 'video' | 'text';
}

export function TopReactedMediaSlide({ title, item, type }: TopReactedMediaSlideProps) {
  if (!item) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white/60 text-xl">No {type} with reactions found</p>
      </div>
    );
  }

  const reactionsDisplay = item.reactions
    .slice(0, 10)
    .map(r => normalizeReactionEmoji(r.reaction))
    .join(' ');

  return (
    <div className={slideStyles.container}>
      <motion.h2
        {...slideAnimations.fadeInUp}
        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 lg:mb-6 xl:mb-8 text-center px-4"
      >
        {title}
      </motion.h2>

      <motion.div
        {...slideAnimations.scaleIn}
        transition={{ delay: 0.2 }}
        className={`${slideStyles.card} w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-4`}
      >
        {type === 'photo' && item.message.photos?.[0] && (
          <div className="mb-4">
            <div className="aspect-video bg-white/10 rounded-lg overflow-hidden flex items-center justify-center relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.message.photos[0].uri}
                alt="Photo"
                className="w-full h-full object-cover"
                onError={(e) => handleMediaError(e, 'photo')}
              />
            </div>
          </div>
        )}

        {type === 'video' && item.message.videos?.[0] && (
          <div className="mb-4">
            <div className="aspect-video bg-white/10 rounded-lg overflow-hidden flex items-center justify-center relative">
              <video
                src={item.message.videos[0].uri}
                className="w-full h-full object-cover"
                controls={false}
                muted
                onError={(e) => handleMediaError(e, 'video')}
              />
            </div>
          </div>
        )}

        {type === 'text' && (
          <div className="mb-3 sm:mb-4">
            <div className="bg-white/10 rounded-lg p-4 sm:p-6 lg:p-8 text-white/90 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl break-words min-h-[100px] sm:min-h-[120px] lg:min-h-[160px] xl:min-h-[180px] flex flex-col items-center justify-center">
              {(() => {
                const content = item.message.content;
                const hasContent = content && typeof content === 'string' && content.trim().length > 0;
                
                if (hasContent) {
                  return (
                    <>
                      <div className="text-xs sm:text-sm md:text-base text-white/70 mb-2 sm:mb-3 lg:mb-4 font-semibold">
                        {item.message.senderName}
                      </div>
                      <div className="text-center leading-relaxed w-full">
                        &quot;{content}&quot;
                      </div>
                    </>
                  );
                }
                
                return (
                  <div className="text-white/60 italic text-center text-sm sm:text-base">
                    (Message content not available)
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        <div className="text-center">
          <div className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold ${slideStyles.gradientText} mb-2`}>
            {item.reactionCount} {item.reactionCount === 1 ? 'reaction' : 'reactions'}
          </div>
          <div className="text-lg sm:text-xl md:text-2xl lg:text-2xl mb-2 reaction-emoji">{reactionsDisplay}</div>
        </div>
      </motion.div>
    </div>
  );
}




