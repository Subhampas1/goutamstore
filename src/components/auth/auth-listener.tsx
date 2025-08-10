
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/hooks/use-cart-store'
import { useToast } from '@/hooks/use-toast'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'

// This is a client-side component that listens for changes to the user's auth state and Firestore document.
export function AuthListener() {
  const router = useRouter()
  const { logout: storeLogout } = useCartStore()
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      let unsubscribeFromFirestore: (() => void) | undefined;

      if (user) {
        // User is signed in, set up a real-time listener on their user document
        const userDocRef = doc(db, 'users', user.uid);
        
        unsubscribeFromFirestore = onSnapshot(userDocRef, (doc) => {
          if (doc.exists() && doc.data().disabled === true) {
            // The user's account has been disabled.
            // Force sign out on the client.
            signOut(auth).then(() => {
              storeLogout();
              toast({
                title: "Account Disabled",
                description: "Your account has been disabled by an administrator.",
                variant: "destructive",
                duration: 5000,
              });
              router.push('/login');
            });
          }
        }, (error) => {
          console.error("Firestore listener error:", error);
        });

      } else {
        // User is signed out, no listener needed.
      }

      // Cleanup function for the effect
      return () => {
        if (unsubscribeFromFirestore) {
          unsubscribeFromFirestore();
        }
      };
    });

    // Cleanup the auth state listener when the component unmounts
    return () => unsubscribe();
  }, [router, storeLogout, toast]);

  return null // This component doesn't render anything
}
