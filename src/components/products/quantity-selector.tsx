
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Product } from '@/types'
import { useCartStore } from '@/hooks/use-cart-store'
import { useToast } from '@/hooks/use-toast'

interface QuantitySelectorProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  product: Product
}

export function QuantitySelector({ isOpen, setIsOpen, product }: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart, language } = useCartStore()
  const { toast } = useToast()

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value) && value >= 0) {
      setQuantity(value)
    } else if (e.target.value === '') {
      setQuantity(0)
    }
  }
  
  const handleAddToCart = () => {
    if (quantity > 0) {
      addToCart(product, quantity);
      toast({
        title: language === 'en' ? "Added to cart" : "कार्ट में जोड़ा गया",
        description: `${quantity}${product.unit} of ${product.name[language]} has been added.`,
      })
      setIsOpen(false)
      setQuantity(1) // Reset for next time
    } else {
      toast({
        title: language === 'en' ? "Invalid Quantity" : "अमान्य मात्रा",
        description: language === 'en' ? "Please enter a quantity greater than 0." : "कृपया 0 से अधिक मात्रा दर्ज करें।",
        variant: "destructive",
      })
    }
  }

  const getUnitString = (unit: Product['unit']) => {
    switch (unit) {
      case 'kg': return 'kilograms';
      case 'L': return 'liters';
      default: return 'items';
    }
  }

  const totalPrice = product.price * quantity;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) setQuantity(1) // Reset on close
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{product.name[language]}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative h-48 w-full rounded-md overflow-hidden">
             <Image src={product.image} alt={product.name.en} fill className="object-cover" data-ai-hint={product.dataAiHint}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-right">
              {language === 'en' ? `Quantity (${getUnitString(product.unit)})` : `मात्रा (${getUnitString(product.unit)})`}
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.05"
              min="0"
              value={quantity}
              onChange={handleQuantityChange}
              className="col-span-3"
            />
          </div>
          <div className="text-xl font-bold text-center text-primary">
            {language === 'en' ? 'Total Price: ' : 'कुल कीमत: '}₹{totalPrice.toFixed(2)}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddToCart} className="w-full">
            {language === 'en' ? 'Add to Cart' : 'कार्ट में डालें'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
