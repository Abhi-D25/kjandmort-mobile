'use client'

import { useEffect } from 'react'

export default function PWAMeta() {
  useEffect(() => {
    // Add PWA-specific meta tags that aren't fully supported by Next.js metadata API
    const addMetaTag = (name, content, attribute = 'name') => {
      if (!document.querySelector(`meta[${attribute}="${name}"]`)) {
        const meta = document.createElement('meta')
        meta.setAttribute(attribute, name)
        meta.setAttribute('content', content)
        document.head.appendChild(meta)
      }
    }

    const addLinkTag = (rel, href) => {
      if (!document.querySelector(`link[rel="${rel}"]`)) {
        const link = document.createElement('link')
        link.setAttribute('rel', rel)
        link.setAttribute('href', href)
        document.head.appendChild(link)
      }
    }

    // Add manifest link
    addLinkTag('manifest', '/manifest.json')

    // Add Apple-specific meta tags
    addMetaTag('apple-mobile-web-app-capable', 'yes')
    addMetaTag('apple-mobile-web-app-status-bar-style', 'default')
    addMetaTag('apple-mobile-web-app-title', "KJ & Mort's Tour")
    addLinkTag('apple-touch-icon', '/icons/apple-touch-icon.png')

    // Add other PWA meta tags
    addMetaTag('mobile-web-app-capable', 'yes')
    addMetaTag('msapplication-TileColor', '#7c3aed')
    addMetaTag('msapplication-TileImage', '/icons/icon-144x144.png')
  }, [])

  return null
}
