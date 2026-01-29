import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "King Julien and Mort's World Cuisine Tour",
  description: 'Track your culinary adventures around the globe with an interactive map and 3D globe',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: "Cuisine Tour",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    title: "King Julien and Mort's World Cuisine Tour",
    description: 'Track your culinary adventures around the globe',
    siteName: 'Cuisine Tour',
  },
  twitter: {
    card: 'summary_large_image',
    title: "King Julien and Mort's World Cuisine Tour",
    description: 'Track your culinary adventures around the globe',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#7c3aed',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* PWA Primary Meta Tags */}
        <meta name="application-name" content="Cuisine Tour" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cuisine Tour" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#7c3aed" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Favicons */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-152x152.png" />
        
        {/* iOS Splash Screens */}
        <link
          rel="apple-touch-startup-image"
          href="/icons/icon-512x512.png"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
        />
        
        {/* Android Chrome Meta */}
        <meta name="theme-color" content="#7c3aed" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
