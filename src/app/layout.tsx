import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Contributist',
  description: 'Design and customize your contribution graphs instantly',
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
