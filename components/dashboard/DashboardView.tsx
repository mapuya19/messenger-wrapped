'use client';

import React from 'react';
import { useChatData } from '@/contexts/ChatDataContext';
import { StatCard } from './StatCard';
import { ChatHistoryChart } from './ChatHistoryChart';
import { MediaGallery } from './MediaGallery';
import { Card } from '../ui/Card';

interface DashboardViewProps {
  onBack?: () => void;
}

export function DashboardView({ onBack }: DashboardViewProps) {
  const { state } = useChatData();
  const wrappedData = state.wrappedData;

  if (!wrappedData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white/60">No data available</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-messenger-dark py-6 sm:py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 sm:mb-12">
          {/* Mobile: Back button */}
          <div className="flex justify-start items-center mb-4 sm:hidden">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-sm"
                aria-label="Back to wrapped"
                title="Back to wrapped"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
            )}
          </div>

          {/* Desktop: Two column layout */}
          <div className="hidden sm:flex justify-between items-start mb-4 gap-4">
            <div className="flex-shrink-0">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-base"
                  aria-label="Back to wrapped"
                  title="Back to wrapped"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to Wrapped</span>
                </button>
              )}
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 break-words">
                {wrappedData.chatName} Dashboard
              </h1>
              <p className="text-base text-white/60">Complete statistics and insights</p>
            </div>
            <div className="flex-shrink-0 w-[140px]">
              {/* Empty spacer for centering */}
            </div>
          </div>

          {/* Mobile: Title section */}
          <div className="text-center sm:hidden">
            <h1 className="text-2xl font-bold text-white mb-2 break-words">
              {wrappedData.chatName} Dashboard
            </h1>
            <p className="text-sm text-white/60">Complete statistics and insights</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {wrappedData.contributors.map((contributor, index) => (
              <div
                key={contributor.name}
                className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10"
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="text-base sm:text-lg font-bold text-white/60 flex-shrink-0">
                    #{index + 1}
                  </div>
                  <div className="font-semibold text-white text-sm sm:text-base break-words min-w-0 flex-1">
                    {contributor.name}
                  </div>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Messages</span>
                    <span className="text-white">{contributor.messageCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Photos</span>
                    <span className="text-white">{contributor.photoCount.toLocaleString()}</span>
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

        {/* Most Frequent Words */}
        {wrappedData.mostUsedWords && wrappedData.mostUsedWords.size > 0 && (
          <Card className="mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Most Frequent Words</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from(wrappedData.mostUsedWords.entries()).map(([name, wordData]) => (
                <div
                  key={name}
                  className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10"
                >
                  <div className="font-semibold text-white mb-2 sm:mb-3 text-sm sm:text-base break-words">{name}</div>
                  <div className="flex flex-col items-center justify-center py-2">
                    <span className="text-2xl sm:text-3xl font-bold text-messenger-gradient bg-gradient-to-r from-messenger-blue to-messenger-purple bg-clip-text text-transparent">
                      &quot;{wordData.word}&quot;
                    </span>
                    <span className="text-white/60 text-xs sm:text-sm mt-1">
                      used {wordData.count.toLocaleString()} times
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Linguistic Stats */}
        <Card className="mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Linguistic Analysis</h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from(wrappedData.linguisticStats.entries()).map(([name, stats]) => (
              <div
                key={name}
                className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10"
              >
                <div className="font-semibold text-white mb-2 sm:mb-3 text-sm sm:text-base break-words">{name}</div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Vocab Diversity</span>
                    <span className="text-white font-medium">{stats.vocabularyDiversity.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Avg Msg. Length</span>
                    <span className="text-white font-medium">{Math.round(stats.averageMessageLength)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Emojis Used</span>
                    <span className="text-white font-medium">{stats.emojiUsage.count}</span>
                  </div>
                  {stats.emojiUsage.topEmojis.length > 0 && (
                    <div className="mt-2">
                      <div className="text-white/60 text-xs mb-1 text-center">Top Emojis</div>
                      <div className="w-full flex justify-center items-center gap-1">
                        {stats.emojiUsage.topEmojis.slice(0, 5).map((e, idx) => (
                          <span key={idx} className="text-lg sm:text-xl reaction-emoji">{e.emoji}</span>
                        ))}
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

