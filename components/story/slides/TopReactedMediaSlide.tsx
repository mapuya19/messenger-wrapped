'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TopReactedMediaSlideProps {
  title: string;
  item: {
    message: {
      photos?: Array<{ uri: string }>;
      videos?: Array<{ uri: string }>;
      content?: string;
    };
    reactionCount: number;
    reactions: Array<{ reaction: string; actor: string }>;
  } | null;
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
    .map(r => r.reaction)
    .join(' ');

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl md:text-4xl font-bold text-white mb-8 text-center"
      >
        {title}
      </motion.h2>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 rounded-xl p-6 md:p-8 border border-white/10 max-w-2xl w-full"
      >
        {type === 'photo' && item.message.photos?.[0] && (
          <div className="mb-4">
            <div className="aspect-video bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-4xl">📸</span>
              <p className="text-white/60 text-sm ml-2">Photo preview unavailable</p>
            </div>
          </div>
        )}

        {type === 'video' && item.message.videos?.[0] && (
          <div className="mb-4">
            <div className="aspect-video bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-4xl">🎥</span>
              <p className="text-white/60 text-sm ml-2">Video preview unavailable</p>
            </div>
          </div>
        )}

        {type === 'text' && item.message.content && (
          <div className="mb-4">
            <div className="bg-white/10 rounded-lg p-4 text-white/90 text-lg md:text-xl">
              &quot;{item.message.content}&quot;
            </div>
          </div>
        )}

        <div className="text-center">
          <div className="text-4xl md:text-5xl font-bold bg-gradient-messenger bg-clip-text text-transparent mb-2">
            {item.reactionCount} {item.reactionCount === 1 ? 'reaction' : 'reactions'}
          </div>
          <div className="text-2xl mb-2">{reactionsDisplay}</div>
        </div>
      </motion.div>
    </div>
  );
}

