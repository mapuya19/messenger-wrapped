'use client';

import React, { useState, useEffect } from 'react';
import { useChatData } from '@/context/ChatDataContext';
import { UploadSelector } from '@/components/upload/UploadSelector';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { generateMockWrappedData } from '@/lib/utils/mock-data';
import { useRouter } from 'next/navigation';

function HomeContent() {
  const { state, dispatch } = useChatData();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoadingMock, setIsLoadingMock] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLoadMockData = async () => {
    try {
      setIsLoadingMock(true);
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const wrappedData = await generateMockWrappedData();
      
      dispatch({ 
        type: 'SET_DATA', 
        payload: { 
          data: wrappedData, 
          chatName: wrappedData.chatName 
        } 
      });
      
      router.push('/wrapped');
    } catch (error) {
      console.error('Error loading mock data:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load mock data',
      });
    } finally {
      setIsLoadingMock(false);
    }
  };

  return (
    <>
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-messenger bg-clip-text text-transparent">
          Messenger Wrapped
        </h1>
        <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto">
          Explore your Facebook Messenger chat history, inspired by Spotify Wrapped
        </p>
      </div>

      <div className="max-w-4xl mx-auto mb-12">
        <Card className="mb-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">🔒 Your Privacy Matters</h2>
            <div className="space-y-2 text-white/80">
              <p>
                All processing happens <strong>entirely in your browser</strong>. Your chat data never leaves your device.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>No data is uploaded to any server</li>
                <li>No external API calls with your data</li>
                <li>No analytics tracking your messages</li>
                <li>Everything runs locally on your machine</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">How to Get Started</h2>
              <div className="space-y-4 text-white/80">
                    <div>
                      <h3 className="font-semibold text-white mb-2">1. Download Your Messenger Data</h3>
                      <p className="text-sm">
                        Go to Facebook Settings → Your Facebook Information → Download Your Information.
                        Select &quot;Messages&quot; and choose JSON format. Download the zip file.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">2. Upload or Select Folder</h3>
                      <p className="text-sm">
                        {isMounted && typeof window !== 'undefined' && 'showDirectoryPicker' in window
                          ? 'On desktop (Chrome, Edge, Opera), you can select your downloaded Messenger data folder directly (navigate to the messages/inbox/[group_name] folder for a specific chat). On mobile or other browsers, upload the zip file. If your zip contains multiple chats, you\'ll be able to select which specific group chat you want to analyze.'
                          : 'Upload your Messenger data zip file below. If your zip contains multiple chats, you\'ll be able to select which specific group chat you want to analyze. If you extracted it, you can also select the folder directly in supported browsers.'}
                      </p>
                    </div>
                <div>
                  <h3 className="font-semibold text-white mb-2">3. Explore Your Wrapped</h3>
                  <p className="text-sm">
                    View your chat statistics, top contributors, most reacted content, and more!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto mb-8">
        <Card className="bg-blue-500/10 border-blue-500/50">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">🧪 Test with Mock Data</h2>
            <p className="text-white/80 text-sm">
              Want to try out Messenger Wrapped without downloading your data? Click the button below to load sample data and explore all the features!
            </p>
            <Button
              onClick={handleLoadMockData}
              disabled={isLoadingMock || state.isLoading}
              size="lg"
              className="w-full md:w-auto"
            >
              {isLoadingMock ? 'Loading Mock Data...' : '🚀 Load Mock Data'}
            </Button>
          </div>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto mb-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-messenger-dark text-white/60">OR</span>
          </div>
        </div>
      </div>

      <UploadSelector />

      {state.error && (
        <div className="mt-8 max-w-4xl mx-auto">
          <Card className="bg-red-500/10 border-red-500/50">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-1">Error</h3>
                <p className="text-red-300">{state.error}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-messenger-dark">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <HomeContent />
      </div>
    </main>
  );
}

