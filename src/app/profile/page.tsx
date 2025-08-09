
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/hooks/use-cart-store'
import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogIn, UserPlus, LogOut, Package, LayoutDashboard, Upload } from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { auth, db, storage } from '@/lib/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useToast } from '@/hooks/use-toast'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import type { UserProfile as UserProfileType } from '@/types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'


const profileSchema = z.object({
  address: z.string().optional(),
})

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, logout: storeLogout, userRole } = useCartStore()
  const [isClient, setIsClient] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null)
  const { toast } = useToast()
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { address: '' },
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
          form.reset({ address: profileData.address || '' })
          if (profileData.photoURL) {
            setPreviewUrl(profileData.photoURL)
          }
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, [form])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleProfileUpdate = async (values: z.infer<typeof profileSchema>) => {
     if (!auth.currentUser) return;
     
     const userDocRef = doc(db, 'users', auth.currentUser.uid)
     try {
       await updateDoc(userDocRef, { address: values.address });
       setUserProfile(prev => prev ? { ...prev, address: values.address } : null)
       toast({
         title: 'Success',
         description: 'Profile updated successfully.',
       });
     } catch (dbError) {
        console.error("Error updating address:", dbError);
        toast({
           title: 'Database Error',
           description: 'Could not save your address.',
           variant: 'destructive',
        })
     }
  }

  const handleUploadAndSave = async () => {
    if (!selectedFile || !auth.currentUser) return

    setIsUploading(true)
    setUploadProgress(0)
    
    const storageRef = ref(storage, `profile-pictures/${auth.currentUser.uid}/${selectedFile.name}`)
    const uploadTask = uploadBytesResumable(storageRef, selectedFile)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setUploadProgress(progress)
      },
      (error) => {
        console.error("Upload failed:", error);
        toast({
          title: 'Upload Failed',
          description: 'There was an error updating your profile picture.',
          variant: 'destructive',
        })
        setIsUploading(false)
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          try {
            const userDocRef = doc(db, 'users', auth.currentUser!.uid)
            await updateDoc(userDocRef, { photoURL: downloadURL })
            setUserProfile(prev => prev ? { ...prev, photoURL: downloadURL } : null)
            toast({
              title: 'Success',
              description: 'Profile picture updated successfully.',
            })
          } catch (dbError) {
             console.error("Error updating document:", dbError);
             toast({
                title: 'Database Error',
                description: 'Could not save the new profile picture.',
                variant: 'destructive',
             })
          } finally {
            setIsUploading(false)
            setSelectedFile(null)
          }
        });
      }
    );
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
             <div className="h-24 w-24 mb-4 bg-muted rounded-full animate-pulse"></div>
             <div className="h-6 w-32 bg-muted rounded animate-pulse mb-2"></div>
             <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
             <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
             <div className="h-10 w-full bg-muted rounded animate-pulse"></div>
          </CardContent>
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
              <div className="text-sm text-muted-foreground">Appearance</div>
              <ThemeSwitcher />
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
              <AvatarImage src={previewUrl || "https://placehold.co/100x100.png"} alt="User avatar" data-ai-hint="user avatar" />
              <AvatarFallback>{userProfile?.name.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
             <Button
                variant="outline"
                size="icon"
                className="absolute bottom-4 right-0 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4" />
                <span className="sr-only">Upload new picture</span>
              </Button>
              <Input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
                disabled={isUploading}
              />
          </div>
          <CardTitle className="font-headline text-2xl">{userProfile?.name || 'User'}</CardTitle>
          <CardDescription>{userProfile?.email || 'user@example.com'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {isUploading && <Progress value={uploadProgress} className="w-full" />}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleProfileUpdate)} className="space-y-4">
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
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
                    {form.formState.isSubmitting ? 'Saving Address...' : 'Save Address'}
                  </Button>
                  {selectedFile && !isUploading && (
                    <Button onClick={handleUploadAndSave} className="w-full" type="button">
                      Save Photo
                    </Button>
                  )}
                </div>
              </form>
            </Form>
            
            <Button variant="outline" className="w-full" asChild>
              <Link href="/orders"><Package />My Orders</Link>
            </Button>
             {userRole === 'admin' && (
              <Button variant="secondary" className="w-full" asChild>
                <Link href="/admin/dashboard"><LayoutDashboard />Admin Dashboard</Link>
              </Button>
            )}
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-2">
           <ThemeSwitcher />
           <Button variant="destructive" className="flex-1" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
