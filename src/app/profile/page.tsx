
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/hooks/use-cart-store'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, UserPlus, LogOut, Package, LayoutDashboard, Pencil } from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { UserProfile as UserProfileType } from '@/types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'


const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').optional(),
  address: z.string().optional(),
})

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, logout: storeLogout, userRole, language, toggleLanguage } = useCartStore()
  const [isClient, setIsClient] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null)
  const { toast } = useToast()
  
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', address: '' },
  })


  useEffect(() => {
    setIsClient(true)
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profileData = docSnap.data() as UserProfileType
          setUserProfile(profileData);
          form.reset({ name: profileData.name || '', address: profileData.address || '' })
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, [form])


  const handleProfileUpdate = async (values: z.infer<typeof profileSchema>) => {
     if (!auth.currentUser) return;
     
     const userDocRef = doc(db, 'users', auth.currentUser.uid)
     try {
       const dataToUpdate: { name?: string; address?: string } = {};
       if (values.name) dataToUpdate.name = values.name;
       if (values.address) dataToUpdate.address = values.address;

       await updateDoc(userDocRef, dataToUpdate);
       setUserProfile(prev => prev ? { ...prev, ...dataToUpdate } : null)
       toast({
         title: 'Success',
         description: 'Profile updated successfully.',
       });
       setIsEditing(false)
     } catch (dbError) {
        console.error("Error updating profile:", dbError);
        toast({
           title: 'Database Error',
           description: 'Could not save your profile.',
           variant: 'destructive',
        })
     }
  }


  const handleLogout = async () => {
    try {
      await signOut(auth)
      storeLogout()
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      })
      router.push('/')
    } catch (error) {
       toast({
        title: 'Logout Failed',
        description: 'There was an error logging out.',
        variant: 'destructive',
      })
    }
  }
  
  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="items-center text-center">
             <Skeleton className="h-24 w-24 mb-4 rounded-full" />
             <Skeleton className="h-6 w-32 mb-2" />
             <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
          </CardContent>
           <CardFooter className="flex items-center justify-between gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 flex-1" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-14rem)]">
          <Card className="max-w-md mx-auto w-full">
            <CardHeader className="items-center text-center">
              <CardTitle className="font-headline text-2xl">Join Us</CardTitle>
              <CardDescription>Create an account or login to manage your profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button className="w-full" asChild>
                  <Link href="/login"><LogIn /> Login</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/signup"><UserPlus /> Sign Up</Link>
                </Button>
            </CardContent>
             <CardFooter className="flex-col gap-4">
               <div className="flex w-full items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                    <Label htmlFor="language-toggle" className="text-sm font-medium">EN</Label>
                    <Switch id="language-toggle" checked={language === 'hi'} onCheckedChange={toggleLanguage} aria-label="Toggle language"/>
                    <Label htmlFor="language-toggle" className="text-sm font-medium">HI</Label>
                </div>
                <ThemeSwitcher />
              </div>
            </CardFooter>
          </Card>
        </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader className="items-center text-center">
          <div className="relative">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={userProfile?.photoURL || "https://firebasestorage.googleapis.com/v0/b/goutam-store-3uiby.appspot.com/o/tiger.png?alt=media&token=17565511-3e45-4257-9f20-98b79b69c4e2"} alt="User avatar" data-ai-hint="tiger face" />
              <AvatarFallback>{userProfile?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
             <Form {...form}>
              <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-4">
                {isEditing ? (
                  <>
                     <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="123 Main St, Anytown, USA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <div className="flex gap-2">
                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="w-full h-12 rounded-full">
                            Cancel
                        </Button>
                        <Button type="submit" className="w-full h-12 rounded-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                  </>
                ) : (
                   <div className="space-y-4 text-center">
                        <h2 className="text-2xl font-headline">{userProfile?.name}</h2>
                        <p className="text-muted-foreground">{userProfile?.email}</p>
                        <p className="text-sm">{userProfile?.address || 'No address set.'}</p>
                   </div>
                )}
              </form>
            </Form>
            
            <div className="flex gap-2 w-full pt-4">
              {!isEditing && (
                <Button variant="outline" className="w-full h-12 rounded-full" onClick={() => setIsEditing(true)}>
                  <Pencil /> Edit Profile
                </Button>
              )}
              <Button variant="outline" className="w-full h-12 rounded-full" asChild>
                <Link href="/orders"><Package />My Orders</Link>
              </Button>
            </div>

             {userRole === 'admin' && (
              <Button variant="secondary" className="w-full h-12 rounded-full" asChild>
                <Link href="/admin/dashboard"><LayoutDashboard />Admin Dashboard</Link>
              </Button>
            )}
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <div className="flex w-full items-center justify-center gap-4">
                <div className="flex items-center gap-2 md:hidden">
                    <Label htmlFor="language-toggle-profile" className="text-sm font-medium">EN</Label>
                    <Switch id="language-toggle-profile" checked={language === 'hi'} onCheckedChange={toggleLanguage} aria-label="Toggle language"/>
                    <Label htmlFor="language-toggle-profile" className="text-sm font-medium">HI</Label>
                </div>
                <ThemeSwitcher />
            </div>
            <Button variant="destructive" className="w-full h-12 rounded-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
            <div className="mt-4 border-t w-full pt-4 sm:hidden">
              <nav className="flex items-center justify-center gap-4 md:gap-6 text-center">
                <Link className="text-xs hover:underline text-muted-foreground hover:text-primary" href="/terms-of-service">
                  Terms of Service
                </Link>
                <Link className="text-xs hover:underline text-muted-foreground hover:text-primary" href="/privacy-policy">
                  Privacy Policy
                </Link>
              </nav>
              <p className="text-xs text-muted-foreground text-center mt-2">&copy; {new Date().getFullYear()} Goutam Store</p>
            </div>
        </CardFooter>
      </Card>
    </div>
  )
}
