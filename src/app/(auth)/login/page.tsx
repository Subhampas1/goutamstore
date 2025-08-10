
'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCartStore } from '@/hooks/use-cart-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from "@/hooks/use-toast"
import { auth, db } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})

type UserRole = 'admin' | 'user'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useCartStore()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password)
      const user = userCredential.user

      const userDocRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)
      
      const userData = userDoc.exists() ? userDoc.data() : {};

      if (userData.disabled) {
        await auth.signOut(); // Sign out the user immediately
        toast({
          title: "Login Failed",
          description: "Your account has been disabled. Please contact support.",
          variant: "destructive",
        })
        return;
      }
      
      const role = (userData.role as UserRole) || 'user';
      login({ role })

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })
      
      if (role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/')
      }

    } catch (error: any) {
      console.error(error)
      toast({
        title: "Login Failed",
        description: error.code === 'auth/invalid-credential' 
            ? 'Invalid email or password.'
            : error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
               <svg width="64" height="64" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="40" y="60" width="120" height="100" rx="20" className="fill-accent"/>
                <path d="M60 60 A40 40 0 0 1 140 60" fill="none" className="stroke-accent" strokeWidth="12"/>
                <text x="100" y="130" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="80" fontWeight="bold" className="fill-accent-foreground">G</text>
              </svg>
            </div>
          <CardTitle className="text-2xl font-headline">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="m@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full mt-2" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline text-primary">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
