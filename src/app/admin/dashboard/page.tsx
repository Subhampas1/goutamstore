
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/hooks/use-cart-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { db, auth } from '@/lib/firebase'
import { collection, doc, updateDoc, deleteDoc, onSnapshot, getDoc } from 'firebase/firestore'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { ProductForm } from '@/components/products/product-form'
import type { Product } from '@/types'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Pencil, Trash2, PlusCircle, Search } from 'lucide-react'
import { KhataManagement } from '@/app/admin/khata-management'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { Input } from '@/components/ui/input'

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  disabled: boolean;
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isAuthenticated } = useCartStore()
  const [isClient, setIsClient] = useState(false)
  
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])

  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [productSearchTerm, setProductSearchTerm] = useState('');

  const { toast } = useToast()
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        setCurrentUserId(user.uid);

        // Fetch user's role directly to determine access
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setHasAccess(true);

          // User is an admin, proceed to fetch data
          const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(usersList);
          });

          const productsUnsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
            const productsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(productsList);
          });
          
          setLoading(false);

          return () => {
            usersUnsubscribe();
            productsUnsubscribe();
          };
        } else {
          // Not an admin
          setHasAccess(false);
          setLoading(false);
          toast({ title: "Access Denied", description: "You must be an admin to view this page.", variant: "destructive" });
          router.push('/');
        }
      } else {
        // No user is signed in
        setHasAccess(false);
        setLoading(false);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [isClient, router, toast]);

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

  if (!isClient || loading || hasAccess === null) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-14rem)]">
            <p>Loading or redirecting...</p>
        </div>
    )
  }
  
  if (!hasAccess) {
     return (
        <div className="flex items-center justify-center min-h-[calc(100vh-14rem)]">
            <p>Access Denied. Redirecting...</p>
        </div>
    )
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <ProductForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        product={selectedProduct}
        categories={productCategories}
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
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <CardTitle>Product Management</CardTitle>
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
             {loading ? <p>Loading products...</p> : (
               <div className="overflow-x-auto">
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
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium whitespace-nowrap">{product.name.en}</TableCell>
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
               </div>
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
              <div className="overflow-x-auto">
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
                        <TableCell className="font-medium whitespace-nowrap">{user.name}</TableCell>
                        <TableCell className="whitespace-nowrap">{user.email}</TableCell>
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
