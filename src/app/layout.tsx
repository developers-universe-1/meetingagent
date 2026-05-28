import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'MeetingAgent — AI-Powered Sales Observability',
  description: 'Open-source AI agent that reads sales calls, updates your pipeline, drafts follow-ups, and coaches your reps.',
  openGraph: {
    title: 'MeetingAgent — AI-Powered Sales Observability',
    description: 'Open-source AI agent that reads sales calls, updates your pipeline, drafts follow-ups, and coaches your reps.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MeetingAgent — AI-Powered Sales Observability',
    description: 'Open-source AI agent that reads sales calls, updates your pipeline, drafts follow-ups, and coaches your reps.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#18181b',
              color: '#e4e4e7',
              border: '1px solid #27272a',
            },
          }}
        />
      </body>
    </html>
  )
}
