
'use client'

import { useEffect, useState } from 'react'
import { notFound, useParams } from 'next/navigation'
import { useCartStore } from '@/hooks/use-cart-store'
import { db } from '@/lib/firebase'
import { doc, getDoc, Timestamp } from 'firebase/firestore'
import type { Order, UserProfile } from '@/types'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function InvoicePage() {
  const params = useParams()
  const id = params.id as string
  const language = useCartStore(state => state.language)
  const [order, setOrder] = useState<Order | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrderAndUser = async () => {
      setLoading(true)
      const docRef = doc(db, 'orders', id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const orderData = docSnap.data() as Omit<Order, 'id' | 'date'> & { date: Timestamp };
        const orderPayload = {
          ...orderData,
          id: docSnap.id,
          date: orderData.date.toDate().toISOString(),
        } as Order;
        setOrder(orderPayload);
        
        if (orderData.userId) {
          const userRef = doc(db, 'users', orderData.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUser(userSnap.data() as UserProfile);
          }
        }

      } else {
        notFound()
      }
      setLoading(false)
    }

    if (id) {
      fetchOrderAndUser()
    }
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-1/4 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    )
  }
  
  if (!order) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 print:py-0">
      <Card className="max-w-4xl mx-auto print:shadow-none print:border-none">
        <CardHeader className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <svg width="64" height="64" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="40" y="60" width="120" height="100" rx="20" fill="#1676F3"/>
              <path d="M60 60 A40 40 0 0 1 140 60" fill="none" stroke="#1676F3" strokeWidth="12"/>
              <text x="100" y="130" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="80" fontWeight="bold" fill="white">G</text>
            </svg>
            <div>
              <CardTitle className="font-headline text-3xl">{language === 'en' ? 'Invoice' : 'इनवॉइस'}</CardTitle>
              <CardDescription>Order ID: {order.orderId}</CardDescription>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-bold font-headline">Goutam Store</p>
            <p className="text-sm text-muted-foreground">Khairidih, Giridih, 825324</p>
            <p className="text-sm text-muted-foreground">contact@goutam.store</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold mb-2">{language === 'en' ? 'Billed To' : 'बिल किया गया'}</h3>
              {user ? (
                <>
                  <p>{user.name}</p>
                  {user.address && <p className="text-muted-foreground text-sm">{user.address}</p>}
                  <p>{user.email}</p>
                </>
              ) : (
                <p>Guest User</p>
              )}
            </div>
            <div className="text-right">
              <p><span className="font-semibold">{language === 'en' ? 'Invoice Date:' : 'इनवॉइस दिनांक:'}</span> {new Date(order.date).toLocaleDateString()}</p>
              <p><span className="font-semibold">{language === 'en' ? 'Due Date:' : 'देय तिथि:'}</span> {new Date(order.date).toLocaleDateString()}</p>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'en' ? 'Item' : 'वस्तु'}</TableHead>
                <TableHead className="text-center">{language === 'en' ? 'Quantity' : 'मात्रा'}</TableHead>
                <TableHead className="text-right">{language === 'en' ? 'Price' : 'कीमत'}</TableHead>
                <TableHead className="text-right">{language === 'en' ? 'Total' : 'कुल'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map(item => (
                <TableRow key={item.product.id}>
                  <TableCell>{item.product.name[language]}</TableCell>
                  <TableCell className="text-center">{item.quantity}{item.product.unit}</TableCell>
                  <TableCell className="text-right">₹{item.product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">₹{(item.product.price * item.quantity).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator className="my-4" />
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between">
                <span>{language === 'en' ? 'Subtotal' : 'सब-टोटल'}</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'en' ? 'Tax (0%)' : 'कर (0%)'}</span>
                <span>₹0.00</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>{language === 'en' ? 'Total' : 'कुल'}</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2 print:hidden">
          <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4"/> {language === 'en' ? 'Print' : 'प्रिंट'}</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
