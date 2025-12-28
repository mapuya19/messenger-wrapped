'use client';

import React, { useState, useEffect, useRef } from 'react';

interface CarouselProps {
  children: React.ReactNode[];
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  showArrows?: boolean;
  showIndicators?: boolean;
  className?: string;
}

export function Carousel({
  children,
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3 },
  showArrows = true,
  showIndicators = true,
  className = '',
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerSlide, setItemsPerSlide] = useState(itemsPerView.desktop);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate items per slide based on screen size
  useEffect(() => {
    const updateItemsPerSlide = () => {
      if (window.innerWidth < 768) {
        setItemsPerSlide(itemsPerView.mobile);
      } else if (window.innerWidth < 1024) {
        setItemsPerSlide(itemsPerView.tablet);
      } else {
        setItemsPerSlide(itemsPerView.desktop);
      }
    };

    updateItemsPerSlide();
    window.addEventListener('resize', updateItemsPerSlide);
    return () => window.removeEventListener('resize', updateItemsPerSlide);
  }, [itemsPerView]);

  const totalSlides = Math.ceil(children.length / itemsPerSlide);
  const maxIndex = Math.max(0, totalSlides - 1);

  const goToSlide = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(clampedIndex);
    
    // Scroll to the slide
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const scrollPosition = clampedIndex * containerWidth;
      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  };

  const nextSlide = () => {
    if (currentIndex < maxIndex) {
      goToSlide(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  };

  // Touch swipe handling
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

  // Update current index based on scroll position
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const containerWidth = scrollContainerRef.current.clientWidth;
      const newIndex = Math.round(scrollLeft / containerWidth);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex <= maxIndex) {
        setCurrentIndex(newIndex);
      }
    }
  };

  if (children.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${showArrows && totalSlides > 1 ? 'mx-12 sm:mx-16 md:mx-20 lg:mx-24' : ''} ${className}`}>
      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div className="flex gap-4">
          {children.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0 snap-start"
              style={{
                width: `calc((100% - ${(itemsPerSlide - 1) * 1}rem) / ${itemsPerSlide})`,
                minWidth: `calc((100% - ${(itemsPerSlide - 1) * 1}rem) / ${itemsPerSlide})`,
              }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && totalSlides > 1 && (
        <>
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`
              absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 sm:-translate-x-8 md:-translate-x-12 lg:-translate-x-16
              bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed
              rounded-full p-2 md:p-3 transition-all z-10
              backdrop-blur-sm border border-white/20
              shadow-lg
            `}
            aria-label="Previous slide"
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className={`
              absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 sm:translate-x-8 md:translate-x-12 lg:translate-x-16
              bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed
              rounded-full p-2 md:p-3 transition-all z-10
              backdrop-blur-sm border border-white/20
              shadow-lg
            `}
            aria-label="Next slide"
          >
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && totalSlides > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                h-2 rounded-full transition-all
                ${index === currentIndex ? 'bg-white w-8' : 'bg-white/30 w-2'}
              `}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

