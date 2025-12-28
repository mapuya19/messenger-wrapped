import type { LinguisticStats } from '@/types';

export interface LinguisticChampions {
  wordsmith: { name: string; diversity: number };
  emojiChampion: { name: string; count: number; topEmojis: Array<{ emoji: string; count: number }> };
  linguisticChampion: { name: string; avgLength: number };
}

/**
 * Find linguistic champions from linguistic stats
 * @param linguisticStats - Map of participant names to their linguistic stats
 * @param contributors - Array of contributors as fallback
 * @returns Object containing wordsmith, emojiChampion, and linguisticChampion
 */
export function findLinguisticChampions(
  linguisticStats: Map<string, LinguisticStats>,
  contributors: Array<{ name: string }> = []
): LinguisticChampions {
  // Initialize champions
  let wordsmith = { name: '', diversity: 0 };
  let emojiChampion = { name: '', count: 0, topEmojis: [] as Array<{ emoji: string; count: number }> };
  let linguisticChampion = { name: '', avgLength: 0 };

  // Find wordsmith (highest vocabulary diversity)
  for (const [name, stats] of linguisticStats.entries()) {
    if (name && name.trim()) {
      if (stats.vocabularyDiversity > wordsmith.diversity) {
        wordsmith = { name: name.trim(), diversity: stats.vocabularyDiversity };
      }
      if (stats.emojiUsage.count > emojiChampion.count) {
        emojiChampion = {
          name: name.trim(),
          count: stats.emojiUsage.count,
          topEmojis: stats.emojiUsage.topEmojis.slice(0, 5),
        };
      }
      if (stats.averageMessageLength > linguisticChampion.avgLength) {
        linguisticChampion = { name: name.trim(), avgLength: stats.averageMessageLength };
      }
    }
  }

  // Fallback: if no champions found but we have stats, use the first entry with a valid name
  if (!wordsmith.name && !emojiChampion.name && !linguisticChampion.name && linguisticStats.size > 0) {
    const firstEntry = Array.from(linguisticStats.entries()).find(([name]) => name && name.trim());
    if (firstEntry) {
      const name = firstEntry[0].trim();
      wordsmith = { name, diversity: firstEntry[1].vocabularyDiversity || 0 };
      emojiChampion = {
        name,
        count: firstEntry[1].emojiUsage.count || 0,
        topEmojis: firstEntry[1].emojiUsage.topEmojis.slice(0, 5),
      };
      linguisticChampion = { name, avgLength: firstEntry[1].averageMessageLength || 0 };
    }
  }

  // If still no champions and we have contributors, use the top contributor by message count
  if (!wordsmith.name && !emojiChampion.name && !linguisticChampion.name && contributors.length > 0) {
    const topContributor = contributors.find(c => c.name && c.name.trim()) || contributors[0];
    if (topContributor && topContributor.name) {
      const name = topContributor.name.trim();
      wordsmith = { name, diversity: 0 };
      emojiChampion = { name, count: 0, topEmojis: [] };
      linguisticChampion = { name, avgLength: 0 };
    }
  }

  // Final fallback: ensure at least one champion is shown (even if all values are 0)
  if (!wordsmith.name && !emojiChampion.name && !linguisticChampion.name && linguisticStats.size > 0) {
    const firstEntry = Array.from(linguisticStats.entries()).find(([name]) => name && name.trim());
    if (firstEntry) {
      const name = firstEntry[0].trim();
      wordsmith = { name, diversity: 0 };
      emojiChampion = { name, count: 0, topEmojis: [] };
      linguisticChampion = { name, avgLength: 0 };
    }
  }

  return { wordsmith, emojiChampion, linguisticChampion };
}

