
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/hooks/use-cart-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Trash2, ShoppingBag, Plus, Minus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import type { Product } from '@/types'
import { auth, db } from '@/lib/firebase'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { nanoid } from 'nanoid'
import { useState, useEffect } from 'react'

// Declare Razorpay globally so TypeScript doesn't complain
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CartPage() {
  const { cart, language, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCartStore()
  const { toast } = useToast()
  const router = useRouter()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  
  // Load the Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCheckout = async () => {
    if (!auth.currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to proceed with your order.",
        variant: "destructive",
      })
      router.push('/login');
      return;
    }

    // Key check before proceeding
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      toast({
        title: "Configuration Error",
        description: "Razorpay Key ID is not set. Please add NEXT_PUBLIC_RAZORPAY_KEY_ID to your .env.local file and restart the server.",
        variant: "destructive",
        duration: 9000,
      });
      return;
    }

    setIsCheckingOut(true);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: getCartTotal() * 100, // Amount in the smallest currency unit (paise)
      currency: "INR",
      name: "Goutam Store",
      description: "Order Payment",
      image: "https://placehold.co/100x100.png", // Replace with your logo URL
      handler: async function (response: any) {
        // This function is called on successful payment
        try {
          const orderData = {
              orderId: nanoid(10),
              userId: auth.currentUser?.uid,
              items: cart.map(item => ({
                  product: {
                      id: item.product.id,
                      name: item.product.name,
                      price: item.product.price,
                      image: item.product.image,
                      unit: item.product.unit
                  },
                  quantity: item.quantity
              })),
              total: getCartTotal(),
              status: 'Paid' as const, // Set status to Paid
              date: serverTimestamp(),
              paymentDetails: {
                  provider: 'Razorpay',
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  signature: response.razorpay_signature,
              }
          };

          await addDoc(collection(db, "orders"), orderData);

          toast({
              title: language === 'en' ? 'Order Placed Successfully' : 'ऑर्डर सफलतापूर्वक दिया गया',
              description: language === 'en' ? 'Thank you for your purchase!' : 'आपकी खरीद के लिए धन्यवाद!',
          });

          clearCart();
          router.push('/orders');
        } catch (error) {
           toast({
              title: "Order Failed",
              description: "Could not save your order. Please contact support.",
              variant: "destructive",
            });
        } finally {
            setIsCheckingOut(false);
        }
      },
      prefill: {
        name: auth.currentUser.displayName || "Goutam Store User",
        email: auth.currentUser.email || "",
      },
      theme: {
        color: "#F84E4E" // Corresponds to primary color in globals.css
      },
      modal: {
        ondismiss: function() {
          // This function is called when the user closes the modal
          setIsCheckingOut(false);
          toast({
            title: "Payment Cancelled",
            description: "You can complete your purchase anytime from the cart.",
            variant: "destructive"
          });
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay Error: ", error);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment gateway. Please try again.",
        variant: "destructive"
      });
      setIsCheckingOut(false);
    }
  };
  
  const handleQuantityChange = (productId: string, unit: Product['unit'], value: string) => {
    if (value === '') {
      updateQuantity(productId, 0);
      return;
    }

    const newQuantity = parseFloat(value);
    
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      updateQuantity(productId, newQuantity);
    }
  }

  const handleQuantityStepChange = (productId: string, currentQuantity: number, unit: Product['unit'], direction: 1 | -1) => {
    const step = unit === 'pc' ? 1 : 0.05;
    let newQuantity = currentQuantity + (step * direction);
    newQuantity = Math.max(0, newQuantity); // Ensure quantity doesn't go below 0
    // Fix floating point precision issues
    newQuantity = parseFloat(newQuantity.toFixed(2));
    updateQuantity(productId, newQuantity);
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center min-h-[calc(100vh-14rem)] flex flex-col justify-center items-center">
        <ShoppingBag className="h-24 w-24 text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold font-headline mb-2">{language === 'en' ? 'Your Cart is Empty' : 'आपका कार्ट खाली है'}</h1>
        <p className="text-muted-foreground mb-6">{language === 'en' ? 'Looks like you haven\'t added anything to your cart yet.' : 'लगता है आपने अभी तक अपने कार्ट में कुछ भी नहीं जोड़ा है।'}</p>
        <Button asChild>
          <Link href="/">{language === 'en' ? 'Start Shopping' : 'खरीदारी शुरू करें'}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">{language === 'en' ? 'Your Shopping Cart' : 'आपका शॉपिंग कार्ट'}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <Card key={item.product.id} className="flex items-center p-2">
              <div className="relative w-20 h-20 rounded-md overflow-hidden mr-4 shrink-0">
                <Image src={item.product.image} alt={item.product.name.en} fill className="object-cover" data-ai-hint={item.product.dataAiHint}/>
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-base">{item.product.name[language]}</h2>
                <p className="text-xs text-muted-foreground">{item.product.category}</p>
                <p className="text-md font-semibold text-primary mt-1">₹{item.product.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-2">
                <div className="flex items-center border rounded-md">
                   <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleQuantityStepChange(item.product.id, item.quantity, item.product.unit, -1)}
                      disabled={item.quantity === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      step={item.product.unit === 'pc' ? "1" : "0.05"}
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.product.id, item.product.unit, e.target.value)}
                      className="w-14 h-8 text-center border-0 focus-visible:ring-0 no-spinner"
                      onBlur={(e) => {
                        if (parseFloat(e.target.value) === 0) {
                          toast({
                              title: language === 'en' ? 'Item quantity is zero' : 'आइटम की मात्रा शून्य है',
                              description: language === 'en' ? `Consider removing ${item.product.name[language]} or increasing the quantity.` : `${item.product.name[language]} को हटाने या मात्रा बढ़ाने पर विचार करें।`,
                              variant: 'destructive'
                          })
                        }
                      }}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleQuantityStepChange(item.product.id, item.quantity, item.product.unit, 1)}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.product.id)}>
                  <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">{language === 'en' ? 'Order Summary' : 'आर्डर का सार'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                {cart.map(item => (
                  <div key={item.product.id} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground truncate pr-2">{item.product.name[language]} x{item.quantity}</span>
                    <span className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === 'en' ? 'Subtotal' : 'सब-टोटल'}</span>
                <span className="font-medium">₹{getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{language === 'en' ? 'Shipping' : 'शिपिंग'}</span>
                <span className="font-medium">{language === 'en' ? 'Free' : 'मुफ़्त'}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>{language === 'en' ? 'Total' : 'कुल'}</span>
                <span>₹{getCartTotal().toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleCheckout} disabled={getCartTotal() <= 0 || isCheckingOut}>
                {isCheckingOut ? (language === 'en' ? 'Processing...' : 'प्रोसेस हो रहा है...') : (language === 'en' ? 'Proceed to Checkout' : 'चेकआउट के लिए आगे बढ़ें')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
