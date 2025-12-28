'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { slideStyles } from './shared/slide-constants';

interface IntroSlideProps {
  chatName: string;
  groupPhotoUri?: string;
}

export function IntroSlide({ chatName, groupPhotoUri }: IntroSlideProps) {
  return (
    <div className={`${slideStyles.container} text-center`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 max-w-5xl w-full"
      >
        {groupPhotoUri && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="mb-4"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={groupPhotoUri}
              alt="Group photo"
              className="w-32 h-32 lg:w-48 lg:h-48 rounded-full object-cover mx-auto border-4 border-messenger-blue/50 shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </motion.div>
        )}
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-4xl lg:text-7xl font-bold ${slideStyles.gradientText}`}
        >
          Your
        </motion.h1>
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-3xl lg:text-6xl font-bold text-white break-words px-4"
        >
          {chatName}
        </motion.h2>
        <motion.h3
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`text-2xl lg:text-5xl font-bold ${slideStyles.gradientText}`}
        >
          Wrapped
        </motion.h3>
      </motion.div>
    </div>
  );
}




