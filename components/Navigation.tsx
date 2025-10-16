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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    // 初始检查
    checkMobile()
    
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const navItems = [
    { id: '/', label: '首页', icon: 'fas fa-home' },
    { id: '/about', label: '关于', icon: 'fas fa-user' },
    { id: '/projects', label: '项目', icon: 'fas fa-code' },
    { id: '/notes', label: '笔记', icon: 'fas fa-book' },
    { id: '/articles', label: '随笔', icon: 'fas fa-pen' }
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="nav-container">
        <Link href="/" className="nav-brand" onClick={closeMobileMenu}>
          <i className="fas fa-terminal" />
          {siteConfig?.name || 'DevPortfolio'}
        </Link>
        
        {isMobile && (
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`} />
          </button>
        )}
        
          <ul className={`nav-menu ${isMobile ? (isMobileMenuOpen ? 'mobile-open' : 'mobile-closed') : ''}`}>
          {navItems.map(item => (
            <li key={item.id}>
              <Link
                href={item.id}
                className={`nav-link ${pathname === item.id ? 'active' : ''}`}
                onClick={closeMobileMenu}
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