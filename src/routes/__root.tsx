import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { ChatDataProvider } from '@/contexts/ChatDataContext';
import { Footer } from '@/components/ui/Footer';
import '../index.css';

export const Route = createRootRouteWithContext()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <ChatDataProvider>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
    </ChatDataProvider>
  );
}
