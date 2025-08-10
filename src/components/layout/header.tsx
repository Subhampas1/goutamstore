
'use client'

import Link from 'next/link'
import { ShoppingCart, LogIn, LayoutDashboard, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/hooks/use-cart-store'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { ThemeSwitcher } from '../theme-switcher'

export function Header() {
  const router = useRouter()
  const store = useCartStore()

  // Hydration-safe state management
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const cartCount = isClient ? store.getCartCount() : 0;
  const isAuthenticated = isClient ? store.isAuthenticated : false;
  const userRole = isClient ? store.userRole : null;

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/khata', label: 'Khata' },
    { href: '/orders', label: 'My Orders', auth: true },
  ]
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex md:flex-1">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <svg width="32" height="32" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="40" y="60" width="120" height="100" rx="20" className="fill-primary"/>
              <path d="M60 60 A40 40 0 0 1 140 60" fill="none" className="stroke-primary" strokeWidth="12"/>
              <text x="100" y="130" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="80" fontWeight="bold" fill="white">G</text>
            </svg>
            <span className="font-bold font-headline text-lg hidden sm:inline-block">Goutam Store</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navLinks.map(link => {
               if (link.auth) {
                  return isAuthenticated && (
                    <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  )
               }
               return (
                <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
                  {link.label}
                </Link>
               )
            })}
             {isAuthenticated && userRole === 'admin' && (
                <Link href="/admin/dashboard" className="transition-colors hover:text-primary font-semibold text-primary">
                    Admin
                </Link>
              )}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="language-toggle" className="text-sm font-medium">EN</Label>
              <Switch id="language-toggle" checked={store.language === 'hi'} onCheckedChange={store.toggleLanguage} aria-label="Toggle language"/>
              <Label htmlFor="language-toggle" className="text-sm font-medium">HI</Label>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <ThemeSwitcher />
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center rounded-full p-0">
                      {cartCount}
                    </Badge>
                  )}
                  <span className="sr-only">Shopping Cart</span>
                </Link>
              </Button>
               <Button variant="ghost" size="icon" asChild>
                  <Link href="/profile">
                    <User className="h-5 w-5" />
                     <span className="sr-only">Profile</span>
                  </Link>
                </Button>
            </div>
            
            <div className="hidden md:block">
              {!isAuthenticated && isClient && (
                  <Button asChild className="hidden md:inline-flex">
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </Link>
                  </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
