'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { readDirectory } from '@/lib/utils/file-utils';
import { parseMessengerFile, mergeMessages, parseJSONFile, parseHTMLFile, readFileAsText, extractChatName } from '@/lib/parser/messenger-parser';
import type { ParsedMessage } from '@/types';
import { findMessageFiles } from '@/lib/utils/file-utils';
import { analyzeChatData } from '@/lib/analyzer';
import { useChatData } from '@/context/ChatDataContext';
import { useRouter } from 'next/navigation';

export function FolderPicker() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { dispatch } = useChatData();
  const router = useRouter();

  const handleSelectFolder = async () => {
    // Check if API is available
    if (!('showDirectoryPicker' in window)) {
      alert('File System Access API is not supported in this browser. Please use the zip upload option.');
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
      setProgress(30);

      // Find message files
      const messageFiles = findMessageFiles(files);
      
      if (messageFiles.length === 0) {
        throw new Error('No message files found. Please select the correct folder (messages/inbox/[group_name])');
      }

      setProgress(40);

      // Helper function to convert file paths to blob URLs
      const convertMediaToBlobUrls = async (messages: ParsedMessage[]) => {
        for (const msg of messages) {
          // Convert photo URIs to blob URLs
          if (msg.photos) {
            for (const photo of msg.photos) {
              if (photo.uri && !photo.uri.startsWith('blob:') && !photo.uri.startsWith('http')) {
                // Extract filename from URI
                const filename = photo.uri.split('/').pop() || '';
                // Try to find the file in files map by filename
                const photoFile = Array.from(files.entries()).find(([path, file]) => {
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
                // Try to find the file in files map by filename
                const videoFile = Array.from(files.entries()).find(([path, file]) => {
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
                // Try to find the file in files map by filename, including in audio folder
                const audioFile = Array.from(files.entries()).find(([path, file]) => {
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
      let chatName = '';
      let groupPhotoUri: string | undefined;

      for (let i = 0; i < messageFiles.length; i++) {
        const file = messageFiles[i];
        const content = await readFileAsText(file);
        
        // Detect file type and parse accordingly
        const isHTML = file.name.toLowerCase().endsWith('.html') || content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html');
        const conversation = isHTML ? parseHTMLFile(content) : parseJSONFile(content);
        
        // Extract group photo from first HTML file if available
        if (isHTML && !groupPhotoUri && (conversation as any).groupPhotoUri) {
          groupPhotoUri = (conversation as any).groupPhotoUri;
          // Convert group photo URI to blob URL if it's a local file
          if (groupPhotoUri && !groupPhotoUri.startsWith('blob:') && !groupPhotoUri.startsWith('http')) {
            const filename = groupPhotoUri.split('/').pop() || '';
            const photoFile = Array.from(files.entries()).find(([path, file]) => {
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
        
        if (!chatName) {
          chatName = extractChatName(file.name, conversation);
        }

        const messages = parseMessengerFile(conversation);
        
        // Convert media URIs to blob URLs
        await convertMediaToBlobUrls(messages);
        
        parsedMessages.push(messages);
        
        setProgress(40 + (i / messageFiles.length) * 40);
      }

      setProgress(80);

      // Merge and analyze
      const allMessages = mergeMessages(parsedMessages);
      const wrappedData = analyzeChatData(allMessages, chatName);
      
      // Add group photo if found
      if (groupPhotoUri) {
        wrappedData.groupPhotoUri = groupPhotoUri;
      }

      setProgress(100);

      dispatch({ type: 'SET_DATA', payload: { data: wrappedData, chatName } });
      
      // Navigate to wrapped view
      router.push('/wrapped');
    } catch (error) {
      // Check if user cancelled the dialog (AbortError)
      if (error instanceof DOMException && error.name === 'AbortError') {
        // User cancelled - this is expected behavior, don't show error
        return;
      }
      
      // Check if it's a permission/security error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('permission') || errorMessage.includes('not allowed') || errorMessage.includes('SecurityError')) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'File System Access API is blocked. This can happen in Brave even with Shields off. Please use the zip upload option instead.',
        });
      } else {
        console.error('Error processing folder:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: errorMessage || 'Failed to process folder. Please try the zip upload option.',
        });
      }
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleSelectFolder}
        disabled={isProcessing}
        size="lg"
        className="w-full"
      >
        {isProcessing ? 'Processing...' : 'Select Folder (Recommended)'}
      </Button>
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <ProgressBar progress={progress} />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-white/60 mt-2 text-center"
            >
              Reading and analyzing messages...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

