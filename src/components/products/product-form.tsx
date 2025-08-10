
'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { db } from '@/lib/firebase'
import { collection, addDoc, doc, setDoc } from 'firebase/firestore'
import type { Product } from '@/types'
import { useEffect, useState } from 'react'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Switch } from '../ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const productSchema = z.object({
  name_en: z.string().min(2, 'English name must be at least 2 characters.'),
  name_hi: z.string().min(2, 'Hindi name must be at least 2 characters.'),
  description_en: z.string().optional(),
  description_hi: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  category: z.string().min(1, 'Category is required.'),
  unit: z.enum(['kg', 'L', 'pc'], { required_error: 'You must select a unit type.' }),
  image: z.string().optional(),
  available: z.boolean().default(true),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  product?: Product | null
  categories: string[]
}

export function ProductForm({ isOpen, setIsOpen, product, categories }: ProductFormProps) {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name_en: '',
      name_hi: '',
      description_en: '',
      description_hi: '',
      price: 0,
      category: '',
      unit: 'pc',
      image: '',
      available: true,
    },
  })

  useEffect(() => {
    if (isOpen) {
        if (product) {
        form.reset({
            name_en: product.name.en,
            name_hi: product.name.hi,
            description_en: product.description?.en || '',
            description_hi: product.description?.hi || '',
            price: product.price,
            category: product.category,
            unit: product.unit || 'pc',
            image: product.image,
            available: product.available,
        })
        } else {
        form.reset({
            name_en: '',
            name_hi: '',
            description_en: '',
            description_hi: '',
            price: 0,
            category: '',
            unit: 'pc',
            image: '',
            available: true,
        })
        }
        setIsSaving(false)
    }
  }, [product, form, isOpen])

  async function onSubmit(values: ProductFormValues) {
    try {
      setIsSaving(true)
      
      const imageUrl = values.image || 'https://placehold.co/600x400.png';

      const productData = {
        name: {
          en: values.name_en,
          hi: values.name_hi,
        },
        description: {
            en: values.description_en || '',
            hi: values.description_hi || ''
        },
        price: values.price,
        category: values.category,
        image: imageUrl,
        unit: values.unit,
        available: values.available,
        dataAiHint: '' // This field is no longer used but kept for schema consistency
      }
      
      if (product) {
        const productRef = doc(db, 'products', product.id)
        await setDoc(productRef, productData, { merge: true });
        toast({ title: 'Success', description: 'Product updated successfully.' })
      } else {
        await addDoc(collection(db, 'products'), productData)
        toast({ title: 'Success', description: 'Product added successfully.' })
      }
      setIsOpen(false)

    } catch (error) {
      console.error('Error saving product:', error)
      toast({
        title: 'Error',
        description: 'Failed to save product.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
           <DialogDescription>
            {product ? 'Update the details of the product.' : 'Fill in the details for the new product.'}
           </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
                control={form.control}
                name="name_en"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Product Name (EN)</FormLabel>
                    <FormControl><Input placeholder="e.g., Whole Wheat Flour" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
                control={form.control}
                name="name_hi"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Product Name (HI)</FormLabel>
                    <FormControl><Input placeholder="e.g., साबुत गेहूं का आटा" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Category</FormLabel>
                   <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value || "Select or create a category"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                       <Command>
                        <CommandInput
                          placeholder="Search or create category..."
                          onKeyDown={(e) => {
                             if (e.key === 'Enter') {
                              e.preventDefault();
                              const newCategoryValue = e.currentTarget.value;
                              if (newCategoryValue && !categories.find(cat => cat.toLowerCase() === newCategoryValue.toLowerCase())) {
                                form.setValue("category", newCategoryValue);
                                setIsPopoverOpen(false);
                              }
                            }
                          }}
                        />
                        <CommandList>
                            <CommandEmpty>No category found. Press Enter to create.</CommandEmpty>
                            <CommandGroup>
                            {categories.map((category) => (
                                <CommandItem
                                value={category}
                                key={category}
                                onSelect={() => {
                                    form.setValue("category", category)
                                    setIsPopoverOpen(false)
                                }}
                                >
                                <Check
                                    className={cn(
                                    "mr-2 h-4 w-4",
                                    category === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                />
                                {category}
                                </CommandItem>
                            ))}
                            </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select an existing category or type a new one and press Enter.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Unit Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="pc" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            By Piece
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="kg" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            By Weight (kg)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="L" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            By Volume (L)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Available</FormLabel>
                        <FormDescription>
                          Is this product available for purchase?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
             <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Product Image Link (Optional)</FormLabel>
                    <FormControl>
                        <Input 
                            placeholder="https://drive.google.com/uc?export=view&id=..."
                            {...field}
                         />
                    </FormControl>
                    <FormDescription>
                        Paste the direct Google Drive image link here. Leave blank for a default placeholder.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Product'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

    