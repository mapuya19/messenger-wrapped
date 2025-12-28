'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { captureAndDownload } from '@/lib/utils/image-capture';

interface DownloadButtonProps {
  elementRef: React.RefObject<HTMLElement>;
  filename: string;
  className?: string;
  variant?: 'icon' | 'text';
  socialMediaOptimized?: boolean; // Default: true for slides, false for dashboard
  socialMediaFormat?: 'square' | 'story'; // Instagram Story (9:16) or Square (1:1), default: 'story'
  scrollToTop?: boolean; // Scroll to top before capture (for dashboard)
  onDownloadStateChange?: (isDownloading: boolean) => void; // Callback to notify parent
}

export function DownloadButton({ 
  elementRef, 
  filename, 
  className = '',
  variant = 'icon',
  socialMediaOptimized = true,
  socialMediaFormat = 'story', // Default to Instagram Story format
  scrollToTop = false,
  onDownloadStateChange
}: DownloadButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState<string>('');

  // Notify parent when download state changes
  useEffect(() => {
    onDownloadStateChange?.(isCapturing);
  }, [isCapturing, onDownloadStateChange]);

  const handleDownload = async () => {
    // Wait for ref to be available (in case slide just changed)
    let attempts = 0;
    while (!elementRef.current && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 50));
      attempts++;
    }
    
    if (!elementRef.current) {
      console.error('Element ref not available after waiting');
      alert('Please wait for the slide to finish loading before downloading.');
      return;
    }

    // Wait for element to be connected to DOM
    if (!elementRef.current.isConnected) {
      alert('Please wait for the slide to finish loading before downloading.');
      return;
    }

    // Wait for any framer-motion animations to complete
    // Check if element is inside a motion component
    const motionParent = elementRef.current.closest('[data-framer-name]');
    if (motionParent) {
      // Wait for animation to complete (framer-motion transitions are typically 300-500ms)
      // Also wait for any counter animations (up to 2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Double-check element is still connected
      if (!elementRef.current || !elementRef.current.isConnected) {
        alert('Please wait for the slide to finish loading before downloading.');
        return;
      }
    } else {
      // Still wait a bit for any other animations
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      setIsCapturing(true);
      setStatus('Loading content...');
      
      // Final check before capture
      if (!elementRef.current || !elementRef.current.isConnected) {
        throw new Error('Element is not available. Please wait for the slide to finish loading.');
      }
      
      await captureAndDownload(elementRef.current, filename, {
        backgroundColor: '#1a1a2e', // messenger-dark
        scale: 3, // Higher scale for better quality
        socialMediaOptimized,
        socialMediaFormat, // Instagram Story (9:16) or Square (1:1)
        scrollToTop,
      });
      
      setStatus('Saved!');
      setTimeout(() => setStatus(''), 1000);
    } catch (error) {
      console.error('Failed to capture image:', error);
      setStatus('Error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to save image. Please try again.';
      alert(errorMessage);
      setTimeout(() => setStatus(''), 2000);
    } finally {
      setIsCapturing(false);
    }
  };

  if (variant === 'text') {
    return (
      <button
        onClick={handleDownload}
        disabled={isCapturing}
        className={`px-4 py-2 bg-messenger-blue hover:bg-messenger-blue/80 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isCapturing ? (status || 'Preparing image...') : '📥 Save Image'}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={isCapturing}
        className={`p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm ${className}`}
        aria-label="Download image"
        title={isCapturing ? (status || 'Preparing image...') : 'Save as image'}
      >
        {isCapturing ? (
          <span className="text-white text-xl animate-pulse">⏳</span>
        ) : (
          <span className="text-white text-xl">📥</span>
        )}
      </button>

      {/* Download Modal */}
      <AnimatePresence>
        {isCapturing && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-messenger-dark rounded-2xl border border-white/10 shadow-2xl p-8 max-w-sm w-full pointer-events-auto text-center"
              >
                {/* Spinner Animation */}
                <div className="mb-6 flex justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                    className="w-16 h-16 border-4 border-messenger-blue/30 border-t-messenger-blue rounded-full"
                  />
                </div>

                {/* Status Text */}
                <h3 className="text-xl font-bold text-white mb-2">
                  {status || 'Preparing your image...'}
                </h3>
                <p className="text-white/60 text-sm">
                  Please wait while we capture and save your slide
                </p>
                <p className="text-white/40 text-xs mt-4">
                  Don't navigate away during download
                </p>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
