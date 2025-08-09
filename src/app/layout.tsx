
'use client'

import './globals.css'
import { Header } from '@/components/layout/header'
import { Toaster } from '@/components/ui/toaster'
import { Footer } from '@/components/layout/footer'
import { BottomNav } from '@/components/layout/bottom-nav'
import { ThemeProvider } from '@/components/theme-provider'
import { LoadingScreen } from '@/components/loading-screen'
import { useEffect, useState } from 'react'


function AppBody({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("hasVisited")) {
      setShowLoader(false);
    } else {
      sessionStorage.setItem("hasVisited", "true");
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 1000); // Loader will show for 1 second
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {showLoader && <LoadingScreen />}
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <Footer />
        <BottomNav />
      </div>
      <Toaster />
    </ThemeProvider>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Goutam Store</title>
        <meta name="description" content="A modern e-commerce store by Goutam" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AppBody>{children}</AppBody>
      </body>
    </html>
  )
}
