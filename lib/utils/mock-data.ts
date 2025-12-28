import type { MessengerConversation, MessengerMessage } from '@/types';
import { analyzeChatData } from '@/lib/analyzer';
import { parseMessengerFile } from '@/lib/utils/messenger-parser';

/**
 * Generate mock Messenger conversation data for testing
 */
export function generateMockConversation(): MessengerConversation {
  const participants = [
    { name: 'Alice Johnson' },
    { name: 'Bob Smith' },
    { name: 'Charlie Brown' },
    { name: 'Diana Prince' },
  ];

  const messages: MessengerMessage[] = [];
  
  // Generate messages over the past 12 months
  const now = Date.now();
  const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
  
  const sampleTexts = [
    'Hey everyone! How are you doing?',
    'Just finished watching that show we talked about, it was amazing! The plot twists were incredible and I did not see that ending coming at all.',
    'Anyone up for a coffee this weekend? I was thinking we could meet at that new place downtown.',
    'Check out this photo from my trip! The sunset was absolutely breathtaking.',
    'That meme you sent was hilarious 😂 I can\'t stop laughing about it.',
    'Thanks for the birthday wishes everyone! You all made my day so special.',
    'Can someone help me with this project? I\'m stuck on the third part and could use some advice.',
    'Great game last night! The team played really well and we had such a good time.',
    'Happy holidays! 🎄 Hope everyone has a wonderful time with their families.',
    'This is so cool! I can\'t believe how well this turned out.',
    'I totally agree with you on that point. It makes so much sense when you think about it.',
    'Let me know when you\'re free and we can schedule something.',
    'That sounds like a plan! I\'ll make sure to bring everything we need.',
    'See you all soon! Can\'t wait to catch up.',
    'Thanks for organizing this event. It was really thoughtful of you.',
    'I\'m so excited! This is going to be amazing.',
    'This is going to be fun. I\'ve been looking forward to this for weeks.',
    'Count me in! I wouldn\'t miss it for the world.',
    'Can\'t wait! The anticipation is killing me.',
    'That\'s awesome news! Congratulations on the achievement.',
    'What time are we meeting? I want to make sure I\'m not late.',
    'Has anyone seen the latest episode? We need to discuss it ASAP.',
    'I\'ll be there in about 10 minutes. Just finishing up something.',
    'Perfect! That works for me too.',
  ];

  const emojis = ['😀', '😂', '❤️', '🔥', '👍', '👏', '🎉', '💯', '✨', '🌟', '💪', '🎊', '😍', '🤔', '😎'];
  
  // Generate messages for each month
  for (let month = 0; month < 12; month++) {
    const monthStart = oneYearAgo + (month * 30 * 24 * 60 * 60 * 1000);
    const messagesThisMonth = Math.floor(Math.random() * 80) + 30; // 30-110 messages per month
    
    for (let i = 0; i < messagesThisMonth; i++) {
      // Weight participants differently to create more realistic distribution
      const participantWeights = [0.35, 0.30, 0.20, 0.15]; // Alice is most active, Diana least
      const rand = Math.random();
      let senderIndex = 0;
      let cumulative = 0;
      for (let p = 0; p < participants.length; p++) {
        cumulative += participantWeights[p];
        if (rand < cumulative) {
          senderIndex = p;
          break;
        }
      }
      const sender = participants[senderIndex];
      const timestamp = monthStart + (i * (30 * 24 * 60 * 60 * 1000 / messagesThisMonth));
      
      const messageType = Math.random();
      const msg: MessengerMessage = {
        sender_name: sender.name,
        timestamp_ms: timestamp,
      };

      if (messageType < 0.6) {
        // Text message (60%)
        const text = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
        const emoji = Math.random() < 0.3 ? emojis[Math.floor(Math.random() * emojis.length)] : '';
        msg.content = `${text} ${emoji}`;
        
        // Add reactions sometimes
        if (Math.random() < 0.4) {
          const reactionCount = Math.floor(Math.random() * 5) + 1;
          msg.reactions = [];
          for (let r = 0; r < reactionCount; r++) {
            const reactor = participants[Math.floor(Math.random() * participants.length)];
            const reactionTypes = ['❤️', '👍', '😂', '😮', '😢', '😡'];
            msg.reactions.push({
              reaction: reactionTypes[Math.floor(Math.random() * reactionTypes.length)],
              actor: reactor.name,
            });
          }
        }
      } else if (messageType < 0.8) {
        // Photo message (20%)
        msg.photos = [{
          uri: `mock_photo_${month}_${i}.jpg`,
          creation_timestamp: timestamp,
        }];
        
        // Sometimes add text with photo
        if (Math.random() < 0.5) {
          msg.content = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
        }
        
        // Photos often get reactions
        if (Math.random() < 0.6) {
          const reactionCount = Math.floor(Math.random() * 8) + 2;
          msg.reactions = [];
          for (let r = 0; r < reactionCount; r++) {
            const reactor = participants[Math.floor(Math.random() * participants.length)];
            msg.reactions.push({
              reaction: '❤️',
              actor: reactor.name,
            });
          }
        }
      } else if (messageType < 0.95) {
        // Video message (15%)
        msg.videos = [{
          uri: `mock_video_${month}_${i}.mp4`,
          creation_timestamp: timestamp,
          thumbnail: {
            uri: `mock_thumbnail_${month}_${i}.jpg`,
          },
        }];
        
        if (Math.random() < 0.5) {
          msg.content = 'Check out this video!';
        }
        
        if (Math.random() < 0.5) {
          const reactionCount = Math.floor(Math.random() * 6) + 1;
          msg.reactions = [];
          for (let r = 0; r < reactionCount; r++) {
            const reactor = participants[Math.floor(Math.random() * participants.length)];
            msg.reactions.push({
              reaction: '👍',
              actor: reactor.name,
            });
          }
        }
      } else {
        // Audio message (5%)
        msg.audio_files = [{
          uri: `mock_audio_${month}_${i}.m4a`,
          creation_timestamp: timestamp,
        }];
      }
      
      messages.push(msg);
    }
  }

  // Sort messages by timestamp
  messages.sort((a, b) => a.timestamp_ms - b.timestamp_ms);

  return {
    participants,
    messages,
    title: 'Mock Group Chat',
    is_still_participant: true,
    thread_type: 'RegularGroup',
  };
}

/**
 * Generate and analyze mock data, returning WrappedData
 */
export async function generateMockWrappedData() {
  const conversation = generateMockConversation();
  const parsedMessages = parseMessengerFile(conversation);
  const wrappedData = analyzeChatData(parsedMessages, conversation.title || 'Mock Group Chat');
  return wrappedData;
}

