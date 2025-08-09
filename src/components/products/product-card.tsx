
'use client'

import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/hooks/use-cart-store'
import type { Product } from '@/types'
import { ShoppingCart } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Badge } from '../ui/badge'
import { useState } from 'react'
import { QuantitySelector } from './quantity-selector'

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { language, addToCart } = useCartStore();
  const { toast } = useToast();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const handleAddToCart = () => {
    // For items sold by piece, add directly to cart
    if (product.unit === 'pc') {
      addToCart(product, 1);
      toast({
        title: language === 'en' ? "Added to cart" : "कार्ट में जोड़ा गया",
        description: language === 'en' ? `${product.name.en} has been added to your cart.` : `${product.name.hi} आपके कार्ट में जोड़ दिया गया है।`,
      })
    } else {
      // For items sold by weight/volume, open the quantity selector
      setIsSelectorOpen(true);
    }
  }
  
  const getUnitString = (unit: Product['unit']) => {
    switch (unit) {
      case 'kg': return '/ kg';
      case 'L': return '/ L';
      case 'pc': return '/ pc';
      default: return '';
    }
  }

  return (
    <>
      <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="p-0 border-b">
          <div className="aspect-[4/3] relative">
            <Image
              src={product.image}
              alt={product.name.en}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              data-ai-hint={product.dataAiHint}
            />
            {!product.available && (
                <Badge variant="destructive" className="absolute top-2 right-2">Out of Stock</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-1 md:p-3 flex-1 flex flex-col justify-between space-y-1">
          <CardTitle className="text-sm md:text-base font-headline line-clamp-2 flex-grow">{product.name[language]}</CardTitle>
          <p className="text-base md:text-lg font-semibold font-headline text-primary">
            ₹{product.price.toFixed(2)}
            {product.unit && <span className="text-sm font-normal text-muted-foreground">{getUnitString(product.unit)}</span>}
          </p>
        </CardContent>
        <CardFooter className="p-1 md:p-3 pt-0">
          <Button className="w-full" size="sm" onClick={handleAddToCart} disabled={!product.available}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            <span>{language === 'en' ? 'Add' : 'जोड़ें'}</span>
          </Button>
        </CardFooter>
      </Card>
      {product.unit !== 'pc' && (
        <QuantitySelector 
          isOpen={isSelectorOpen}
          setIsOpen={setIsSelectorOpen}
          product={product}
        />
      )}
    </>
  )
}
