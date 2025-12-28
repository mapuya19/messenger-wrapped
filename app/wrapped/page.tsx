'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChatData } from '@/context/ChatDataContext';
import { StoryContainer } from '@/components/story/StoryContainer';
import { DashboardView } from '@/components/dashboard/DashboardView';

export default function WrappedPage() {
  const { state } = useChatData();
  const router = useRouter();
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    if (!state.wrappedData) {
      router.push('/');
    }
  }, [state.wrappedData, router]);

  if (!state.wrappedData) {
    return (
      <div className="flex items-center justify-center h-screen bg-messenger-dark">
        <p className="text-white/60">Loading...</p>
      </div>
    );
  }

  if (showDashboard) {
    return <DashboardView />;
  }

  return <StoryContainer onComplete={() => setShowDashboard(true)} />;
}
