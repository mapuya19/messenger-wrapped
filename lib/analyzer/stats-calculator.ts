import type {
  ParsedMessage,
  ChatStats,
  ContributorStats,
} from '@/types';

/**
 * Calculate basic chat statistics
 */
export function calculateChatStats(messages: ParsedMessage[]): ChatStats {
  if (messages.length === 0) {
    return {
      totalMessages: 0,
      totalPhotos: 0,
      totalVideos: 0,
      totalAudioMinutes: 0,
      participants: [],
      dateRange: { start: 0, end: 0 },
    };
  }

  const participants = new Set<string>();
  let totalPhotos = 0;
  let totalVideos = 0;
  let totalAudioMinutes = 0;
  let minTimestamp = Infinity;
  let maxTimestamp = -Infinity;

  for (const msg of messages) {
    participants.add(msg.senderName);
    
    totalPhotos += msg.photos.length;
    totalVideos += msg.videos.length;
    totalAudioMinutes += msg.audioFiles.length; // Approximate: 1 file = 1 minute (actual duration not always available)
    
    if (msg.timestamp < minTimestamp) minTimestamp = msg.timestamp;
    if (msg.timestamp > maxTimestamp) maxTimestamp = msg.timestamp;
  }

  return {
    totalMessages: messages.length,
    totalPhotos,
    totalVideos,
    totalAudioMinutes,
    participants: Array.from(participants).sort(),
    dateRange: {
      start: minTimestamp,
      end: maxTimestamp,
    },
  };
}

/**
 * Calculate contributor statistics
 */
export function calculateContributorStats(messages: ParsedMessage[]): ContributorStats[] {
  const contributorMap = new Map<string, ContributorStats>();

  for (const msg of messages) {
    let stats = contributorMap.get(msg.senderName);
    
    if (!stats) {
      stats = {
        name: msg.senderName,
        messageCount: 0,
        photoCount: 0,
        videoCount: 0,
        audioMinutes: 0,
        totalCharacters: 0,
        uniqueWords: new Set<string>(),
        emojiCount: 0,
        emojis: new Map<string, number>(),
      };
      contributorMap.set(msg.senderName, stats);
    }

    stats.messageCount++;
    stats.photoCount += msg.photos.length;
    stats.videoCount += msg.videos.length;
    stats.audioMinutes += msg.audioFiles.length;

    if (msg.content) {
      stats.totalCharacters += msg.content.length;
      
      // Extract words (simple tokenization)
      const words = msg.content
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 0);
      
      words.forEach(word => stats.uniqueWords.add(word));
    }
  }

  return Array.from(contributorMap.values()).sort(
    (a, b) => b.messageCount - a.messageCount
  );
}


