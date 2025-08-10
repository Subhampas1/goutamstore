
'use client'

import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import type { Product } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { List } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/hooks/use-cart-store'

export default function CategoriesPage() {
  const [productCategories, setProductCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const language = useCartStore((state) => state.language)

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      const categories = [...new Set(productsData.map(p => p.category))];
      setProductCategories(categories);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">{language === 'en' ? 'Product Categories' : 'उत्पाद श्रेणियाँ'}</h1>
        <p className="text-muted-foreground">{language === 'en' ? 'Browse products by category.' : 'श्रेणी के अनुसार उत्पाद ब्राउज़ करें।'}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {productCategories.map(category => (
            <Link href={`/?category=${encodeURIComponent(category)}`} key={category}>
              <Card className="hover:shadow-lg transition-shadow h-full flex items-center justify-center p-4">
                <CardContent className="p-0 text-center">
                  <List className="mx-auto h-8 w-8 text-primary mb-2" />
                  <p className="font-semibold text-center">{category}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
