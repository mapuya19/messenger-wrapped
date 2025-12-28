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
 * Find all message files (JSON or HTML) in a file map (from zip or folder)
 * Handles multiple pages: message_1.html, message_2.html, etc.
 */
export function findMessageFiles(files: Map<string, File>): File[] {
  const messageFiles: File[] = [];
  
  for (const [path, file] of files.entries()) {
    // Match: messages/inbox/GroupName_abc123/message_1.json or message_1.html, message_2.html, etc.
    // OR: message_1.json/html (when user selects folder directly)
    // OR: GroupName_abc123/message_1.json/html (when user selects inbox folder)
    if (path.match(/messages\/inbox\/[^\/]+\/message_\d+\.(json|html)$/i) ||
        path.match(/^message_\d+\.(json|html)$/i) ||
        path.match(/^[^\/]+\/message_\d+\.(json|html)$/i)) {
      messageFiles.push(file);
    }
  }

  return messageFiles.sort((a, b) => {
    // Sort by filename to maintain order (works for both .json and .html)
    // This ensures message_1.html comes before message_2.html, etc.
    const aMatch = a.name.match(/message_(\d+)\.(json|html)$/);
    const bMatch = b.name.match(/message_(\d+)\.(json|html)$/);
    if (aMatch && bMatch) {
      return parseInt(aMatch[1]) - parseInt(bMatch[1]);
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get list of available group chats from file map, sorted alphabetically
 */
export function getAvailableChats(files: Map<string, File>): string[] {
  const chatSet = new Set<string>();
  
  for (const path of files.keys()) {
    const chatName = extractChatName(path);
    if (chatName !== 'Unknown Chat') {
      chatSet.add(chatName);
    } else if (path.match(/^message_\d+\.(json|html)$/i)) {
      // If we have message files at root, we can't determine chat name from path alone
      // This will be handled by extracting from the file content
      chatSet.add('Selected Chat');
    }
  }

  return Array.from(chatSet).sort();
}

/**
 * Filter files for a specific chat
 */
export function filterChatFiles(files: Map<string, File>, chatName: string): Map<string, File> {
  const filtered = new Map<string, File>();
  // Normalize chat name: remove spaces and convert to lowercase for matching
  const normalizedChatName = chatName.replace(/\s+/g, '_').toLowerCase();
  
  for (const [path, file] of files.entries()) {
    const extractedName = extractChatName(path);
    const normalizedExtracted = extractedName.replace(/\s+/g, '_').toLowerCase();
    
    // Match if the extracted chat name matches the requested chat name
    if (normalizedExtracted === normalizedChatName || 
        path.toLowerCase().includes(normalizedChatName)) {
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

/**
 * Extract chat name from folder path or conversation data
 * Handles various path formats: messages/inbox/GroupName_abc123/, GroupName_abc123/, etc.
 */
export function extractChatName(
  path: string,
  conversationTitle?: string
): string {
  // Try to get title from conversation first
  if (conversationTitle) {
    return conversationTitle;
  }

  // Extract from path: messages/inbox/GroupName_abc123/
  const match = path.match(/inbox[\/\\]([^\/\\]+)/);
  if (match) {
    // Remove any hash suffix
    return match[1].split('_')[0].replace(/_/g, ' ');
  }

  // Try direct folder name match: GroupName_abc123/
  const directMatch = path.match(/^([^\/\\]+)[\/\\]/);
  if (directMatch) {
    return directMatch[1].split('_')[0].replace(/_/g, ' ');
  }

  return 'Unknown Chat';
}

