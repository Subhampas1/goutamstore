
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Package, BookText } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { KhataManagement } from "@/components/admin/khata-management"
import { ProductManagement } from "@/components/admin/product-management"
import { UserManagement } from "@/components/admin/user-management"

export default function AdminDashboardPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [hasAccess, setHasAccess] = useState<boolean | null>(null)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])
    
    useEffect(() => {
        if (!isClient) return;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            setLoading(true);
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists() && userDoc.data().role === 'admin') {
                setHasAccess(true);
                setLoading(false);
            } else {
                setHasAccess(false);
                setLoading(false);
                toast({ title: "Access Denied", description: "You must be an admin to view this page.", variant: "destructive" });
                router.push('/');
            }
        } else {
            setHasAccess(false);
            setLoading(false);
            router.push('/login');
        }
        });

        return () => unsubscribe();
  }, [isClient, router, toast]);

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
      <div className="mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your store's orders, products, and users.</p>
      </div>
      <Tabs defaultValue="khata" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="khata"><BookText />Khata Management</TabsTrigger>
          <TabsTrigger value="products"><Package />Product Management</TabsTrigger>
          <TabsTrigger value="users"><Users />User Management</TabsTrigger>
        </TabsList>
        <TabsContent value="khata">
            <KhataManagement />
        </TabsContent>
        <TabsContent value="products">
            <ProductManagement />
        </TabsContent>
        <TabsContent value="users">
            <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
