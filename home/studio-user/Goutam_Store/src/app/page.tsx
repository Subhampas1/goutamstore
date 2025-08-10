
'use client'

import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { HomePageGuts } from '../components/home-page-guts'


function HomePageLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
           <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


export default function Home() {

  return (
    <Suspense fallback={<HomePageLoading />}>
      <HomePageGuts />
    </Suspense>
  )
}
