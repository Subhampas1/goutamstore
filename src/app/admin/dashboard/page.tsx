
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/hooks/use-cart-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db, auth } from '@/lib/firebase'
import { collection, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { ProductForm } from '@/components/products/product-form'
import type { Product } from '@/types'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Pencil, Trash2, PlusCircle } from 'lucide-react'
import { KhataManagement } from '@/app/admin/khata-management'

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  disabled: boolean;
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isAuthenticated, userRole } = useCartStore()
  const [isClient, setIsClient] = useState(false)
  
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const { toast } = useToast()
  const currentUserId = auth.currentUser?.uid

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient) {
      if (!isAuthenticated) {
        router.push('/login')
        return
      }
      if (userRole !== 'admin') {
        router.push('/')
        return
      }

      setLoading(true)
      // Fetch users
      const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as User));
        setUsers(usersList);
      }, (error) => {
        console.error("Error fetching users: ", error);
        toast({ title: "Error", description: "Failed to fetch users.", variant: "destructive" })
      });

      // Fetch products
      const productsUnsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
        const productsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
        setProducts(productsList);
        setLoading(false)
      }, (error) => {
        console.error("Error fetching products: ", error);
        toast({ title: "Error", description: "Failed to fetch products.", variant: "destructive" })
        setLoading(false)
      });

      return () => {
        usersUnsubscribe();
        productsUnsubscribe();
      }
    }
  }, [isAuthenticated, userRole, router, isClient, toast])

  const handleUserStatusToggle = async (userId: string, isDisabled: boolean) => {
    if (userId === currentUserId) {
        toast({ title: "Action Forbidden", description: "You cannot disable your own account.", variant: "destructive" })
        return
    }
    const userRef = doc(db, 'users', userId)
    try {
      await updateDoc(userRef, { disabled: isDisabled })
      toast({
        title: "Success",
        description: `User has been ${isDisabled ? 'disabled' : 'enabled'}.`
      })
    } catch (error) {
      console.error("Error updating user status: ", error);
      toast({ title: "Error", description: "Failed to update user status.", variant: "destructive" })
    }
  }

  const handleProductStatusToggle = async (productId: string, isAvailable: boolean) => {
    const productRef = doc(db, 'products', productId);
    try {
      await updateDoc(productRef, { available: isAvailable });
      toast({
        title: 'Success',
        description: `Product has been ${isAvailable ? 'enabled' : 'disabled'}.`,
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

  if (!isClient || !isAuthenticated || userRole !== 'admin') {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-14rem)]">
            <p>Loading or redirecting...</p>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        product={selectedProduct}
      />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Admin Dashboard</CardTitle>
            <CardDescription>Welcome to the admin panel.</CardDescription>
          </CardHeader>
        </Card>
        
        <KhataManagement />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>Add, edit, or remove products from your store.</CardDescription>
              </div>
              <Button onClick={handleAddProduct}><PlusCircle />Add Product</Button>
          </CardHeader>
          <CardContent>
             {loading ? <p>Loading products...</p> : (
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name.en}</TableCell>
                      <TableCell>₹{product.price.toFixed(2)}</TableCell>
                      <TableCell>
                         <Switch
                              id={`product-status-${product.id}`}
                              checked={product.available}
                              onCheckedChange={(checked) => handleProductStatusToggle(product.id, checked)}
                              aria-label="Toggle product status"
                            />
                      </TableCell>
                      <TableCell className="text-right space-x-2">
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
             )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View and manage all registered users.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading users...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Switch
                              id={`status-${user.id}`}
                              checked={!user.disabled}
                              onCheckedChange={(checked) => handleUserStatusToggle(user.id, !checked)}
                              disabled={user.id === currentUserId}
                              aria-label="Toggle user status"
                            />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
