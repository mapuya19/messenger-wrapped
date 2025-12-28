/**
 * Shared utilities for message processing
 */

/**
 * System message names that should be filtered out
 */
export const SYSTEM_MESSAGE_NAMES = [
  'Group photo',
  'Unknown',
  'Word effects',
  'You',
  'System',
  'Meta AI',
  'Group Invite Link: Off',
] as const;

/**
 * Check if a sender name is a system message (not a real participant)
 */
export function isSystemMessage(senderName: string): boolean {
  return SYSTEM_MESSAGE_NAMES.some(name => 
    senderName.toLowerCase().includes(name.toLowerCase()) ||
    senderName === name
  );
}

/**
 * Emoji regex pattern for extracting emojis from text
 * Matches emoji ranges: Miscellaneous Symbols, Dingbats, Emoticons, Transport, Flags
 */
export const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;

/**
 * Extract emojis from text using regex
 */
export function extractEmojis(text: string): string[] {
  return text.match(EMOJI_REGEX) || [];
}

/**
 * Normalize reaction emojis - convert symbols to proper emojis
 * For example, convert star symbol (★) to star emoji (⭐)
 */
export function normalizeReactionEmoji(emoji: string): string {
  // Map of symbol characters to their emoji equivalents
  const symbolToEmoji: Record<string, string> = {
    '★': '⭐',  // Black star symbol to star emoji
    '☆': '⭐',  // White star symbol to star emoji
  };
  
  return symbolToEmoji[emoji] || emoji;
}

/**
 * Clean text content by removing reaction-related patterns
 */
export function cleanMessageText(text: string, reactionNames: Set<string>): string {
  let cleaned = text;
  
  // Remove each reaction name
  reactionNames.forEach(name => {
    cleaned = cleaned.replace(new RegExp(`\\b${name}\\b`, 'g'), '');
  });
  
  // Remove reaction text patterns and clean up
  // Match "[Name] reacted [emoji] to your/their/a message" with flexible name matching
  cleaned = cleaned
    .replace(/.+\s+reacted\s+[\u{1F300}-\u{1F9FF}\u{2600}-\u{27FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}❤️👍👎😂😮😢😡🔥💯🙏🎉💔🤔🥰😍🤣😭💀🙄😏🥺✨💕🤷‍♂️🤷‍♀️🤷♥️★☆]+\s+to\s+(your|their|a)\s+message/giu, '')
    .replace(/This message was unsent/gi, '')
    .replace(EMOJI_REGEX, '') // Remove standalone emojis (likely reactions)
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned;
}

