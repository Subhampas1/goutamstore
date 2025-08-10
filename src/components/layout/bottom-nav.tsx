
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookText, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/hooks/use-cart-store'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'

export function BottomNav() {
  const pathname = usePathname()
  const store = useCartStore()

  // Hydration-safe state management
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const cartCount = isClient ? store.getCartCount() : 0;
  
  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/khata', label: 'Khata', icon: BookText },
    { href: '/cart', label: 'Cart', icon: ShoppingCart },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t md:hidden">
      <div className="flex justify-around h-16">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center text-center px-2 w-full transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              )}
            >
              <div className="relative">
                <Icon className="h-6 w-6" />
                {href === '/cart' && cartCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-3 h-5 w-5 justify-center rounded-full p-0 text-xs">
                    {cartCount}
                  </Badge>
                )}
              </div>
              <span className="text-xs mt-1">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
