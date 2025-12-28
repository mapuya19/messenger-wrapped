'use client';

import React, { useState } from 'react';
import { captureAndDownload } from '@/lib/utils/image-capture';

interface DownloadButtonProps {
  elementRef: React.RefObject<HTMLElement>;
  filename: string;
  className?: string;
  variant?: 'icon' | 'text';
  socialMediaOptimized?: boolean; // Default: true for slides, false for dashboard
  socialMediaFormat?: 'square' | 'story'; // Instagram Story (9:16) or Square (1:1), default: 'story'
  scrollToTop?: boolean; // Scroll to top before capture (for dashboard)
}

export function DownloadButton({ 
  elementRef, 
  filename, 
  className = '',
  variant = 'icon',
  socialMediaOptimized = true,
  socialMediaFormat = 'story', // Default to Instagram Story format
  scrollToTop = false
}: DownloadButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState<string>('');

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

    try {
      setIsCapturing(true);
      setStatus('Loading content...');
      
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
      alert('Failed to save image. Please try again.');
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
  );
}
