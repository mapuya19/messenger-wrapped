import type { Metadata } from 'next'
import './globals.css'
import { ChatDataProvider } from '@/contexts/ChatDataContext'
import { Footer } from '@/components/ui/Footer'

export const metadata: Metadata = {
  title: 'Messenger Wrapped',
  description: 'Explore your Facebook Messenger chat history, inspired by Spotify Wrapped',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <ChatDataProvider>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </ChatDataProvider>
      </body>
    </html>
  )
}

