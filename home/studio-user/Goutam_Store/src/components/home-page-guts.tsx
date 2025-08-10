
'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from '@/components/products/product-card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, ListFilter } from 'lucide-react'
import { useCartStore } from '@/hooks/use-cart-store'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import type { Product } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { useSearchParams, useRouter } from 'next/navigation'

export function HomePageGuts() {
  const language = useCartStore((state) => state.language)
  const [products, setProducts] = useState<Product[]>([])
  const [productCategories, setProductCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const categoryQuery = searchParams.get('category')
    if (categoryQuery) {
      setCategory(categoryQuery)
      // Optional: remove the query param from URL after setting state
      // router.replace('/', {scroll: false});
    }
  }, [searchParams, router])


  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(productsData);

      const categories = [...new Set(productsData.map(p => p.category))];
      setProductCategories(categories);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter(product => {
    if (!product.available) {
      return false;
    }
    const name = product.name[language] || product.name.en;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const matchesSearch = name.toLowerCase().includes(lowerCaseSearchTerm) ||
                          product.category.toLowerCase().includes(lowerCaseSearchTerm);

    const matchesCategory = category === 'all' || product.category === category;

    return matchesSearch && matchesCategory;
  })

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="mb-8 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder={language === 'en' ? 'Search by name or category...' : 'नाम या श्रेणी से खोजें...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        {/* Mobile Filter Sheet */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <ListFilter className="h-5 w-5" />
                 <span className="sr-only">Filter</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto">
                <SheetHeader>
                  <SheetTitle>Filter by Category</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                    <RadioGroup value={category} onValueChange={(value) => {
                        setCategory(value)
                        setIsSheetOpen(false)
                    }}>
                        <div className="flex items-center space-x-2 py-2">
                            <RadioGroupItem value="all" id="cat-all" />
                            <Label htmlFor="cat-all" className="text-base flex-1">{language === 'en' ? 'All Categories' : 'सभी श्रेणियाँ'}</Label>
                        </div>
                        {productCategories.map(cat => (
                            <div key={cat} className="flex items-center space-x-2 py-2">
                                <RadioGroupItem value={cat} id={`cat-${cat}`} />
                                <Label htmlFor={`cat-${cat}`} className="text-base flex-1">{cat}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Category Select */}
        <div className="hidden md:block">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={language === 'en' ? 'All Categories' : 'सभी श्रेणियाँ'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'en' ? 'All Categories' : 'सभी श्रेणियाँ'}</SelectItem>
                {productCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
      </div>

      {loading ? (
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
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

