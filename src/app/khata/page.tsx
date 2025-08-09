
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/hooks/use-cart-store'
import { db, auth } from '@/lib/firebase'
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import type { Order } from '@/types'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { PackageOpen } from 'lucide-react'

export default function KhataPage() {
  const router = useRouter()
  const { isAuthenticated, language } = useCartStore()
  const [isClient, setIsClient] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsClient(true)
  }, [])
  
  useEffect(() => {
    if (isClient) {
      if (!isAuthenticated) {
        router.push('/login')
        return
      }

      const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
          setLoading(true)
          const q = query(
            collection(db, 'orders'), 
            where('userId', '==', user.uid)
          );

          const unsubFromOrders = onSnapshot(q, (snapshot) => {
            const ordersList = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                ...data,
                id: doc.id,
                // Convert Firestore Timestamp to JS Date string
                date: (data.date as Timestamp)?.toDate().toISOString() || new Date().toISOString()
              } as Order;
            });
            // Sort by date on the client
            ordersList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setOrders(ordersList)
            setLoading(false)
          }, (error) => {
            console.error("Error fetching orders: ", error);
            setLoading(false);
          });
          return () => unsubFromOrders();
        } else {
          setOrders([])
          setLoading(false)
        }
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated, router, isClient])


  if (!isClient || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
              <CardContent><Skeleton className="h-20 w-full" /></CardContent>
              <CardFooter><Skeleton className="h-10 w-24 ml-auto" /></CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold">{language === 'en' ? 'Khata (Ledger)' : 'खाता (लेजर)'}</h1>
        <p className="text-muted-foreground">{language === 'en' ? 'Your complete transaction history.' : 'आपका पूरा लेनदेन इतिहास।'}</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
            <PackageOpen className="mx-auto h-16 w-16 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">{language === 'en' ? 'No Transactions Yet' : 'अभी तक कोई लेनदेन नहीं'}</h2>
            <p className="mt-2 text-muted-foreground">{language === 'en' ? 'Your purchased items will appear here.' : 'आपकी खरीदी गई वस्तुएं यहां दिखाई देंगी।'}</p>
            <Button asChild className="mt-6">
                <Link href="/">{language === 'en' ? 'Start Shopping' : 'खरीदारी शुरू करें'}</Link>
            </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {language === 'en' ? `Order ID: ${order.orderId}` : `ऑर्डर आईडी: ${order.orderId}`}
                    </CardTitle>
                    <CardDescription>
                      {language === 'en' ? `Placed on: ${new Date(order.date).toLocaleDateString()}` : `रखा गया: ${new Date(order.date).toLocaleDateString()}`}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                      <p className="font-bold text-lg">₹{order.total.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{order.status}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold mb-2">{language === 'en' ? 'Items Purchased' : 'खरीदी गई वस्तुएं'}</h4>
                <Separator className="mb-2"/>
                <ul className="space-y-2">
                  {order.items.map(item => (
                    <li key={item.product.id} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{item.product.name[language]} x {item.quantity}{item.product.unit}</span>
                      <span className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="justify-end">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/invoice/${order.id}`}>{language === 'en' ? 'View Invoice' : 'इनवॉइस देखें'}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
