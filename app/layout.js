import './globals.css'
import { Inter } from 'next/font/google'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'
import PWAMeta from '@/components/PWAMeta'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "King Julien and Mort's World Cuisine Tour",
  description: 'Track your culinary adventures around the globe with an interactive map and 3D globe',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "KJ & Mort's Tour",
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#7c3aed',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PWAMeta />
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  )
}