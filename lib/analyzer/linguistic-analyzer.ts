import type {
  ContributorStats,
  LinguisticStats,
  ParsedMessage,
} from '@/types';
import { extractEmojis } from '@/lib/utils/message-utils';

// Re-export for backward compatibility
export { extractEmojis };

/**
 * Calculate linguistic statistics for a contributor
 */
export function calculateLinguisticStats(
  contributor: ContributorStats,
  allMessages: ParsedMessage[]
): LinguisticStats {
  // Get all messages from this contributor
  const contributorMessages = allMessages.filter(
    msg => msg.senderName === contributor.name
  );

  // Calculate vocabulary diversity
  const totalWords = Array.from(contributor.uniqueWords).length;
  const vocabularyDiversity = contributor.totalCharacters > 0
    ? totalWords / Math.max(1, Math.sqrt(contributor.totalCharacters / 10))
    : 0;

  // Calculate average message length
  const averageMessageLength = contributor.messageCount > 0
    ? contributor.totalCharacters / contributor.messageCount
    : 0;

  // Analyze emoji usage
  const emojiMap = new Map<string, number>();
  let totalEmojiCount = 0;

  for (const msg of contributorMessages) {
    if (msg.content) {
      const emojis = extractEmojis(msg.content);
      totalEmojiCount += emojis.length;
      
      for (const emoji of emojis) {
        emojiMap.set(emoji, (emojiMap.get(emoji) || 0) + 1);
      }
    }
  }

  // Get top emojis
  const topEmojis = Array.from(emojiMap.entries())
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    vocabularyDiversity,
    averageMessageLength,
    emojiUsage: {
      count: totalEmojiCount,
      uniqueEmojis: emojiMap.size,
      topEmojis,
    },
  };
}

/**
 * Calculate linguistic stats for all contributors
 */
export function calculateAllLinguisticStats(
  contributors: ContributorStats[],
  allMessages: ParsedMessage[]
): Map<string, LinguisticStats> {
  const statsMap = new Map<string, LinguisticStats>();

  for (const contributor of contributors) {
    const stats = calculateLinguisticStats(contributor, allMessages);
    statsMap.set(contributor.name, stats);
  }

  return statsMap;
}




