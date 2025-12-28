'use client';

import React from 'react';

interface MediaErrorHandlerProps {
  type: 'photo' | 'video';
  onError: (e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement, Event>) => void;
}

/**
 * Reusable error handler for media elements (images and videos)
 * Creates a fallback UI when media fails to load
 */
export function handleMediaError(
  e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement, Event>,
  type: 'photo' | 'video'
): void {
  const target = e.target as HTMLImageElement | HTMLVideoElement;
  target.style.display = 'none';
  const parent = target.parentElement;
  
  if (parent && !parent.querySelector('.fallback')) {
    const fallback = document.createElement('div');
    fallback.className = 'fallback absolute inset-0 flex items-center justify-center flex-col';
    const icon = type === 'photo' ? '📸' : '🎥';
    const label = type === 'photo' ? 'Photo preview unavailable' : 'Video preview unavailable';
    fallback.innerHTML = `<span class="text-4xl reaction-emoji">${icon}</span><p class="text-white/60 text-sm mt-2">${label}</p>`;
    parent.appendChild(fallback);
  }
}

