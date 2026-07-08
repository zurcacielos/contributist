import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Contributist | GitHub Contribution Graph Generator & Painter',
  description: 'Contributist is an interactive visual tool to paint custom pixel art on your GitHub contribution graph. Generate and customize your git commit history grid easily.',
  keywords: [
    'github contribution generator',
    'github contribution graph',
    'github contribution painter',
    'contributist',
    'git green grass generator',
    'github profile customizer',
    'commit painter'
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
