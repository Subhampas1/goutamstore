// src/components/theme-switcher.tsx
"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

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

  if (!mounted) {
    return <Button variant="ghost" size="icon" disabled className="h-10 w-10" />
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'light' && <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />}
      {theme === 'dark' && <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />}
      {theme === 'system' && <Monitor className="h-[1.2rem] w-[1.2rem] transition-all" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
