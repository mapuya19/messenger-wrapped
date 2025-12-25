'use client';

import React from 'react';
import { Card } from '../ui/Card';

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

  return (
    <Card>
      <h3 className="text-2xl font-bold text-white mb-6">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.slice(0, 9).map((item, index) => (
          <div
            key={index}
            className="bg-white/5 rounded-lg p-4 border border-white/10"
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
              <div className="bg-white/10 rounded-lg p-3 mb-3 text-white/90 text-sm line-clamp-3">
                &quot;{item.message.content}&quot;
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-white">
                {item.reactionCount} {item.reactionCount === 1 ? 'reaction' : 'reactions'}
              </div>
              <div className="text-xl">
                {item.reactions.slice(0, 5).map(r => r.reaction).join(' ')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

