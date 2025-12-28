'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileUploader } from './FileUploader';

export function UploadSelector() {
  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-4"
      >
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Upload Your Data</h3>
          <p className="text-white/60 text-sm mb-4">
            Upload your Messenger data zip file. If your zip contains multiple chats, you&apos;ll be able to select which specific group chat you want to analyze. Your data is processed locally and never uploaded to any server.
          </p>
        </div>

        <FileUploader />
      </motion.div>
    </motion.div>
  );
}

