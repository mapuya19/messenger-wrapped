'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Carousel } from '../ui/Carousel';

interface MediaItem {
  message: {
    photos?: Array<{ uri: string }>;
    videos?: Array<{ uri: string }>;
    content?: string;
  };
  reactionCount: number;
  reactions: Array<{ reaction: string; actor: string }>;
}

interface MediaGalleryProps {
  title: string;
  items: MediaItem[];
  type: 'photo' | 'video' | 'text';
}

export function MediaGallery({ title, items, type }: MediaGalleryProps) {
  if (items.length === 0) {
    return (
      <Card>
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-white/60">No {type}s with reactions found</p>
      </Card>
    );
  }

  // Show all items in carousel (or limit to a reasonable number like 20)
  const displayItems = items.slice(0, 20);

  return (
    <Card>
      <h3 className="text-2xl font-bold text-white mb-6">{title}</h3>
      <Carousel
        itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
        showArrows={true}
        showIndicators={true}
      >
        {displayItems.map((item, index) => (
          <div
            key={index}
            className="bg-white/5 rounded-lg p-4 border border-white/10 h-full"
          >
            {type === 'photo' && (
              <div className="aspect-video bg-white/10 rounded-lg flex items-center justify-center mb-3">
                <span className="text-3xl">📸</span>
              </div>
            )}
            {type === 'video' && (
              <div className="aspect-video bg-white/10 rounded-lg flex items-center justify-center mb-3">
                <span className="text-3xl">🎥</span>
              </div>
            )}
            {type === 'text' && item.message.content && (
              <div className="bg-white/10 rounded-lg p-3 mb-3 text-white/90 text-sm line-clamp-3 min-h-[4rem]">
                &quot;{item.message.content}&quot;
              </div>
            )}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-lg font-semibold text-white">
                {item.reactionCount} {item.reactionCount === 1 ? 'reaction' : 'reactions'}
              </div>
              <div className="text-xl">
                {item.reactions.slice(0, 5).map(r => r.reaction).join(' ')}
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </Card>
  );
}

