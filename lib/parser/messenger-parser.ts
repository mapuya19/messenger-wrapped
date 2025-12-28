import type {
  MessengerConversation,
  MessengerMessage,
  MessengerReaction,
  MessengerPhoto,
  MessengerVideo,
  MessengerAudioFile,
  ParsedMessage,
} from '@/types';
import { isSystemMessage, EMOJI_REGEX, cleanMessageText, normalizeReactionEmoji } from '@/lib/utils/message-utils';
import { extractChatName as extractChatNameFromPath, readFileAsText } from '@/lib/utils/file-utils';

// Re-export for backward compatibility
export { readFileAsText };

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
 * Re-exported from file-utils for backward compatibility
 */
export function extractChatName(
  path: string,
  conversation?: MessengerConversation
): string {
  return extractChatNameFromPath(path, conversation?.title);
}

/**
 * Parse HTML message file from Facebook Messenger export
 * Facebook HTML exports use <section class="_a6-g"> for each message
 */
export function parseHTMLFile(htmlContent: string): MessengerConversation {
  // Create a temporary DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  const messages: MessengerMessage[] = [];
  const participants = new Set<string>();
  let groupPhotoUri: string | undefined;
  
  // Extract actual participants from HTML (from "Participants: ..." line)
  const htmlText = htmlContent;
  const participantsMatch = htmlText.match(/Participants:\s*([^<\n]+)/i);
  if (participantsMatch) {
    let participantsStr = participantsMatch[1].trim();
    // Handle "and" at the end (e.g., "name1, name2, name3 and name4")
    // Replace " and " with ", " to normalize, then split by comma
    participantsStr = participantsStr.replace(/\s+and\s+/gi, ', ');
    const participantsList = participantsStr
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0 && !isSystemMessage(name));
    participantsList.forEach(name => participants.add(name));
  }
  
  // Try to extract group photo from header or first large image
  const headerImg = doc.querySelector('header img, .thread img, h1 + img, .chat-header img');
  if (headerImg) {
    const src = headerImg.getAttribute('src') || headerImg.getAttribute('data-src') || '';
    if (src && !src.includes('emoji') && !src.includes('icon') && !src.startsWith('data:')) {
      groupPhotoUri = src;
    }
  }
  
  // Facebook HTML format: messages are in <section class="_a6-g"> elements
  // Structure:
  // <section class="_a6-g">
  //   <h2>Sender Name</h2>
  //   <div class="_2ph_ _a6-p">Message content</div>
  //   <footer><div class="_a72d">Timestamp</div></footer>
  // </section>
  
  const messageSections = doc.querySelectorAll('section._a6-g');
  
  // If no messages found with that selector, try parsing embedded JSON data
  if (messageSections.length === 0) {
    // Look for script tags with JSON data
    const scriptTags = doc.querySelectorAll('script');
    for (const script of Array.from(scriptTags)) {
      const scriptContent = script.textContent || script.innerHTML;
      // Try to find JSON objects with "messages" property
      const jsonMatches = scriptContent.match(/\{[^{}]*"messages"\s*:\s*\[[\s\S]*?\][^{}]*\}/g);
      if (jsonMatches) {
        for (const jsonStr of jsonMatches) {
          try {
            const jsonData = JSON.parse(jsonStr);
            if (jsonData.messages && Array.isArray(jsonData.messages)) {
              return jsonData as MessengerConversation;
            }
          } catch {
            // Try to extract a larger JSON object
            try {
              const fullMatch = scriptContent.match(/\{[\s\S]*"participants"[\s\S]*"messages"[\s\S]*\}/);
              if (fullMatch) {
                const fullData = JSON.parse(fullMatch[0]);
                if (fullData.messages && Array.isArray(fullData.messages)) {
                  return fullData as MessengerConversation;
                }
              }
            } catch {
              // Continue to next script tag
            }
          }
        }
      }
    }
    
    // Also try parsing the entire body content for JSON
    const bodyText = doc.body.textContent || '';
    const jsonMatch = bodyText.match(/\{[\s\S]*"messages"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const jsonData = JSON.parse(jsonMatch[0]);
        if (jsonData.messages && Array.isArray(jsonData.messages)) {
          return jsonData as MessengerConversation;
        }
      } catch {
        // JSON parsing failed
      }
    }
  }
  
  // Parse each message section
  for (const section of Array.from(messageSections)) {
    try {
      // Extract sender name from <h2> tag
      const senderElement = section.querySelector('h2');
      const senderName = senderElement?.textContent?.trim() || 'Unknown';
      
      // Check if this is a system message
      const isSystemMsg = isSystemMessage(senderName);
      
      // If we have actual participants extracted from HTML, check if sender matches
      // But be lenient - if we can't match, still include the message (it might be a name variation)
      if (participants.size > 0) {
        // We have a participants list - check if sender matches (with fuzzy matching for name variations)
        const senderMatches = Array.from(participants).some(participantName => {
          // Exact match
          if (participantName === senderName) return true;
          // Case-insensitive match
          if (participantName.toLowerCase() === senderName.toLowerCase()) return true;
          // Match if one contains the other (handles "Matthew Apuya" vs "MatthewApuya")
          const normalizedParticipant = participantName.replace(/\s+/g, '').toLowerCase();
          const normalizedSender = senderName.replace(/\s+/g, '').toLowerCase();
          if (normalizedParticipant === normalizedSender) return true;
          // Match if names are similar (one is substring of the other, but require at least 3 chars)
          if (normalizedParticipant.length >= 3 && normalizedSender.length >= 3) {
            if (normalizedParticipant.includes(normalizedSender) || normalizedSender.includes(normalizedParticipant)) {
              return true;
            }
          }
          // Match first and last name separately (e.g., "Matthew Apuya" matches "Matthew" or "Apuya")
          const participantParts = participantName.toLowerCase().split(/\s+/).filter(p => p.length > 0);
          const senderParts = senderName.toLowerCase().split(/\s+/).filter(p => p.length > 0);
          if (participantParts.length > 0 && senderParts.length > 0) {
            // Check if any part matches
            const hasMatchingPart = participantParts.some(pp => 
              senderParts.some(sp => pp === sp || pp.includes(sp) || sp.includes(pp))
            );
            if (hasMatchingPart && participantParts.length === senderParts.length) {
              return true;
            }
          }
          return false;
        });
        
        // If it's a known system message, skip it regardless
        if (isSystemMsg) {
          continue;
        }
        
        // If sender doesn't match participants list, still include it (might be name variation)
        // But add the sender to participants set so they're included (unless it's a system message)
        if (!senderMatches && !isSystemMsg) {
          participants.add(senderName);
        }
      } else if (isSystemMsg) {
        // No participants list extracted, but this is a known system message - skip it
        continue;
      }
      
      // Extract timestamp from footer > div._a72d
      const timestampElement = section.querySelector('footer ._a72d');
      const timestampText = timestampElement?.textContent?.trim() || '';
      
      // Parse timestamp: "Apr 22, 2025 12:28:58 pm"
      let timestamp = Date.now(); // Default to current time
      if (timestampText) {
        try {
          // Try to parse the date string
          // Format: "MMM DD, YYYY HH:MM:SS am/pm"
          const dateMatch = timestampText.match(/(\w+)\s+(\d+),\s+(\d+)\s+(\d+):(\d+):(\d+)\s+(am|pm)/i);
          if (dateMatch) {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const month = monthNames.indexOf(dateMatch[1]);
            const day = parseInt(dateMatch[2]);
            const year = parseInt(dateMatch[3]);
            let hours = parseInt(dateMatch[4]);
            const minutes = parseInt(dateMatch[5]);
            const seconds = parseInt(dateMatch[6]);
            const isPM = /pm/i.test(dateMatch[7]);
            
            if (month >= 0) {
              if (isPM && hours !== 12) hours += 12;
              if (!isPM && hours === 12) hours = 0;
              
              const date = new Date(year, month, day, hours, minutes, seconds);
              timestamp = date.getTime();
            }
          } else {
            // Fallback: try standard Date parsing
            const parsed = new Date(timestampText);
            if (!isNaN(parsed.getTime())) {
              timestamp = parsed.getTime();
            }
          }
        } catch {
          // Date parsing failed, use default
        }
      }
      
      // First, extract reactions to know what to exclude from content
      const reactions: MessengerReaction[] = [];
      const reactionList = section.querySelector('ul._a6-q');
      const reactionNames = new Set<string>();
      
      if (reactionList) {
        const reactionSpans = reactionList.querySelectorAll('li span');
        for (const span of Array.from(reactionSpans)) {
          const reactionText = span.textContent?.trim() || '';
          // Extract emoji and actor name: "❤Saundra Tun" or "😆Matthew Apuya" or "❤ Saundra Tun"
          // Try to match emoji followed by name
          const emojiMatches = reactionText.match(EMOJI_REGEX);
          if (emojiMatches && emojiMatches.length > 0) {
            const emoji = emojiMatches[0];
            const emojiIndex = reactionText.indexOf(emoji);
            const actor = reactionText.slice(emojiIndex + emoji.length).trim();
            if (actor) {
              reactions.push({
                reaction: normalizeReactionEmoji(emoji),
                actor: actor
              });
              reactionNames.add(actor);
            } else {
              // Just an emoji, use sender as actor
              reactions.push({
                reaction: normalizeReactionEmoji(emoji),
                actor: senderName
              });
            }
          } else if (reactionText.length <= 3 && EMOJI_REGEX.test(reactionText)) {
            // Just an emoji
            reactions.push({
              reaction: normalizeReactionEmoji(reactionText),
              actor: senderName
            });
          }
        }
      }
      
      // Extract message content - try multiple selectors
      // IMPORTANT: Extract content AFTER reactions so we can exclude reaction-related text
      let content: string | undefined = undefined;
      
      // Try the standard content div first
      const contentDiv = section.querySelector('div._2ph._a6-p, div._a6-p, div[class*="_a6-p"]');
      
      if (contentDiv) {
        // Clone the content div and remove reaction list and its parent div
        const contentClone = contentDiv.cloneNode(true) as Element;
        const reactionListInContent = contentClone.querySelector('ul._a6-q');
        if (reactionListInContent) {
          // Remove the entire parent div that contains the reaction list
          const reactionParentDiv = reactionListInContent.closest('div');
          if (reactionParentDiv && reactionParentDiv.parentElement === contentClone) {
            // Only remove if it's a direct child of contentClone
            reactionParentDiv.remove();
          } else {
            // Fallback: just remove the ul
            reactionListInContent.remove();
          }
        }
        
        // Get all direct text nodes and div text, excluding reaction-related content
        const textParts: string[] = [];
        
        // First, try to get text from direct child divs (these are usually the message content)
        for (const el of Array.from(contentClone.children)) {
          if (el.tagName === 'DIV') {
            // Skip divs that contain reaction lists
            if (el.querySelector('ul._a6-q')) {
              continue;
            }
            
            const text = el.textContent?.trim();
            if (text && text.length > 0) {
              // Check if this text is just reaction names (all words are reaction names)
              const words = text.split(/\s+/).filter(w => w.length > 0);
              const isJustReactions = words.length > 0 && words.every(word => reactionNames.has(word));
              
              // Also check if text is just emojis (likely reactions)
              const isJustEmojis = /^[\s]*$/.test(text.replace(EMOJI_REGEX, ''));
              
              if (!isJustReactions && !isJustEmojis && !text.includes('reacted') && !text.includes('unsent')) {
                textParts.push(text);
              }
            }
          }
        }
        
        // If no content found in structured divs, get all text and clean it
        if (textParts.length === 0) {
          const allText = contentClone.textContent || '';
          const cleaned = cleanMessageText(allText, reactionNames);
          if (cleaned && cleaned.length > 0) {
            content = cleaned;
          }
        } else {
          content = textParts.join(' ').trim();
        }
        
        // Also check for links
        const links = contentClone.querySelectorAll('a[href]');
        if (links.length > 0 && (!content || content.length === 0)) {
          const linkTexts = Array.from(links).map(link => {
            const href = link.getAttribute('href');
            const text = link.textContent?.trim();
            return href || text;
          }).filter(Boolean) as string[];
          if (linkTexts.length > 0) {
            content = linkTexts.join(' ');
          }
        }
      }
      
      // Fallback: try to get text directly from the section (excluding header, footer, and reactions)
      if (!content || content.length === 0) {
        const sectionClone = section.cloneNode(true) as Element;
        // Remove header (h2) and footer
        const header = sectionClone.querySelector('h2, h3');
        const footer = sectionClone.querySelector('footer');
        const reactionListClone = sectionClone.querySelector('ul._a6-q');
        if (header) header.remove();
        if (footer) footer.remove();
        if (reactionListClone) reactionListClone.remove();
        
        const sectionText = sectionClone.textContent?.trim();
        if (sectionText && sectionText.length > 0) {
          const cleaned = cleanMessageText(sectionText, reactionNames);
          if (cleaned && cleaned.length > 0) {
            content = cleaned;
          }
        }
      }
      
      // Extract photos from img tags
      const photos: MessengerPhoto[] = [];
      const imgElements = section.querySelectorAll('img');
      for (const img of Array.from(imgElements)) {
        const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
        if (src && !src.includes('emoji') && !src.includes('icon') && !src.startsWith('data:')) {
          photos.push({
            uri: src,
            creation_timestamp: timestamp
          });
        }
      }
      
      // Extract videos (if any)
      const videos: MessengerVideo[] = [];
      const videoElements = section.querySelectorAll('video');
      for (const video of Array.from(videoElements)) {
        const src = video.getAttribute('src') || video.getAttribute('data-src') || '';
        if (src) {
          videos.push({
            uri: src,
            creation_timestamp: timestamp
          });
        }
      }
      
      // Extract audio files - look for audio links or references
      const audioFiles: MessengerAudioFile[] = [];
      // Check for audio links (e.g., <a href="audio/filename.m4a">)
      const audioLinks = section.querySelectorAll('a[href*="audio"], a[href*=".m4a"], a[href*=".mp3"]');
      for (const link of Array.from(audioLinks)) {
        const href = link.getAttribute('href') || '';
        if (href.match(/\.(m4a|mp3|ogg|wav|aac)$/i)) {
          audioFiles.push({
            uri: href,
            creation_timestamp: timestamp
          });
        }
      }
      
      // Also check for audio elements
      const audioElements = section.querySelectorAll('audio');
      for (const audio of Array.from(audioElements)) {
        const src = audio.getAttribute('src') || audio.getAttribute('data-src') || '';
        if (src && src.match(/\.(m4a|mp3|ogg|wav|aac)$/i)) {
          audioFiles.push({
            uri: src,
            creation_timestamp: timestamp
          });
        }
      }
      
      // Check if content mentions audio (e.g., "Audio message" or contains audio file reference)
      if (!audioFiles.length && content) {
        const audioPattern = /audio[\/\\]([^\s"']+\.(m4a|mp3|ogg|wav|aac))/i;
        const match = content.match(audioPattern);
        if (match) {
          audioFiles.push({
            uri: match[1],
            creation_timestamp: timestamp
          });
        }
      }
      
      // Skip system messages (unsent, album creation, etc.)
      if (content && (
        content.includes('This message was unsent') ||
        content.includes('You created') ||
        content.includes('You deleted') ||
        content.includes('reacted') && !content.match(/^[^\w]*reacted/)
      )) {
        // Skip the message (don't add system messages to participants)
        continue;
      }
      
      // Only add message if it has content, media, or reactions
      if (content || photos.length > 0 || videos.length > 0 || audioFiles.length > 0 || reactions.length > 0) {
        // Only add to participants if not a system message
        if (!isSystemMsg) {
          participants.add(senderName);
        }
        
        const message: MessengerMessage = {
          sender_name: senderName,
          timestamp_ms: timestamp,
          content: content || undefined,
          reactions: reactions.length > 0 ? reactions : undefined,
          photos: photos.length > 0 ? photos : undefined,
          videos: videos.length > 0 ? videos : undefined,
          audio_files: audioFiles.length > 0 ? audioFiles : undefined,
        };
        
        messages.push(message);
      }
    } catch (error) {
      console.warn('Error parsing message from HTML:', error);
      continue;
    }
  }
  
  // If we found messages, return them
  if (messages.length > 0) {
    // Convert participants Set to array format, ensuring all names are valid strings
    // and excluding system messages like "Meta AI" and "Group Invite Link: Off"
    const participantsArray = Array.from(participants)
      .filter(name => name && typeof name === 'string' && name.trim().length > 0 && !isSystemMessage(name))
      .map(name => ({ name: name.trim() }));
    
    const conversation: MessengerConversation = {
      participants: participantsArray,
      messages: messages.reverse(), // Reverse to get chronological order (oldest first)
      title: undefined,
    };
    
    // Store group photo in a custom property (we'll extract it later)
    if (groupPhotoUri) {
      (conversation as MessengerConversation & { groupPhotoUri?: string }).groupPhotoUri = groupPhotoUri;
    }
    
    return conversation;
  }
  
  // If no messages found, throw an error
  throw new Error('No messages found in HTML file. The file may not be a valid Facebook Messenger export.');
}




