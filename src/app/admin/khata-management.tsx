
'use client'

import { useEffect, useMemo, useState } from 'react'
import type { Order, UserProfile } from '@/types'
import { db } from '@/lib/firebase'
import { collection, onSnapshot, Timestamp, query } from 'firebase/firestore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/hooks/use-cart-store'

interface OrderWithUser extends Order {
  user?: UserProfile;
}

export function KhataManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const userRole = useCartStore(state => state.userRole)


  useEffect(() => {
    if (userRole !== 'admin') {
      setLoading(false);
      return;
    }

    setLoading(true);

    const usersQuery = collection(db, 'users');
    const usersUnsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as UserProfile);
      setUsers(usersList);
    }, (error) => {
      console.error("Khata User Fetch Error:", error);
    });

    const ordersQuery = collection(db, 'orders');
    const ordersUnsubscribe = onSnapshot(ordersQuery, (snapshot) => {
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
      console.error("Khata Order Fetch Error:", error);
      setLoading(false);
    });

    return () => {
      usersUnsubscribe();
      ordersUnsubscribe();
    };
  }, [userRole]);

  const ordersWithUsers = useMemo<OrderWithUser[]>(() => {
    const userMap = new Map(users.map(user => [user.userId, user]))
    return orders.map(order => ({
      ...order,
      user: userMap.get(order.userId),
    }))
  }, [orders, users])

  const ordersGroupedByUser = useMemo(() => {
    const grouped = new Map<string, OrderWithUser[]>()
    ordersWithUsers.forEach(order => {
      if (order.user) {
        if (!grouped.has(order.user.userId)) {
          grouped.set(order.user.userId, [])
        }
        grouped.get(order.user.userId)!.push(order)
      }
    })
    return Array.from(grouped.entries())
  }, [ordersWithUsers])

  const ordersGroupedByDate = useMemo(() => {
    const grouped = new Map<string, OrderWithUser[]>()
    ordersWithUsers.forEach(order => {
      const date = new Date(order.date).toLocaleDateString()
      if (!grouped.has(date)) {
        grouped.set(date, [])
      }
      grouped.get(date)!.push(order)
    })
    return Array.from(grouped.entries())
  }, [ordersWithUsers])
  
  const filteredUsers = useMemo(() => {
    if (!searchTerm) {
      return ordersGroupedByUser;
    }
    return ordersGroupedByUser.filter(([userId, userOrders]) => {
      const user = userOrders[0]?.user;
      return user?.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [ordersGroupedByUser, searchTerm]);


  const renderOrderDetails = (order: OrderWithUser) => (
    <div className="text-sm">
      <div className="flex justify-between items-center mb-2">
        <div>
            <span className="font-semibold">Order ID:</span> {order.orderId}
        </div>
        <div className="font-bold">₹{order.total.toFixed(2)}</div>
      </div>
      <Separator className="my-2"/>
      <ul className="space-y-1">
        {order.items.map(item => (
          <li key={item.product.id} className="flex justify-between items-center text-muted-foreground">
            <span>{item.product.name.en} x {item.quantity}{item.product.unit}</span>
            <span className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Khata Management</CardTitle>
        <CardDescription>Track all orders and view transaction history.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading ledger...</p>
        ) : userRole !== 'admin' ? (
          <p className="text-destructive">You do not have permission to view this section.</p>
        ) : (
          <Tabs defaultValue="user">
            <div className="flex justify-between items-center mb-4">
               <TabsList>
                  <TabsTrigger value="user">Group by User</TabsTrigger>
                  <TabsTrigger value="date">Group by Date</TabsTrigger>
                </TabsList>
                 <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by user name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>
           
            <TabsContent value="user">
                <Accordion type="multiple" className="w-full">
                    {filteredUsers.map(([userId, userOrders]) => (
                        <AccordionItem value={userId} key={userId}>
                            <AccordionTrigger>
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-lg">{userOrders[0]?.user?.name || 'Unknown User'}</span>
                                    <span className="text-sm text-muted-foreground">{userOrders[0]?.user?.email}</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <Accordion type="multiple" className="w-full pl-4 border-l">
                                    {userOrders.map(order => (
                                        <AccordionItem value={order.id} key={order.id}>
                                            <AccordionTrigger>{`Date: ${new Date(order.date).toLocaleDateString()}`}</AccordionTrigger>
                                            <AccordionContent>
                                                {renderOrderDetails(order)}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </TabsContent>
            <TabsContent value="date">
                 <Accordion type="multiple" className="w-full">
                    {ordersGroupedByDate.map(([date, dateOrders]) => (
                        <AccordionItem value={date} key={date}>
                            <AccordionTrigger>
                                <div className="font-semibold text-lg">{date}</div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <Accordion type="multiple" className="w-full pl-4 border-l">
                                    {dateOrders.map(order => (
                                        <AccordionItem value={order.id} key={order.id}>
                                            <AccordionTrigger>{order.user?.name || 'Unknown User'}</AccordionTrigger>
                                            <AccordionContent>
                                                {renderOrderDetails(order)}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
