// Messenger data types based on Facebook export format

export interface MessengerParticipant {
  name: string;
}

export interface MessengerReaction {
  reaction: string;
  actor: string;
}

export interface MessengerPhoto {
  uri: string;
  creation_timestamp?: number;
}

export interface MessengerVideo {
  uri: string;
  creation_timestamp?: number;
  thumbnail?: {
    uri: string;
  };
}

export interface MessengerAudioFile {
  uri: string;
  creation_timestamp?: number;
}

export interface MessengerMessage {
  sender_name: string;
  timestamp_ms: number;
  content?: string;
  reactions?: MessengerReaction[];
  photos?: MessengerPhoto[];
  videos?: MessengerVideo[];
  audio_files?: MessengerAudioFile[];
  share?: {
    link?: string;
  };
  gifs?: Array<{ uri: string }>;
  files?: Array<{ uri: string }>;
  sticker?: {
    uri: string;
  };
}

export interface MessengerConversation {
  participants: MessengerParticipant[];
  messages: MessengerMessage[];
  title?: string;
  is_still_participant?: boolean;
  thread_type?: string;
  thread_path?: string;
}

// Parsed and normalized types
export interface ParsedMessage {
  senderName: string;
  timestamp: number;
  content?: string;
  reactions: MessengerReaction[];
  photos: MessengerPhoto[];
  videos: MessengerVideo[];
  audioFiles: MessengerAudioFile[];
  hasContent: boolean;
  isMediaOnly: boolean;
}

export interface ChatStats {
  totalMessages: number;
  totalPhotos: number;
  totalVideos: number;
  totalAudioMinutes: number;
  participants: string[];
  dateRange: {
    start: number;
    end: number;
  };
}

export interface ContributorStats {
  name: string;
  messageCount: number;
  photoCount: number;
  videoCount: number;
  audioMinutes: number;
  totalCharacters: number;
  uniqueWords: Set<string>;
  emojiCount: number;
  emojis: Map<string, number>;
}

export interface LinguisticStats {
  vocabularyDiversity: number; // unique words / total words
  averageMessageLength: number;
  emojiUsage: {
    count: number;
    uniqueEmojis: number;
    topEmojis: Array<{ emoji: string; count: number }>;
  };
}

export interface ReactionStats {
  message: ParsedMessage;
  reactionCount: number;
  reactions: MessengerReaction[];
}

export interface ChatHistoryDataPoint {
  date: string;
  messageCount: number;
  participantCount: number;
}

export interface WrappedData {
  chatName: string;
  stats: ChatStats;
  contributors: ContributorStats[];
  linguisticStats: Map<string, LinguisticStats>;
  topReactedImages: ReactionStats[];
  topReactedVideos: ReactionStats[];
  topReactedText: ReactionStats[];
  chatHistory: ChatHistoryDataPoint[];
  groupPhotoUri?: string;
}




