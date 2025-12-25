'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { extractZipFile, findMessageFiles, getAvailableChats } from '@/lib/utils/file-utils';
import { parseMessengerFile, mergeMessages, parseJSONFile, readFileAsText, extractChatName } from '@/lib/parser/messenger-parser';
import { analyzeChatData } from '@/lib/analyzer';
import { useChatData } from '@/context/ChatDataContext';
import { useRouter } from 'next/navigation';

export function FileUploader() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [availableChats, setAvailableChats] = useState<string[]>([]);
  const [extractedFiles, setExtractedFiles] = useState<Map<string, File> | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { dispatch } = useChatData();
  const router = useRouter();

  const processZipFile = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);
      setProgress(0);

      // Extract zip
      const files = await extractZipFile(file);
      setExtractedFiles(files);
      setProgress(20);

      // Get available chats
      const chats = getAvailableChats(files);
      setAvailableChats(chats);

      if (chats.length === 0) {
        throw new Error('No chat conversations found in the zip file.');
      }

      // If only one chat, auto-select it
      if (chats.length === 1) {
        setSelectedChat(chats[0]);
        await processChat(files, chats[0]);
      } else {
        setProgress(30);
        setIsProcessing(false);
        // Wait for user to select chat
      }
    } catch (error) {
      console.error('Error processing zip:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to process zip file',
      });
      setIsProcessing(false);
    }
  }, [dispatch]);

  const processChat = async (files: Map<string, File>, chatName: string) => {
    try {
      setProgress(40);

      // Filter files for selected chat
      const chatFiles = new Map<string, File>();
      const normalizedChatName = chatName.replace(/\s+/g, '_');
      
      for (const [path, file] of files.entries()) {
        if (path.includes(`inbox/${normalizedChatName}`) || path.includes(`inbox/${chatName}`)) {
          chatFiles.set(path, file);
        }
      }

      const messageFiles = findMessageFiles(chatFiles);
      
      if (messageFiles.length === 0) {
        throw new Error(`No message files found for "${chatName}"`);
      }

      setProgress(50);

      // Parse all message files
      const parsedMessages: any[] = [];
      let extractedChatName = '';

      for (let i = 0; i < messageFiles.length; i++) {
        const file = messageFiles[i];
        const content = await readFileAsText(file);
        const conversation = parseJSONFile(content);
        
        if (!extractedChatName) {
          extractedChatName = extractChatName(file.name, conversation);
        }

        const messages = parseMessengerFile(conversation);
        parsedMessages.push(messages);
        
        setProgress(50 + (i / messageFiles.length) * 40);
      }

      setProgress(90);

      // Merge and analyze
      const allMessages = mergeMessages(parsedMessages);
      const wrappedData = analyzeChatData(allMessages, extractedChatName || chatName);

      setProgress(100);

      dispatch({ type: 'SET_DATA', payload: { data: wrappedData, chatName: extractedChatName || chatName } });
      
      // Navigate to wrapped view
      router.push('/wrapped');
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

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
      processZipFile(file);
    } else {
      dispatch({ type: 'SET_ERROR', payload: 'Please upload a zip file' });
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
    <div className="w-full">
      {availableChats.length > 1 && !selectedChat ? (
        <div className="space-y-4">
          <p className="text-white/80 text-center">Select a chat to analyze:</p>
          <div className="space-y-2">
            {availableChats.map((chat) => (
              <Button
                key={chat}
                onClick={() => {
                  if (extractedFiles) {
                    setSelectedChat(chat);
                    processChat(extractedFiles, chat);
                  }
                }}
                variant="secondary"
                className="w-full"
              >
                {chat}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-colors
              ${isDragOver ? 'border-messenger-blue bg-messenger-blue/10' : 'border-white/20'}
              ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-white/40'}
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
            <div className="space-y-4">
              <div className="text-4xl">📦</div>
              <div>
                <p className="text-white font-semibold mb-2">
                  {isProcessing ? 'Processing...' : 'Drop your zip file here'}
                </p>
                <p className="text-white/60 text-sm">
                  or click to browse
                </p>
              </div>
            </div>
          </div>
          {isProcessing && (
            <div className="mt-4">
              <ProgressBar progress={progress} />
              <p className="text-sm text-white/60 mt-2 text-center">
                Extracting and analyzing messages...
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

