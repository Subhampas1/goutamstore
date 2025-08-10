
'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/hooks/use-cart-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { db, auth } from '@/lib/firebase'
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore'
import type { Order } from '@/types'
import { onAuthStateChanged } from 'firebase/auth'

export default function OrdersPage() {
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
      const unsubscribe = onAuthStateChanged(auth, user => {
        if (user) {
          setLoading(true);
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
                date: (data.date as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
              } as Order;
            });
            ordersList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setOrders(ordersList);
            setLoading(false);
          }, (error) => {
            console.error("Error fetching orders: ", error);
            setLoading(false);
          });
          return () => unsubFromOrders();
        } else {
          setOrders([]);
          setLoading(false);
          router.push('/login');
        }
      });
      return () => unsubscribe();
    }
  }, [isClient, router]);

  const getStatusVariant = (status: Order['status']): "destructive" | "secondary" | "default" | "outline" => {
    switch (status) {
      case 'Paid':
        return 'default'
      case 'Delivered':
        return 'default'
      case 'Shipped':
        return 'secondary'
      case 'Pending':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  if (!isClient || loading) {
    return <div className="container mx-auto px-4 py-8 min-h-[calc(100vh-14rem)]">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">{language === 'en' ? 'Order History' : 'आर्डर इतिहास'}</CardTitle>
          <CardDescription>{language === 'en' ? 'View your past orders.' : 'अपने पिछले आर्डर देखें।'}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="text-center py-8">Loading orders...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'en' ? 'Order ID' : 'आर्डर आईडी'}</TableHead>
                  <TableHead>{language === 'en' ? 'Date' : 'दिनांक'}</TableHead>
                  <TableHead>{language === 'en' ? 'Status' : 'स्थिति'}</TableHead>
                  <TableHead className="text-right">{language === 'en' ? 'Total' : 'कुल'}</TableHead>
                  <TableHead className="text-right">{language === 'en' ? 'Actions' : 'कार्रवाइयाँ'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length > 0 ? orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderId}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/invoice/${order.id}`}>
                          {language === 'en' ? 'View Invoice' : 'इनवॉइस देखें'}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {language === 'en' ? 'You have no orders yet.' : 'आपके पास अभी तक कोई आर्डर नहीं है।'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
