'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SlideTransition } from './SlideTransition';
import { IntroSlide } from './slides/IntroSlide';
import { TotalMessagesSlide } from './slides/TotalMessagesSlide';
import { MediaStatsSlide } from './slides/MediaStatsSlide';
import { TopContributorsSlide } from './slides/TopContributorsSlide';
import { LinguisticSlide } from './slides/LinguisticSlide';
import { MostUsedWordSlide } from './slides/MostUsedWordSlide';
import { TopReactedMediaSlide } from './slides/TopReactedMediaSlide';
import { ChatTimelineSlide } from './slides/ChatTimelineSlide';
import { SummarySlide } from './slides/SummarySlide';
import { useChatData } from '@/contexts/ChatDataContext';
import { DownloadButton } from '@/components/ui/DownloadButton';

interface StoryContainerProps {
  onComplete: () => void;
  onExit?: () => void;
}

export function StoryContainer({ onComplete, onExit }: StoryContainerProps) {
  const { state } = useChatData();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isDownloading, setIsDownloading] = useState(false);
  // Touch swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const slideContentRef = useRef<HTMLDivElement>(null);
  const currentSlideRef = useRef<HTMLDivElement>(null);

  const wrappedData = state.wrappedData;
  const SLIDE_COUNT = 11; // Total number of slides

  const slideNames = [
    '01-intro',
    '02-total-messages',
    '03-media-stats',
    '04-top-contributors',
    '05-linguistic',
    '06-most-used-word',
    '07-most-reacted-photo',
    '08-most-reacted-video',
    '09-most-reacted-message',
    '10-chat-timeline',
    '11-summary',
  ];
  
  useEffect(() => {
    if (!wrappedData) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent navigation during download
      if (isDownloading) {
        e.preventDefault();
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentSlide((prev) => {
          if (prev < SLIDE_COUNT - 1) {
            setDirection('forward');
            return prev + 1;
          }
          return prev;
        });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlide((prev) => {
          if (prev > 0) {
            setDirection('backward');
            return prev - 1;
          }
          return prev;
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [wrappedData, isDownloading]);

  if (!wrappedData) return null;

  const slides = [
    { component: <IntroSlide chatName={wrappedData.chatName} groupPhotoUri={wrappedData.groupPhotoUri} /> },
    { component: <TotalMessagesSlide count={wrappedData.stats.totalMessages} chatName={wrappedData.chatName} totalParticipants={wrappedData.stats.participants.length} dateRange={wrappedData.stats.dateRange} /> },
    { component: <MediaStatsSlide photos={wrappedData.stats.totalPhotos} videos={wrappedData.stats.totalVideos} audioMinutes={wrappedData.stats.totalAudioMinutes} chatName={wrappedData.chatName} /> },
    { component: <TopContributorsSlide contributors={wrappedData.contributors.map(c => ({ name: c.name, messageCount: c.messageCount }))} /> },
    { component: <LinguisticSlide linguisticStats={wrappedData.linguisticStats} contributors={wrappedData.contributors} /> },
    { component: <MostUsedWordSlide mostUsedWords={wrappedData.mostUsedWords} contributors={wrappedData.contributors} /> },
    { component: <TopReactedMediaSlide title="Most Reacted Photo" item={wrappedData.topReactedImages[0] || null} type="photo" /> },
    { component: <TopReactedMediaSlide title="Most Reacted Video" item={wrappedData.topReactedVideos[0] || null} type="video" /> },
    { component: <TopReactedMediaSlide title="Most Reacted Message" item={wrappedData.topReactedText[0] || null} type="text" /> },
    { component: <ChatTimelineSlide chatHistory={wrappedData.chatHistory} /> },
    { component: <SummarySlide wrappedData={wrappedData} onViewDashboard={onComplete} groupPhotoUri={wrappedData.groupPhotoUri} /> },
  ];

  const nextSlide = () => {
    if (isDownloading) return; // Prevent navigation during download
    if (currentSlide < slides.length - 1) {
      setDirection('forward');
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (isDownloading) return; // Prevent navigation during download
    if (currentSlide > 0) {
      setDirection('backward');
      setCurrentSlide(currentSlide - 1);
    }
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (isDownloading) return; // Prevent navigation during download
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  const getFilename = () => {
    const chatName = wrappedData?.chatName || 'messenger-wrapped';
    const sanitizedChatName = chatName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    return `${sanitizedChatName}-${slideNames[currentSlide]}.png`;
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div ref={slideContentRef} className="absolute inset-0">
        <AnimatePresence mode="wait" initial={false}>
          <SlideTransition key={currentSlide} direction={direction}>
            <div 
              ref={currentSlideRef}
              className="w-full min-h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto"
            >
              {slides[currentSlide].component}
            </div>
          </SlideTransition>
        </AnimatePresence>
      </div>

      {/* Exit button */}
      {onExit && (
        <button
          onClick={onExit}
          className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
          aria-label="Exit wrapped"
          title="Exit wrapped"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Download button */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20">
        <DownloadButton
          elementRef={currentSlideRef}
          filename={getFilename()}
          onDownloadStateChange={setIsDownloading}
        />
      </div>

      {/* Navigation */}
      <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 flex justify-center gap-1.5 sm:gap-2 z-10 px-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (isDownloading) return; // Prevent navigation during download
              setDirection(index > currentSlide ? 'forward' : 'backward');
              setCurrentSlide(index);
            }}
            disabled={isDownloading}
            className={`h-1.5 sm:h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'w-6 sm:w-8 bg-messenger-blue'
                : 'w-1.5 sm:w-2 bg-white/30 hover:bg-white/50'
            } ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Previous/Next buttons */}
      {currentSlide > 0 && (
        <button
          onClick={prevSlide}
          disabled={isDownloading}
          className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-lg sm:text-xl lg:text-2xl ${
            isDownloading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Previous slide"
        >
          ←
        </button>
      )}
      {currentSlide < slides.length - 1 && (
        <button
          onClick={nextSlide}
          disabled={isDownloading}
          className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-lg sm:text-xl lg:text-2xl ${
            isDownloading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label="Next slide"
        >
          →
        </button>
      )}
    </div>
  );
}

