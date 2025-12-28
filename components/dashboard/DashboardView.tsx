'use client';

import React, { useRef } from 'react';
import { useChatData } from '@/contexts/ChatDataContext';
import { StatCard } from './StatCard';
import { ChatHistoryChart } from './ChatHistoryChart';
import { MediaGallery } from './MediaGallery';
import { Card } from '../ui/Card';
import { DownloadButton } from '../ui/DownloadButton';

export function DashboardView() {
  const { state } = useChatData();
  const wrappedData = state.wrappedData;
  const dashboardRef = useRef<HTMLDivElement>(null);

  if (!wrappedData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white/60">No data available</p>
      </div>
    );
  }

  const getDashboardFilename = () => {
    const chatName = wrappedData.chatName || 'messenger-wrapped';
    const sanitizedChatName = chatName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    return `${sanitizedChatName}-dashboard-summary.png`;
  };

  return (
    <div ref={dashboardRef} className="min-h-screen bg-messenger-dark py-6 sm:py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
            <div className="flex-1 hidden sm:block"></div>
            <div className="flex-1 text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 break-words">
                {wrappedData.chatName} Dashboard
              </h1>
              <p className="text-sm sm:text-base text-white/60">Complete statistics and insights</p>
            </div>
            <div className="flex-1 flex justify-end w-full sm:w-auto">
              <DownloadButton
                elementRef={dashboardRef}
                filename={getDashboardFilename()}
                variant="text"
                socialMediaOptimized={false}
                scrollToTop={true}
              />
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard
            title="Total Messages"
            value={wrappedData.stats.totalMessages}
            icon="💬"
          />
          <StatCard
            title="Photos"
            value={wrappedData.stats.totalPhotos}
            icon="📸"
          />
          <StatCard
            title="Videos"
            value={wrappedData.stats.totalVideos}
            icon="🎥"
          />
          <StatCard
            title="Audio Minutes"
            value={wrappedData.stats.totalAudioMinutes}
            icon="🎤"
          />
        </div>

        {/* Top Contributors */}
        <Card className="mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Top Contributors</h3>
          <div className="space-y-3 sm:space-y-4">
            {wrappedData.contributors.map((contributor, index) => (
              <div
                key={contributor.name}
                className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                  <div className="text-lg sm:text-2xl font-bold text-white/60 w-6 sm:w-8 flex-shrink-0">
                    #{index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-base sm:text-lg font-semibold text-white truncate">
                      {contributor.name}
                    </div>
                    <div className="text-xs sm:text-sm text-white/60">
                      {contributor.messageCount.toLocaleString()} messages
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="text-xs sm:text-sm text-white/60">Photos</div>
                  <div className="text-base sm:text-lg font-semibold text-white">
                    {contributor.photoCount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Chat History Chart */}
        {wrappedData.chatHistory.length > 0 && (
          <div className="mb-8">
            <ChatHistoryChart chatHistory={wrappedData.chatHistory} />
          </div>
        )}

        {/* Linguistic Stats */}
        <Card className="mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Linguistic Analysis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from(wrappedData.linguisticStats.entries()).map(([name, stats]) => (
              <div
                key={name}
                className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10"
              >
                <div className="font-semibold text-white mb-2 sm:mb-3 text-sm sm:text-base break-words">{name}</div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Vocabulary Diversity</span>
                    <span className="text-white">{stats.vocabularyDiversity.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Avg Message Length</span>
                    <span className="text-white">{Math.round(stats.averageMessageLength)} chars</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Emojis Used</span>
                    <span className="text-white">{stats.emojiUsage.count}</span>
                  </div>
                  {stats.emojiUsage.topEmojis.length > 0 && (
                    <div className="mt-2">
                      <div className="text-white/60 text-xs mb-1">Top Emojis</div>
                      <div className="text-lg sm:text-xl reaction-emoji">
                        {stats.emojiUsage.topEmojis.slice(0, 5).map(e => e.emoji).join(' ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Most Reacted Content */}
        <div className="space-y-8">
          {wrappedData.topReactedImages.length > 0 && (
            <MediaGallery
              title="Most Reacted Photos"
              items={wrappedData.topReactedImages}
              type="photo"
            />
          )}
          {wrappedData.topReactedVideos.length > 0 && (
            <MediaGallery
              title="Most Reacted Videos"
              items={wrappedData.topReactedVideos}
              type="video"
            />
          )}
          {wrappedData.topReactedText.length > 0 && (
            <MediaGallery
              title="Most Reacted Messages"
              items={wrappedData.topReactedText}
              type="text"
            />
          )}
        </div>
      </div>
    </div>
  );
}

