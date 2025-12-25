import JSZip from 'jszip';

/**
 * Extract files from a zip archive
 */
export async function extractZipFile(zipFile: File): Promise<Map<string, File>> {
  const zip = new JSZip();
  const zipData = await zip.loadAsync(zipFile);
  const files = new Map<string, File>();

  for (const [path, zipEntry] of Object.entries(zipData.files)) {
    if (!zipEntry.dir) {
      const blob = await zipEntry.async('blob');
      const file = new File([blob], zipEntry.name, { type: blob.type });
      files.set(path, file);
    }
  }

  return files;
}

/**
 * Find all message JSON files in a file map (from zip or folder)
 */
export function findMessageFiles(files: Map<string, File>): File[] {
  const messageFiles: File[] = [];
  
  for (const [path, file] of files.entries()) {
    // Match: messages/inbox/GroupName_abc123/message_1.json
    if (path.match(/messages\/inbox\/[^\/]+\/message_\d+\.json$/i)) {
      messageFiles.push(file);
    }
  }

  return messageFiles.sort((a, b) => {
    // Sort by filename to maintain order
    const aMatch = a.name.match(/message_(\d+)\.json$/);
    const bMatch = b.name.match(/message_(\d+)\.json$/);
    if (aMatch && bMatch) {
      return parseInt(aMatch[1]) - parseInt(bMatch[1]);
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get list of available group chats from file map
 */
export function getAvailableChats(files: Map<string, File>): string[] {
  const chatSet = new Set<string>();
  
  for (const path of files.keys()) {
    const match = path.match(/messages\/inbox\/([^\/]+)/);
    if (match) {
      const chatName = match[1].split('_')[0].replace(/_/g, ' ');
      chatSet.add(chatName);
    }
  }

  return Array.from(chatSet).sort();
}

/**
 * Filter files for a specific chat
 */
export function filterChatFiles(files: Map<string, File>, chatName: string): Map<string, File> {
  const filtered = new Map<string, File>();
  const normalizedChatName = chatName.replace(/\s+/g, '_');
  
  for (const [path, file] of files.entries()) {
    if (path.includes(`inbox/${normalizedChatName}`) || path.includes(`inbox/${chatName}`)) {
      filtered.set(path, file);
    }
  }

  return filtered;
}

/**
 * Read directory using File System Access API
 */
export async function readDirectory(dirHandle: FileSystemDirectoryHandle): Promise<Map<string, File>> {
  const files = new Map<string, File>();

  async function traverseDirectory(
    handle: FileSystemDirectoryHandle,
    pathPrefix: string = ''
  ): Promise<void> {
    // @ts-expect-error - entries() exists on FileSystemDirectoryHandle but types may be incomplete
    for await (const [name, entry] of handle.entries()) {
      const fullPath = pathPrefix ? `${pathPrefix}/${name}` : name;

      if (entry.kind === 'file') {
        const file = await entry.getFile();
        files.set(fullPath, file);
      } else if (entry.kind === 'directory') {
        await traverseDirectory(entry, fullPath);
      }
    }
  }

  await traverseDirectory(dirHandle);
  return files;
}

