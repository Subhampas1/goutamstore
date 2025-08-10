
'use client'

import { useState, useEffect, useMemo } from 'react'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import type { Product } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { List } from 'lucide-react'
import { useCartStore } from '@/hooks/use-cart-store'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/components/products/product-card'

export default function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const language = useCartStore((state) => state.language)

  const productCategories = useMemo(() => {
    const categories = [...new Set(products.map(p => p.category))];
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
    return categories;
  }, [products, selectedCategory]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsData);
      
      const categories = [...new Set(productsData.map(p => p.category))];
      if (categories.length > 0 && !selectedCategory) {
        setSelectedCategory(categories[0]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedCategory]);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return products.filter(p => p.category === selectedCategory && p.available);
  }, [products, selectedCategory]);


  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)]">
        <div className="w-1/4 border-r overflow-y-auto no-scrollbar p-2 space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
        <div className="w-3/4 p-4">
           <Skeleton className="h-6 w-1/3 mb-4" />
           <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
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
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Left Panel: Categories */}
      <div className="w-1/4 border-r overflow-y-auto no-scrollbar">
        <nav className="flex flex-col items-center p-1 space-y-1">
          {productCategories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "flex flex-col items-center justify-center text-center p-2 w-full rounded-lg transition-colors",
                selectedCategory === category
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'hover:bg-muted/50'
              )}
            >
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-1">
                 <List className="h-8 w-8 text-muted-foreground" />
              </div>
              <span className="text-xs leading-tight break-all">{category}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Right Panel: Products */}
      <div className="w-3/4 overflow-y-auto">
         {selectedCategory ? (
            <div className="p-2 md:p-4">
                <h2 className="text-xl md:text-2xl font-bold font-headline mb-4">{selectedCategory}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
                {filteredProducts.length === 0 && (
                     <div className="text-center py-10">
                        <p className="text-muted-foreground">No products found in this category.</p>
                    </div>
                )}
            </div>
         ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Select a category to see products.</p>
            </div>
         )}
      </div>
    </div>
  )
}
