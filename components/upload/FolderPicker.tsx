'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { readDirectory } from '@/lib/utils/file-utils';
import { parseMessengerFile, mergeMessages, parseJSONFile, readFileAsText, extractChatName } from '@/lib/parser/messenger-parser';
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
      // @ts-ignore - showDirectoryPicker is not in TypeScript types yet
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

      // Parse all message files
      const parsedMessages: any[] = [];
      let chatName = '';

      for (let i = 0; i < messageFiles.length; i++) {
        const file = messageFiles[i];
        const content = await readFileAsText(file);
        const conversation = parseJSONFile(content);
        
        if (!chatName) {
          chatName = extractChatName(file.name, conversation);
        }

        const messages = parseMessengerFile(conversation);
        parsedMessages.push(messages);
        
        setProgress(40 + (i / messageFiles.length) * 40);
      }

      setProgress(80);

      // Merge and analyze
      const allMessages = mergeMessages(parsedMessages);
      const wrappedData = analyzeChatData(allMessages, chatName);

      setProgress(100);

      dispatch({ type: 'SET_DATA', payload: { data: wrappedData, chatName } });
      
      // Navigate to wrapped view
      router.push('/wrapped');
    } catch (error) {
      console.error('Error processing folder:', error);
      
      // Check if it's a permission/security error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('permission') || errorMessage.includes('not allowed') || errorMessage.includes('SecurityError')) {
        dispatch({
          type: 'SET_ERROR',
          payload: 'File System Access API is blocked. This can happen in Brave even with Shields off. Please use the zip upload option instead.',
        });
      } else {
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
      {isProcessing && (
        <div className="mt-4">
          <ProgressBar progress={progress} />
          <p className="text-sm text-white/60 mt-2 text-center">
            Reading and analyzing messages...
          </p>
        </div>
      )}
    </div>
  );
}

