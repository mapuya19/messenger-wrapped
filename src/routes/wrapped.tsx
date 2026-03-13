import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { lazy, useState, useEffect, Suspense } from 'react';
import { useChatData } from '@/contexts/ChatDataContext';

const StoryContainer = lazy(() => import('@/components/story/StoryContainer').then(m => ({ default: m.StoryContainer })));
const DashboardView = lazy(() => import('@/components/dashboard/DashboardView').then(m => ({ default: m.DashboardView })));

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

  const fallback = (
    <div className="flex items-center justify-center h-screen bg-messenger-dark">
      <p className="text-white/60">Loading...</p>
    </div>
  );

  if (showDashboard) {
    return (
      <Suspense fallback={fallback}>
        <DashboardView onBack={() => setShowDashboard(false)} />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={fallback}>
      <StoryContainer
        onComplete={() => setShowDashboard(true)}
        onExit={() => navigate({ to: '/' })}
      />
    </Suspense>
  );
}
