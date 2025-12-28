import type {
  ContributorStats,
  LinguisticStats,
  ParsedMessage,
} from '@/types';
import { extractEmojis, isSystemMessage } from '@/lib/utils/message-utils';

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

/**
 * Most common English stop words to filter out
 * Based on the most frequently used words in English
 */
const STOP_WORDS = new Set([
  // Articles
  'the', 'a', 'an',
  // Common conjunctions
  'and', 'or', 'but',
  // Common verbs (forms of be, have, do)
  'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
  // Common pronouns
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  // Possessive pronouns
  'my', 'your', 'his', 'her', 'its', 'our', 'their',
  // Common prepositions
  'in', 'on', 'at', 'for', 'from', 'to', 'of', 'with', 'by', 'about', 'into', 'onto',
  // Common question words
  'what', 'which', 'who', 'where', 'when', 'why', 'how',
  // Common determiners/demonstratives
  'this', 'that', 'these', 'those',
  // Common auxiliary/modal verbs
  'will', 'would', 'could', 'should', 'can', 'may', 'might',
  // Other very common words
  'if', 'then', 'than', 'so', 'as', 'not', 'all', 'some', 'any', 'more', 'most', 'very', 'just', 'only', 'also', 'too',
  // Common words in messaging context that aren't meaningful
  'messages', 'message', 'sent', 'received', 'inbox', 'outbox', 'chat', 'group', 'thread', 'conversation', 'like', 'edited', 'reacted'
]);

/**
 * Check if a word is valid (not a URL, system identifier, or purely numeric)
 */
function isValidWord(word: string): boolean {
  // Must be at least 3 characters
  if (word.length < 3) return false;
  
  // Skip stop words
  if (STOP_WORDS.has(word)) return false;
  
  // Skip words that start with http, https, or www (URLs)
  if (word.startsWith('http') || word.startsWith('https') || word.startsWith('www')) {
    return false;
  }
  
  // Skip words containing underscores (system identifiers like "your_facebook_activity")
  if (word.includes('_')) return false;
  
  // Skip words that are purely numeric
  if (/^\d+$/.test(word)) return false;
  
  // Skip words that look like file extensions or technical terms
  const invalidPatterns = [
    /^[a-z]+:\/\//,  // URLs with protocol
    /^[a-z]+\.[a-z]+$/,  // Simple domain-like patterns (but allow normal words with dots removed)
  ];
  
  for (const pattern of invalidPatterns) {
    if (pattern.test(word)) return false;
  }
  
  return true;
}

/**
 * Calculate the most used word for each contributor
 * Filters out stop words, URLs, system identifiers, participant names, and words shorter than 3 characters
 */
export function calculateMostUsedWords(
  contributors: ContributorStats[],
  allMessages: ParsedMessage[],
  allParticipants?: string[]
): Map<string, { word: string; count: number }> {
  const mostUsedWordsMap = new Map<string, { word: string; count: number }>();

  // Create a set of all participant names (normalized to lowercase) to filter out
  const participantNames = new Set<string>();
  
  // Add all contributor names
  for (const contributor of contributors) {
    // Add the full name and individual name parts
    const normalizedName = contributor.name.toLowerCase().trim();
    participantNames.add(normalizedName);
    // Also add individual words from the name
    normalizedName.split(/\s+/).forEach(part => {
      if (part.length >= 3) {
        participantNames.add(part);
      }
    });
  }
  
  // Also add all participants from the conversation (including those who didn't send messages)
  if (allParticipants && allParticipants.length > 0) {
    for (const participant of allParticipants) {
      const normalizedName = participant.toLowerCase().trim();
      participantNames.add(normalizedName);
      // Add individual words from the name
      normalizedName.split(/\s+/).forEach(part => {
        if (part.length >= 3) {
          participantNames.add(part);
        }
      });
    }
  }
  
  // Also collect all unique sender names from messages (to catch any nicknames/variations)
  const allSenderNames = new Set<string>();
  for (const msg of allMessages) {
    if (msg.senderName && !isSystemMessage(msg.senderName)) {
      const normalized = msg.senderName.toLowerCase().trim();
      allSenderNames.add(normalized);
      normalized.split(/\s+/).forEach(part => {
        if (part.length >= 3) {
          allSenderNames.add(part);
        }
      });
    }
  }
  // Add all sender name parts to participant names
  allSenderNames.forEach(name => participantNames.add(name));

  for (const contributor of contributors) {
    // Get all messages from this contributor
    const contributorMessages = allMessages.filter(
      msg => msg.senderName === contributor.name
    );

    // Count word frequencies
    const wordCountMap = new Map<string, number>();

    for (const msg of contributorMessages) {
      // Skip system messages by sender name
      if (isSystemMessage(msg.senderName)) {
        continue;
      }
      
      // Skip messages with photos - we don't want to count words from photo messages
      if (msg.photos && msg.photos.length > 0) {
        continue;
      }
      
      if (msg.content) {
        // Skip system message content patterns
        const contentLower = msg.content.toLowerCase();
        
        // Skip reaction messages - pattern: [any text] reacted [emoji/reaction] to your/their/a message
        // Examples: "#1 Chef 375 State St reacted 🫶 to your message"
        //          "Human Resources reacted ❤ to your message"
        //          "24/7 gooner reacted ❤ to your message"
        //          "You reacted 👍 to their message"
        // Also skip messages that are just "[Name] reacted [emoji]" without the "to" part
        // Use regex to match the pattern more accurately
        const reactionPattern = /reacted\s*[\u{1F300}-\u{1F9FF}\u{2600}-\u{27FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}❤️👍👎😂😮😢😡🔥💯🙏🎉💔🤔🥰😍🤣😭💀🙄😏🥺✨💕🤷‍♂️🤷‍♀️🤷♥️★☆]+/u;
        const isReactionMessage = reactionPattern.test(msg.content);
        
        if (
          contentLower.includes('this message was unsent') ||
          contentLower.includes('you created') ||
          contentLower.includes('you deleted') ||
          contentLower.includes('unsent') ||
          isReactionMessage
        ) {
          continue;
        }
        
        // Remove URLs before tokenization to prevent extracting "https", "http", etc. as words
        const words = msg.content
          .toLowerCase()
          // Remove URLs (http://, https://, www.)
          .replace(/https?:\/\/[^\s]+/gi, ' ')
          .replace(/www\.[^\s]+/gi, ' ')
          // Remove email addresses
          .replace(/[^\s]+@[^\s]+/gi, ' ')
          // Replace non-word characters with spaces (but keep underscores for now to filter them out later)
          .replace(/[^\w\s]/g, ' ')
          .split(/\s+/)
          .filter(w => w.length >= 3); // Filter words shorter than 3 characters

        for (const word of words) {
          // Skip participant names
          if (participantNames.has(word)) {
            continue;
          }
          
          // Skip invalid words (stop words, URLs, system identifiers, etc.)
          if (isValidWord(word)) {
            wordCountMap.set(word, (wordCountMap.get(word) || 0) + 1);
          }
        }
      }
    }

    // Find the most frequent word
    if (wordCountMap.size > 0) {
      let maxCount = 0;
      let mostUsedWord = '';

      for (const [word, count] of wordCountMap.entries()) {
        if (count > maxCount) {
          maxCount = count;
          mostUsedWord = word;
        }
      }

      if (mostUsedWord) {
        mostUsedWordsMap.set(contributor.name, {
          word: mostUsedWord,
          count: maxCount,
        });
      }
    }
  }

  return mostUsedWordsMap;
}




