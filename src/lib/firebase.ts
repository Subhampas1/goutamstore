// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlO7GrnMDubwsc7GrM2J3a6E8LP7qrGjc",
  authDomain: "goutam-store-3uiby.firebaseapp.com",
  projectId: "goutam-store-3uiby",
  storageBucket: "goutam-store-3uiby.appspot.com",
  messagingSenderId: "991543455116",
  appId: "1:991543455116:web:2a2e0eda4fc3e34bfd3aa9"
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
