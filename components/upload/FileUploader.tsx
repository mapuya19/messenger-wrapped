'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { extractZipFile, findMessageFiles, getAvailableChats, readDirectory } from '@/lib/utils/file-utils';
import { parseMessengerFile, mergeMessages, parseJSONFile, parseHTMLFile, readFileAsText, extractChatName } from '@/lib/utils/messenger-parser';
import type { ParsedMessage, MessengerConversation } from '@/types';

// Type for conversation that may include group photo URI (from HTML parsing)
type ConversationWithGroupPhoto = MessengerConversation & { groupPhotoUri?: string };
import { analyzeChatData } from '@/lib/analyzer';
import { useChatData } from '@/contexts/ChatDataContext';
import { useRouter } from 'next/navigation';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

export function FileUploader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [availableChats, setAvailableChats] = useState<string[]>([]);
  const [extractedFiles, setExtractedFiles] = useState<Map<string, File> | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { dispatch } = useChatData();
  const router = useRouter();
  const { supportsFileSystemAPI } = useDeviceDetection();

  const processZipFile = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);
      setProgress(0);

      // Extract zip
      const files = await extractZipFile(file);
      setExtractedFiles(files);
      setProgress(20);

      // Process the extracted files
      await processFiles(files);
    } catch (error) {
      console.error('Error processing zip:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to process zip file',
      });
      setIsProcessing(false);
    }
  }, [dispatch]);

  const processFiles = async (files: Map<string, File>, chatName?: string) => {
    try {
      setProgress(40);

      // Get available chats from Messenger JSON files
      const chats = getAvailableChats(files);
      setAvailableChats(chats);

      if (chats.length === 0) {
        throw new Error('No chat conversations found.');
      }

      // If chatName is provided, use it; otherwise use the first chat or let user select
      const targetChatName = chatName || (chats.length === 1 ? chats[0] : null);

      if (targetChatName) {
        await processChat(files, targetChatName);
      } else {
        setProgress(30);
        setIsProcessing(false);
        // Wait for user to select chat
      }
    } catch (error) {
      console.error('Error processing files:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to process files',
      });
      setIsProcessing(false);
    }
  };

  const processChat = async (files: Map<string, File>, chatName: string) => {
    try {
      setProgress(40);

      // Process as Facebook Messenger JSON files
      let chatFiles = new Map<string, File>();
      // Normalize chat name: remove spaces, convert to lowercase, and handle underscores
      // The chat name from getAvailableChats has spaces, so we need to match it back to folder names
      const normalizedChatName = chatName.toLowerCase().replace(/\s+/g, '');
      const normalizedChatNameWithUnderscore = chatName.toLowerCase().replace(/\s+/g, '_');
      
      // Check if we have files with messages/inbox/ prefix (from zip or root folder selection)
      const hasInboxPrefix = Array.from(files.keys()).some(path => path.includes('messages/inbox/'));
      
      if (hasInboxPrefix) {
        // Find all inbox folders and match by the part before the underscore
        for (const [path, file] of files.entries()) {
          // Match paths like: messages/inbox/ChatName_hash123/...
          const inboxMatch = path.match(/messages\/inbox\/([^\/]+)/i);
          if (inboxMatch) {
            const folderName = inboxMatch[1];
            // Extract the base name (before underscore) and normalize
            const folderBaseName = folderName.split('_')[0].toLowerCase().replace(/_/g, '');
            const folderBaseNameWithUnderscore = folderName.split('_')[0].toLowerCase();
            
            // Match if the folder base name matches the chat name (with or without underscores/spaces)
            if (folderBaseName === normalizedChatName || 
                folderBaseNameWithUnderscore === normalizedChatNameWithUnderscore ||
                folderName.toLowerCase().startsWith(normalizedChatNameWithUnderscore + '_') ||
                folderName.toLowerCase() === normalizedChatNameWithUnderscore) {
              chatFiles.set(path, file);
            }
          }
        }
      } else {
        // User selected a folder directly - all files are for this chat
        // Check if paths match the chat folder name pattern
        for (const [path, file] of files.entries()) {
          // Match: ChatName_hash123/message_1.json or just message_1.json
          const folderMatch = path.match(/^([^\/]+)\//);
          if (folderMatch) {
            const folderName = folderMatch[1];
            const folderBaseName = folderName.split('_')[0].toLowerCase().replace(/_/g, '');
            const folderBaseNameWithUnderscore = folderName.split('_')[0].toLowerCase();
            
            if (folderBaseName === normalizedChatName || 
                folderBaseNameWithUnderscore === normalizedChatNameWithUnderscore ||
                folderName.toLowerCase().startsWith(normalizedChatNameWithUnderscore + '_') ||
                folderName.toLowerCase() === normalizedChatNameWithUnderscore) {
              chatFiles.set(path, file);
            }
          } else {
            // Files at root level - assume they're for the selected chat
            chatFiles.set(path, file);
          }
        }
      }

      // Debug: log what we found
      if (chatFiles.size === 0) {
        console.log('No files matched for chat:', chatName);
        console.log('Normalized chat name:', normalizedChatName, normalizedChatNameWithUnderscore);
        // Log some sample paths to help debug
        const samplePaths = Array.from(files.keys()).slice(0, 5);
        console.log('Sample file paths:', samplePaths);
      } else {
        console.log(`Found ${chatFiles.size} files for chat: ${chatName}`);
      }

      let messageFiles = findMessageFiles(chatFiles);
      
      // If no message files found in filtered files, try searching in all files
      // This handles the case where user selected a folder directly or matching failed
      if (messageFiles.length === 0) {
        const allMessageFiles = findMessageFiles(files);
        
        // If we found message files in all files, use them
        // This handles cases where folder name doesn't match exactly
        if (allMessageFiles.length > 0) {
          messageFiles = allMessageFiles;
          // Update chatFiles to include all files so processing works correctly
          chatFiles = files;
        }
      }
      
      if (messageFiles.length === 0) {
        // Provide more helpful error message with available chats
        const availableChats = getAvailableChats(files);
        const availableList = availableChats.length > 0 
          ? ` Available chats: ${availableChats.join(', ')}`
          : '';
        
        // Additional debug info
        const matchedPaths = Array.from(chatFiles.keys());
        const allPaths = Array.from(files.keys()).slice(0, 5);
        const debugInfo = matchedPaths.length > 0 
          ? ` Found ${matchedPaths.length} matching files but no message files. Sample paths: ${matchedPaths.slice(0, 3).join(', ')}`
          : ` No files matched the chat name. Sample all paths: ${allPaths.join(', ')}`;
        
        throw new Error(`No message files found for "${chatName}".${debugInfo}${availableList}`);
      }

      setProgress(50);

      // Helper function to convert file paths to blob URLs
      const convertMediaToBlobUrls = async (messages: ParsedMessage[]) => {
        for (const msg of messages) {
          // Convert photo URIs to blob URLs
          if (msg.photos) {
            for (const photo of msg.photos) {
              if (photo.uri && !photo.uri.startsWith('blob:') && !photo.uri.startsWith('http')) {
                // Extract filename from URI
                const filename = photo.uri.split('/').pop() || '';
                // Try to find the file in chatFiles by filename
                const photoFile = Array.from(chatFiles.entries()).find(([path, file]) => {
                  const pathFilename = path.split('/').pop() || '';
                  return pathFilename === filename || 
                         path.endsWith(photo.uri) || 
                         path.includes(filename) ||
                         file.name === filename;
                })?.[1];
                
                if (photoFile) {
                  try {
                    photo.uri = URL.createObjectURL(photoFile);
                  } catch {
                    console.warn('Failed to create blob URL for photo:', photo.uri);
                  }
                }
              }
            }
          }
          
          // Convert video URIs to blob URLs
          if (msg.videos) {
            for (const video of msg.videos) {
              if (video.uri && !video.uri.startsWith('blob:') && !video.uri.startsWith('http')) {
                // Extract filename from URI
                const filename = video.uri.split('/').pop() || '';
                // Try to find the file in chatFiles by filename
                const videoFile = Array.from(chatFiles.entries()).find(([path, file]) => {
                  const pathFilename = path.split('/').pop() || '';
                  return pathFilename === filename || 
                         path.endsWith(video.uri) || 
                         path.includes(filename) ||
                         file.name === filename;
                })?.[1];
                
                if (videoFile) {
                  try {
                    video.uri = URL.createObjectURL(videoFile);
                  } catch {
                    console.warn('Failed to create blob URL for video:', video.uri);
                  }
                }
              }
            }
          }
          
          // Convert audio file URIs to blob URLs
          if (msg.audioFiles) {
            for (const audio of msg.audioFiles) {
              if (audio.uri && !audio.uri.startsWith('blob:') && !audio.uri.startsWith('http')) {
                // Extract filename from URI (could be just filename or path like audio/filename.m4a)
                const filename = audio.uri.split('/').pop() || audio.uri;
                // Try to find the file in chatFiles by filename, including in audio folder
                const audioFile = Array.from(chatFiles.entries()).find(([path, file]) => {
                  const pathFilename = path.split('/').pop() || '';
                  // Match exact filename or path containing audio folder
                  return pathFilename === filename || 
                         path.endsWith(audio.uri) || 
                         (path.includes('/audio/') && pathFilename === filename) ||
                         (path.includes('audio') && pathFilename === filename) ||
                         file.name === filename;
                })?.[1];
                
                if (audioFile) {
                  try {
                    audio.uri = URL.createObjectURL(audioFile);
                  } catch {
                    console.warn('Failed to create blob URL for audio:', audio.uri);
                  }
                }
              }
            }
          }
        }
      };

      // Parse all message files
      const parsedMessages: ParsedMessage[][] = [];
      let extractedChatName = '';
      let groupPhotoUri: string | undefined;
      const allParticipantsSet = new Set<string>(); // Collect all participants from all files

      for (let i = 0; i < messageFiles.length; i++) {
        const file = messageFiles[i];
        const content = await readFileAsText(file);
        
        // Detect file type and parse accordingly
        const isHTML = file.name.toLowerCase().endsWith('.html') || content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html');
        const conversation: ConversationWithGroupPhoto = isHTML ? parseHTMLFile(content) as ConversationWithGroupPhoto : parseJSONFile(content);
        
        // Collect participants from this conversation
        if (conversation.participants && conversation.participants.length > 0) {
          conversation.participants.forEach(p => {
            if (p.name && p.name.trim()) {
              allParticipantsSet.add(p.name.trim());
            }
          });
        }
        
        // Extract group photo from first HTML file if available
        if (isHTML && !groupPhotoUri && conversation.groupPhotoUri) {
          groupPhotoUri = conversation.groupPhotoUri;
          // Convert group photo URI to blob URL if it's a local file
          if (groupPhotoUri && !groupPhotoUri.startsWith('blob:') && !groupPhotoUri.startsWith('http')) {
            const filename = groupPhotoUri.split('/').pop() || '';
            const photoFile = Array.from(chatFiles.entries()).find(([path, file]) => {
              const pathFilename = path.split('/').pop() || '';
              return pathFilename === filename || 
                     path.endsWith(groupPhotoUri!) || 
                     path.includes(filename) ||
                     file.name === filename;
            })?.[1];
            if (photoFile) {
              try {
                groupPhotoUri = URL.createObjectURL(photoFile);
              } catch {
                console.warn('Failed to create blob URL for group photo:', groupPhotoUri);
              }
            }
          }
        }
        
        if (!extractedChatName) {
          extractedChatName = extractChatName(file.name, conversation);
        }

        const messages = parseMessengerFile(conversation);
        
        // Convert media URIs to blob URLs
        await convertMediaToBlobUrls(messages);
        
        parsedMessages.push(messages);
        
        setProgress(50 + (i / messageFiles.length) * 40);
      }

      setProgress(90);

      // Merge and analyze
      const allMessages = mergeMessages(parsedMessages);
      const allParticipants = Array.from(allParticipantsSet);
      const wrappedData = analyzeChatData(allMessages, extractedChatName || chatName, allParticipants);
      
      // Add group photo if found
      if (groupPhotoUri) {
        wrappedData.groupPhotoUri = groupPhotoUri;
      }

      setProgress(100);

      dispatch({ type: 'SET_DATA', payload: { data: wrappedData, chatName: extractedChatName || chatName } });
      
      // Show success animation before navigating
      setShowSuccessAnimation(true);
      
      // Wait for animation to play, then navigate
      setTimeout(() => {
        router.push('/wrapped');
      }, 1500);
    } catch (error) {
      console.error('Error processing chat:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to process chat',
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleSelectFolder = async () => {
    // Check if API is available
    if (!('showDirectoryPicker' in window)) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'File System Access API is not supported in this browser. Please use the zip upload option.',
      });
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);

      // Try to use the API - this will fail if blocked
      // @ts-expect-error - showDirectoryPicker is not in TypeScript types yet
      const dirHandle = await window.showDirectoryPicker({
        mode: 'read',
      });
      
      setProgress(10);

      // Read all files from directory
      const files = await readDirectory(dirHandle);
      setExtractedFiles(files);
      setProgress(30);

      // Process the files
      await processFiles(files);
    } catch (error) {
      // Check if user cancelled the dialog (AbortError)
      if (error instanceof DOMException && error.name === 'AbortError') {
        // User cancelled - this is expected behavior, don't show error
        setIsProcessing(false);
        return;
      }
      
      // Check if it's a permission/security error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('permission') || errorMessage.includes('not allowed') || errorMessage.includes('SecurityError')) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'File System Access API is blocked. Please use the zip upload option instead.',
        });
      } else {
        console.error('Error processing folder:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: errorMessage || 'Failed to process folder. Please try the zip upload option.',
        });
      }
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
      processZipFile(file);
    } else {
      dispatch({ type: 'SET_ERROR', payload: 'Please upload a zip file containing your Messenger data' });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Folder picker button (if supported) */}
      {supportsFileSystemAPI && (
        <div className="space-y-2">
          <Button
            onClick={handleSelectFolder}
            disabled={isProcessing}
            size="lg"
            variant="secondary"
            className="w-full"
          >
            {isProcessing ? 'Processing...' : '📁 Select Folder'}
          </Button>
          <p className="text-white/40 text-xs text-center">
            Navigate to <code className="bg-white/10 px-1 rounded">messages/inbox/[group_name]</code>
          </p>
        </div>
      )}

      {/* Divider if folder picker is shown */}
      {supportsFileSystemAPI && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-messenger-dark text-white/60">OR</span>
          </div>
        </div>
      )}

      {/* Chat selector (if multiple chats found) */}
      <AnimatePresence mode="wait">
        {availableChats.length > 1 && !selectedChat ? (
          <motion.div
            key="chat-selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-white/80 text-center"
            >
              Select a chat to analyze:
            </motion.p>
            
            {/* Search box */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="relative"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </motion.div>
            
            <motion.div
              className="space-y-2 max-h-96 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {availableChats
                .filter(chat => 
                  chat.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((chat, index) => (
                  <motion.div
                    key={chat}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                  >
                    <Button
                      onClick={() => {
                        setSelectedChat(chat);
                        if (extractedFiles) {
                          processChat(extractedFiles, chat);
                        }
                      }}
                      variant="secondary"
                      className="w-full"
                    >
                      {chat}
                    </Button>
                  </motion.div>
                ))}
              {availableChats.filter(chat => 
                chat.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-white/60 text-center py-4"
                >
                  No chats found matching &quot;{searchQuery}&quot;
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="upload-area"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              animate={{
                scale: isDragOver ? 1.02 : 1,
                borderColor: isDragOver ? 'rgba(0, 132, 255, 1)' : 'rgba(255, 255, 255, 0.2)',
                backgroundColor: isDragOver ? 'rgba(0, 132, 255, 0.1)' : 'transparent',
              }}
              transition={{ duration: 0.2 }}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center
                ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip,application/zip"
                onChange={handleInputChange}
                className="hidden"
                disabled={isProcessing}
              />
              <motion.div
                className="space-y-4"
                animate={{ y: isDragOver ? -5 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="text-4xl"
                  animate={{ 
                    scale: isDragOver ? 1.2 : 1,
                    rotate: isDragOver ? 5 : 0
                  }}
                  transition={{ duration: 0.2 }}
                >
                  📦
                </motion.div>
                <div>
                  <p className="text-white font-semibold mb-2">
                    {isProcessing ? 'Processing...' : 'Drop your zip file here'}
                  </p>
                  <p className="text-white/60 text-sm">
                    or click to browse (supports .zip files)
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <AnimatePresence>
        {isProcessing && !showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProgressBar progress={progress} />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-white/60 mt-2 text-center"
            >
              Analyzing messages...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-messenger-dark/95 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                duration: 0.6
              }}
              className="relative"
            >
              {/* Checkmark circle background */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1
                }}
                className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-messenger-blue to-blue-600 flex items-center justify-center shadow-2xl"
              >
                {/* Checkmark */}
                <motion.svg
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    pathLength: { duration: 0.5, delay: 0.3, ease: 'easeOut' },
                    opacity: { delay: 0.3 }
                  }}
                  className="w-12 h-12 lg:w-16 lg:h-16 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <motion.path
                    strokeLinecap="butt"
                    strokeLinejoin="round"
                    d="M6 12l4 4l7-7"
                  />
                </motion.svg>
              </motion.div>

              {/* Sparkle particles */}
              <AnimatePresence>
                {[...Array(12)].map((_, i) => {
                  const angle = (i * Math.PI * 2) / 12;
                  const radius = 80;
                  return (
                    <motion.div
                      key={i}
                      initial={{ 
                        scale: 0,
                        opacity: 0
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0]
                      }}
                      exit={{
                        scale: 0,
                        opacity: 0
                      }}
                      transition={{
                        duration: 1,
                        delay: 0.4 + i * 0.05,
                        ease: 'easeOut',
                        times: [0, 0.5, 1]
                      }}
                      className="absolute w-2 h-2 bg-white rounded-full pointer-events-none"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`,
                      }}
                    />
                  );
                })}
              </AnimatePresence>

              {/* Success text */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="text-white text-xl lg:text-2xl font-bold mt-8 text-center"
              >
                Ready to view your Wrapped!
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

