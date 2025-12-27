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
 * Get top reacted images
 */
export function getTopReactedImages(
  reactionStats: ReactionStats[],
  limit: number = 10
): ReactionStats[] {
  return reactionStats
    .filter(stat => stat.message.photos.length > 0)
    .slice(0, limit);
}

/**
 * Get top reacted videos
 */
export function getTopReactedVideos(
  reactionStats: ReactionStats[],
  limit: number = 10
): ReactionStats[] {
  return reactionStats
    .filter(stat => stat.message.videos.length > 0)
    .slice(0, limit);
}

/**
 * Get top reacted text messages
 */
export function getTopReactedText(
  reactionStats: ReactionStats[],
  limit: number = 10
): ReactionStats[] {
  return reactionStats
    .filter(stat => stat.message.hasContent && !stat.message.isMediaOnly)
    .slice(0, limit);
}


