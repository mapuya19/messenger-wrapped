'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SlideTransition } from './SlideTransition';
import { IntroSlide } from './slides/IntroSlide';
import { TotalMessagesSlide } from './slides/TotalMessagesSlide';
import { MediaStatsSlide } from './slides/MediaStatsSlide';
import { TopContributorsSlide } from './slides/TopContributorsSlide';
import { LinguisticSlide } from './slides/LinguisticSlide';
import { TopReactedMediaSlide } from './slides/TopReactedMediaSlide';
import { ChatTimelineSlide } from './slides/ChatTimelineSlide';
import { SummarySlide } from './slides/SummarySlide';
import { useChatData } from '@/context/ChatDataContext';
import { DownloadButton } from '@/components/ui/DownloadButton';

interface StoryContainerProps {
  onComplete: () => void;
}

export function StoryContainer({ onComplete }: StoryContainerProps) {
  const { state } = useChatData();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  // Touch swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const slideContentRef = useRef<HTMLDivElement>(null);

  const wrappedData = state.wrappedData;
  const SLIDE_COUNT = 10; // Total number of slides

  const slideNames = [
    '01-intro',
    '02-total-messages',
    '03-media-stats',
    '04-top-contributors',
    '05-linguistic',
    '06-most-reacted-photo',
    '07-most-reacted-video',
    '08-most-reacted-message',
    '09-chat-timeline',
    '10-summary',
  ];
  
  useEffect(() => {
    if (!wrappedData) return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
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
  }, [wrappedData]);

  if (!wrappedData) return null;

  const slides = [
    { component: <IntroSlide chatName={wrappedData.chatName} /> },
    { component: <TotalMessagesSlide count={wrappedData.stats.totalMessages} /> },
    { component: <MediaStatsSlide photos={wrappedData.stats.totalPhotos} videos={wrappedData.stats.totalVideos} audioMinutes={wrappedData.stats.totalAudioMinutes} /> },
    { component: <TopContributorsSlide contributors={wrappedData.contributors.map(c => ({ name: c.name, messageCount: c.messageCount }))} /> },
    { component: <LinguisticSlide linguisticStats={wrappedData.linguisticStats} contributors={wrappedData.contributors} /> },
    { component: <TopReactedMediaSlide title="Most Reacted Photo" item={wrappedData.topReactedImages[0] || null} type="photo" /> },
    { component: <TopReactedMediaSlide title="Most Reacted Video" item={wrappedData.topReactedVideos[0] || null} type="video" /> },
    { component: <TopReactedMediaSlide title="Most Reacted Message" item={wrappedData.topReactedText[0] || null} type="text" /> },
    { component: <ChatTimelineSlide chatHistory={wrappedData.chatHistory} /> },
    { component: <SummarySlide onViewDashboard={onComplete} /> },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setDirection('forward');
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
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
            <div className="w-full h-full flex items-center justify-center">
              {slides[currentSlide].component}
            </div>
          </SlideTransition>
        </AnimatePresence>
      </div>

      {/* Download button */}
      <div className="absolute top-4 right-4 z-20">
        <DownloadButton
          elementRef={slideContentRef}
          filename={getFilename()}
        />
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentSlide ? 'forward' : 'backward');
              setCurrentSlide(index);
            }}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'w-8 bg-messenger-blue'
                : 'w-2 bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Previous/Next buttons */}
      {currentSlide > 0 && (
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Previous slide"
        >
          ←
        </button>
      )}
      {currentSlide < slides.length - 1 && (
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Next slide"
        >
          →
        </button>
      )}
    </div>
  );
}

