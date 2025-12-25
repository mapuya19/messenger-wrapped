import type { Metadata } from 'next'
import './globals.css'
import { ChatDataProvider } from '@/context/ChatDataContext'

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
      <body>
        <ChatDataProvider>
          {children}
        </ChatDataProvider>
      </body>
    </html>
  )
}

