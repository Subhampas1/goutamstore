
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db } from '@/lib/firebase'
import { collection, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { ProductForm } from '@/components/products/product-form'
import type { Product } from '@/types'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Pencil, Trash2, PlusCircle, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productSearchTerm, setProductSearchTerm] = useState('');

  const { toast } = useToast()

  useEffect(() => {
    setLoading(true);
    const productsUnsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
        const productsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(productsList);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
        toast({ title: "Error", description: "Failed to load products.", variant: "destructive" });
    });

    return () => productsUnsubscribe();
  }, [toast]);

  const productCategories = useMemo(() => {
    return [...new Set(products.map(p => p.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!productSearchTerm) {
      return products;
    }
    const lowercasedTerm = productSearchTerm.toLowerCase();
    return products.filter(product => 
        product.name.en.toLowerCase().includes(lowercasedTerm) ||
        product.name.hi.toLowerCase().includes(lowercasedTerm) ||
        product.category.toLowerCase().includes(lowercasedTerm)
    );
  }, [products, productSearchTerm]);

  const handleProductStatusToggle = async (productId: string, isAvailable: boolean) => {
    const productRef = doc(db, 'products', productId);
    try {
      await updateDoc(productRef, { available: isAvailable });
      toast({
        title: 'Success',
        description: `Product has been ${isAvailable ? 'made available' : 'made unavailable'}.`,
      });
    } catch (error) {
      console.error('Error updating product status: ', error);
      toast({ title: 'Error', description: 'Failed to update product status.', variant: 'destructive' });
    }
  };


  const handleAddProduct = () => {
    setSelectedProduct(null)
    setIsFormOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsFormOpen(true)
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, "products", productId));
      toast({
        title: "Product Deleted",
        description: "The product has been successfully removed.",
      });
    } catch (error) {
      console.error("Error deleting product: ", error);
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <>
        <ProductForm
            isOpen={isFormOpen}
            setIsOpen={setIsFormOpen}
            product={selectedProduct}
            categories={productCategories}
        />
        <Card className="mt-4">
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                    <CardTitle className="font-headline text-2xl">Product Details</CardTitle>
                    <CardDescription>Add, edit, or remove products from your store.</CardDescription>
                </div>
                <div className="flex w-full md:w-auto items-center gap-2">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by name or category..."
                            value={productSearchTerm}
                            onChange={(e) => setProductSearchTerm(e.target.value)}
                            className="pl-10 w-full"
                        />
                    </div>
                    <Button onClick={handleAddProduct}><PlusCircle />Add Product</Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium whitespace-nowrap">
                                    <div>{product.name.en}</div>
                                    <div className="text-xs text-muted-foreground">{product.name.hi}</div>
                                </TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>₹{product.price.toFixed(2)}</TableCell>
                                <TableCell>
                                <Switch
                                        id={`product-status-${product.id}`}
                                        checked={product.available}
                                        onCheckedChange={(checked) => handleProductStatusToggle(product.id, checked)}
                                        aria-label="Toggle product status"
                                    />
                                </TableCell>
                                <TableCell className="text-right space-x-2 whitespace-nowrap">
                                    <Button variant="outline" size="icon" onClick={() => handleEditProduct(product)}>
                                    <Pencil className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                    </Button>
                                    <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="icon">
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Delete</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the product.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                                            Delete
                                        </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 </div>
                )}
            </CardContent>
        </Card>
    </>
  )
}
