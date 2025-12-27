import type {
  MessengerConversation,
  MessengerMessage,
  ParsedMessage,
} from '@/types';

/**
 * Parse a single Messenger JSON file
 */
export function parseMessengerFile(data: MessengerConversation): ParsedMessage[] {
  const messages: ParsedMessage[] = [];

  for (const msg of data.messages) {
    const parsed: ParsedMessage = {
      senderName: msg.sender_name,
      timestamp: msg.timestamp_ms,
      content: msg.content || undefined,
      reactions: msg.reactions || [],
      photos: msg.photos || [],
      videos: msg.videos || [],
      audioFiles: msg.audio_files || [],
      hasContent: !!msg.content,
      isMediaOnly: !msg.content && (!!msg.photos?.length || !!msg.videos?.length || !!msg.audio_files?.length),
    };

    messages.push(parsed);
  }

  return messages;
}

/**
 * Merge multiple parsed message arrays, sorting by timestamp
 */
export function mergeMessages(messageArrays: ParsedMessage[][]): ParsedMessage[] {
  const allMessages = messageArrays.flat();
  
  // Sort by timestamp (oldest first)
  return allMessages.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Parse JSON text content
 */
export function parseJSONFile(content: string): MessengerConversation {
  try {
    return JSON.parse(content) as MessengerConversation;
  } catch (error) {
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract chat name from folder path or conversation data
 */
export function extractChatName(
  path: string,
  conversation?: MessengerConversation
): string {
  // Try to get title from conversation
  if (conversation?.title) {
    return conversation.title;
  }

  // Extract from path: messages/inbox/GroupName_abc123/
  const match = path.match(/inbox[\/\\]([^\/\\]+)/);
  if (match) {
    // Remove any hash suffix
    return match[1].split('_')[0].replace(/_/g, ' ');
  }

  return 'Unknown Chat';
}

/**
 * Read a file as text (UTF-8)
 */
export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        resolve(e.target.result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsText(file, 'UTF-8');
  });
}


