/**
 * Root Layout
 * 
 * This wraps all pages in the application.
 * Preserves existing CSS from the static site.
 */

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Research Workspace',
  description: 'Notion-like research management system',
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
