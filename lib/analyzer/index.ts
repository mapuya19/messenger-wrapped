import type { ParsedMessage, WrappedData, ChatHistoryDataPoint } from '@/types';
import { calculateChatStats, calculateContributorStats, isSystemMessage } from './stats-calculator';
import { calculateAllLinguisticStats } from './linguistic-analyzer';
import {
  calculateReactionStats,
  getTopReactedImages,
  getTopReactedVideos,
  getTopReactedText,
} from './reaction-analyzer';

/**
 * Generate chat history data points grouped by month
 * Includes all 12 months of the year that contains the chat activity
 */
function generateChatHistory(messages: ParsedMessage[]): ChatHistoryDataPoint[] {
  if (messages.length === 0) return [];

  const monthlyData = new Map<string, { count: number; participants: Set<string> }>();

  // First pass: collect data from messages
  for (const msg of messages) {
    // Skip system messages
    if (isSystemMessage(msg.senderName)) {
      continue;
    }
    
    const date = new Date(msg.timestamp);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    let data = monthlyData.get(monthKey);
    if (!data) {
      data = { count: 0, participants: new Set() };
      monthlyData.set(monthKey, data);
    }
    
    data.count++;
    data.participants.add(msg.senderName);
  }

  // Second pass: fill in all 12 months of the year(s) that contain messages
  if (messages.length > 0) {
    const firstDate = new Date(messages[0].timestamp);
    const lastDate = new Date(messages[messages.length - 1].timestamp);
    
    // Determine the year range
    const startYear = firstDate.getFullYear();
    const endYear = lastDate.getFullYear();
    
    // For each year in the range, add all 12 months (January through December)
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 0; month < 12; month++) {
        const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, { count: 0, participants: new Set() });
        }
      }
    }
  }

  return Array.from(monthlyData.entries())
    .map(([date, data]) => ({
      date,
      messageCount: data.count,
      participantCount: data.participants.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Main function to analyze all chat data and generate wrapped data
 */
export function analyzeChatData(
  messages: ParsedMessage[],
  chatName: string
): WrappedData {
  // Calculate basic stats
  const stats = calculateChatStats(messages);
  
  // Calculate contributor stats
  const contributors = calculateContributorStats(messages);
  
  // Calculate linguistic stats
  const linguisticStats = calculateAllLinguisticStats(contributors, messages);
  
  // Calculate reaction stats
  const allReactionStats = calculateReactionStats(messages);
  const topReactedImages = getTopReactedImages(allReactionStats, 10);
  const topReactedVideos = getTopReactedVideos(allReactionStats, 10);
  const topReactedText = getTopReactedText(allReactionStats, 10);
  
  // Generate chat history
  const chatHistory = generateChatHistory(messages);

  return {
    chatName,
    stats,
    contributors,
    linguisticStats,
    topReactedImages,
    topReactedVideos,
    topReactedText,
    chatHistory,
  };
}
