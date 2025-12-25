'use client';

import React from 'react';
import { useDeviceDetection } from '../hooks/useDeviceDetection';
import { FolderPicker } from './FolderPicker';
import { FileUploader } from './FileUploader';

export function UploadSelector() {
  const { isMobile, supportsFileSystemAPI, isMounted } = useDeviceDetection();


  // Prevent hydration mismatch by not rendering device-specific content until mounted
  if (!isMounted) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white mb-2">Upload Zip File</h3>
          <p className="text-white/60 text-sm mb-4">
            Upload your downloaded Messenger data zip file. If your zip contains multiple chats, you&apos;ll be able to select which specific group chat you want to analyze. Your data is processed locally and never uploaded to any server.
          </p>
          <FileUploader />
        </div>
      </div>
    );
  }

  // Show browser compatibility message if on desktop but API not supported
  const showBrowserWarning = !isMobile && !supportsFileSystemAPI && isMounted;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {showBrowserWarning && (
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-4">
          <p className="text-blue-300 text-sm mb-2">
            <strong>💡 Tip:</strong> The folder picker option (for direct folder access) is available in Chrome, Edge, Opera, and Brave browsers.
          </p>
          {typeof window !== 'undefined' && (navigator.userAgent.includes('Brave') || (typeof navigator !== 'undefined' && 'brave' in navigator)) && (
            <div className="text-blue-200 text-xs mt-2 space-y-1">
              <p>
                <strong>Note:</strong> If the folder picker doesn&apos;t work in Brave, use the zip upload option below. 
                Both methods process your data entirely locally - no data leaves your computer.
              </p>
            </div>
          )}
          {(!(typeof window !== 'undefined' && navigator.userAgent.includes('Brave'))) && (
            <p className="text-blue-200 text-xs mt-2">
              You can use the zip upload option below, which works in all browsers.
            </p>
          )}
        </div>
      )}

      {!isMobile && supportsFileSystemAPI && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              Option 1: Select Folder (Recommended)
            </h3>
            <p className="text-white/60 text-sm mb-4">
              After downloading your Messenger data from Facebook, select the folder containing your messages. 
              Navigate to <code className="bg-white/10 px-1 rounded">messages/inbox/[group_name]</code> folder. 
              Your data never leaves your computer.
            </p>
            <FolderPicker />
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-messenger-dark text-white/60">OR</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white mb-2">
          {isMobile || !supportsFileSystemAPI ? 'Upload Zip File' : 'Option 2: Upload Zip File'}
        </h3>
        {isMobile && (
          <p className="text-white/60 text-sm mb-4">
            On mobile, please upload your Messenger data zip file. If your zip contains multiple chats, you&apos;ll be able to select which specific group chat you want to analyze. Your data is processed locally and never uploaded to any server.
          </p>
        )}
        {!isMobile && supportsFileSystemAPI && (
          <p className="text-white/60 text-sm mb-4">
            Upload your downloaded Messenger data zip file. If your zip contains multiple chats, you&apos;ll be able to select which specific group chat you want to analyze. Your data is processed locally and never uploaded to any server.
          </p>
        )}
        <FileUploader />
      </div>
    </div>
  );
}

