import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useChatData } from '@/contexts/ChatDataContext';
import { StoryContainer } from '@/components/story/StoryContainer';
import { DashboardView } from '@/components/dashboard/DashboardView';

export const Route = createFileRoute('/wrapped')({
  component: WrappedPage,
});

function WrappedPage() {
  const { state } = useChatData();
  const navigate = useNavigate();
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    if (!state.wrappedData) {
      navigate({ to: '/' });
    }
  }, [state.wrappedData, navigate]);

  if (!state.wrappedData) {
    return (
      <div className="flex items-center justify-center h-screen bg-messenger-dark">
        <p className="text-white/60">Loading...</p>
      </div>
    );
  }

  if (showDashboard) {
    return <DashboardView onBack={() => setShowDashboard(false)} />;
  }

  return (
    <StoryContainer
      onComplete={() => setShowDashboard(true)}
      onExit={() => navigate({ to: '/' })}
    />
  );
}
