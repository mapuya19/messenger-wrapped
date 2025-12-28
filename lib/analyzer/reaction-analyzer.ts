import type {
  ParsedMessage,
  ReactionStats,
} from '@/types';

/**
 * Calculate reaction statistics for messages
 */
export function calculateReactionStats(messages: ParsedMessage[]): ReactionStats[] {
  return messages
    .filter(msg => msg.reactions.length > 0)
    .map(msg => ({
      message: msg,
      reactionCount: msg.reactions.length,
      reactions: msg.reactions,
    }))
    .sort((a, b) => b.reactionCount - a.reactionCount);
}

/**
 * Generic function to get top reacted media by type
 */
function getTopReactedByType(
  reactionStats: ReactionStats[],
  filterFn: (stat: ReactionStats) => boolean,
  limit: number = 10
): ReactionStats[] {
  return reactionStats.filter(filterFn).slice(0, limit);
}

/**
 * Get top reacted images
 */
export function getTopReactedImages(
  reactionStats: ReactionStats[],
  limit: number = 10
): ReactionStats[] {
  return getTopReactedByType(
    reactionStats,
    (stat) => stat.message.photos.length > 0,
    limit
  );
}

/**
 * Get top reacted videos
 */
export function getTopReactedVideos(
  reactionStats: ReactionStats[],
  limit: number = 10
): ReactionStats[] {
  return getTopReactedByType(
    reactionStats,
    (stat) => stat.message.videos.length > 0,
    limit
  );
}

/**
 * Get top reacted text messages
 * Only includes messages with actual text content and NO media (photos, videos, audio)
 */
export function getTopReactedText(
  reactionStats: ReactionStats[],
  limit: number = 10
): ReactionStats[] {
  return getTopReactedByType(
    reactionStats,
    (stat) => {
      // Must have actual text content (not just whitespace)
      const hasActualContent = !!(stat.message.content && 
                                   stat.message.content.trim().length > 0);
      
      // Must have NO photos, videos, or audio files (pure text message only)
      const hasNoMedia = stat.message.photos.length === 0 && 
                         stat.message.videos.length === 0 && 
                         stat.message.audioFiles.length === 0;
      
      return hasActualContent && hasNoMedia;
    },
    limit
  );
}
