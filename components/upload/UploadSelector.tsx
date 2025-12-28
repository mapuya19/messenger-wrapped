'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useDeviceDetection } from '../hooks/useDeviceDetection';
import { FileUploader } from './FileUploader';

export function UploadSelector() {
  const { isMobile, supportsFileSystemAPI, isMounted } = useDeviceDetection();

  // Prevent hydration mismatch by not rendering device-specific content until mounted
  if (!isMounted) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-2">Upload Your Data</h3>
          <p className="text-white/60 text-sm mb-4">
            Upload your Messenger data zip file or select a folder. If your zip contains multiple chats, you&apos;ll be able to select which specific group chat you want to analyze. Your data is processed locally and never uploaded to any server.
          </p>
          <FileUploader />
        </div>
      </div>
    );
  }

  // Show browser compatibility message if on desktop but API not supported
  const showBrowserWarning = !isMobile && !supportsFileSystemAPI && isMounted;

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
            {isMobile 
              ? 'Upload your Messenger data zip file. If your zip contains multiple chats, you\'ll be able to select which specific group chat you want to analyze. Your data is processed locally and never uploaded to any server.'
              : 'Upload your Messenger data zip file or select a folder directly. If your zip contains multiple chats, you\'ll be able to select which specific group chat you want to analyze. Your data is processed locally and never uploaded to any server.'
            }
          </p>
        </div>

        {showBrowserWarning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-4"
          >
            <p className="text-blue-300 text-sm mb-2">
              <strong>💡 Tip:</strong> The folder picker option (for direct folder access) is available in Chrome, Edge, Opera, and Brave browsers.
            </p>
            <p className="text-blue-200 text-xs mt-2">
              You can use the zip upload option below, which works in all browsers.
            </p>
          </motion.div>
        )}

        <FileUploader />
      </motion.div>
    </motion.div>
  );
}

