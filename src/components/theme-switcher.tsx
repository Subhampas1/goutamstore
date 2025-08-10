
// src/components/theme-switcher.tsx
"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getButtonContent = () => {
    if (theme === 'light') {
      return <><Sun /> Light Mode</>
    }
    if (theme === 'dark') {
      return <><Moon/> Dark Mode</>
    }
    return <><Monitor /> System</>
  }

  if (!mounted) {
    return <Button variant="outline" disabled className="h-12 flex-1 rounded-full" />
  }

  return (
    <Button variant="outline" onClick={toggleTheme} aria-label="Toggle theme" className="flex-1 h-12 rounded-full">
      {getButtonContent()}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
