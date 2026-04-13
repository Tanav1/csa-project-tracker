import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CSA Efficiency Dashboard',
  description: 'Savvy Wealth — CSA automation use case tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
