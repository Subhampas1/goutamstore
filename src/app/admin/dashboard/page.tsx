
'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Users, Package, BookText } from "lucide-react"
import Link from "next/link"
import { useCartStore } from '@/hooks/use-cart-store'
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

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
        <p className="text-muted-foreground">Select a section to manage your store.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/khata">
            <Card className="hover:bg-muted/50 transition-colors h-full">
            <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-md">
                    <BookText className="h-6 w-6" />
                </div>
                <div>
                    <CardTitle>Khata Management</CardTitle>
                    <CardDescription>Track all orders and transactions.</CardDescription>
                </div>
            </CardHeader>
            </Card>
        </Link>
        <Link href="/admin/products">
            <Card className="hover:bg-muted/50 transition-colors h-full">
            <CardHeader className="flex flex-row items-center gap-4">
                 <div className="bg-primary/10 text-primary p-3 rounded-md">
                    <Package className="h-6 w-6" />
                </div>
                <div>
                    <CardTitle>Product Management</CardTitle>
                    <CardDescription>Add, edit, or remove products.</CardDescription>
                </div>
            </CardHeader>
            </Card>
        </Link>
        <Link href="/admin/users">
            <Card className="hover:bg-muted/50 transition-colors h-full">
            <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-md">
                    <Users className="h-6 w-6" />
                </div>
                <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage all users.</CardDescription>
                </div>
            </CardHeader>
            </Card>
        </Link>
      </div>
    </div>
  )
}
