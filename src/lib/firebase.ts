// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// IMPORTANT: Replace the placeholder values below with the configuration
// from your new Firebase project that is in a free-tier eligible region.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "PASTE_YOUR_API_KEY_HERE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "PASTE_YOUR_APP_ID_HERE",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "PASTE_YOUR_MEASUREMENT_ID_HERE",
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
