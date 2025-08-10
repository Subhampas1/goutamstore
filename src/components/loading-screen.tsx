
'use client'

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[200] flex animate-fadeOut items-center justify-center bg-background animation-delay-5000">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex animate-pulse items-center justify-center gap-4">
            <svg width="64" height="64" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="60" width="120" height="100" rx="20" className="fill-primary"/>
            <path d="M60 60 A40 40 0 0 1 140 60" fill="none" className="stroke-primary" strokeWidth="12"/>
            <text x="100" y="130" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="80" fontWeight="bold" fill="white">G</text>
            </svg>
            <span className="font-headline text-4xl font-bold">Goutam Store</span>
        </div>
        <div className="mt-4 text-center">
          <p className="font-headline text-2xl font-semibold overflow-hidden whitespace-nowrap border-r-4 border-r-primary animate-typing">
            Welcome back!
          </p>
        </div>
      </div>
    </div>
  )
}

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}
