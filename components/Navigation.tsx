'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavigationProps {
  siteConfig?: {
    name: string
  }
}

export default function Navigation({ siteConfig }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { id: '/', label: '首页', icon: 'fas fa-home' },
    { id: '/about', label: '关于', icon: 'fas fa-user' },
    { id: '/projects', label: '项目', icon: 'fas fa-code' },
    { id: '/notes', label: '笔记', icon: 'fas fa-book' },
    { id: '/articles', label: '随笔', icon: 'fas fa-pen' }
  ]

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="nav-container">
        <Link href="/" className="nav-brand">
          <i className="fas fa-terminal" />
          {siteConfig?.name || 'DevPortfolio'}
        </Link>
        <ul className="nav-menu">
          {navItems.map(item => (
            <li key={item.id}>
              <Link
                href={item.id}
                className={`nav-link ${pathname === item.id ? 'active' : ''}`}
              >
                <i className={item.icon} />
                {` ${item.label}`}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}