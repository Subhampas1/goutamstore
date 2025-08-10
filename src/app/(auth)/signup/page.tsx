
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useCartStore } from '@/hooks/use-cart-store'
import { useToast } from "@/hooks/use-toast"
import { auth, db } from '@/lib/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { setDoc, doc, getDocs, collection, query, limit } from 'firebase/firestore'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})

export default function SignupPage() {
  const router = useRouter()
  const { login } = useCartStore()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    try {
      // Check if any users exist to determine if this is the first signup
      const usersQuery = query(collection(db, "users"), limit(1));
      const existingUsersSnapshot = await getDocs(usersQuery);
      const isFirstUser = existingUsersSnapshot.empty;
      
      const role = isFirstUser ? 'admin' : 'user';

      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Ensure user document includes name, email, and the determined role
      await setDoc(doc(db, "users", user.uid), {
        userId: user.uid,
        name: values.name,
        email: values.email,
        role: role,
        disabled: false,
        address: '',
      });

      login({ role });
      
      toast({
        title: "Account Created",
        description: isFirstUser 
            ? "Welcome! As the first user, you have been assigned admin privileges."
            : "Welcome to Goutam Store!",
      })
      
      if (role === 'admin') {
          router.push('/admin/dashboard')
      } else {
          router.push('/')
      }

    } catch (error: any) {
       console.error(error)
       toast({
        title: "Sign Up Failed",
        description: error.message,
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
          <CardTitle className="text-2xl font-headline">Sign Up</CardTitle>
          <CardDescription>Create an account to start shopping</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Goutam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline text-primary">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
