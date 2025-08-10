
// This script is NOT part of the application runtime.
// It is a utility script to populate the Firestore database with initial data.
// To use it, you must first configure your local environment to authenticate with Firebase.
//
// 1. Install the Firebase CLI: `npm install -g firebase-tools`
// 2. Login to Firebase: `firebase login`
// 3. Set your project: `firebase use goutam-store`
//
// Then, you can run this script using `npm run seed`.

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, writeBatch } = require('firebase/firestore');

// IMPORTANT: This configuration is for the script's execution environment (your local machine),
// NOT for the client-side application. It requires authenticated access.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const products = [
    {
        name: { en: 'Aashirvaad Whole Wheat Atta', hi: 'आशीर्वाद साबुत गेहूं आटा' },
        description: { en: '100% whole wheat atta for soft rotis.', hi: 'नरम रोटियों के लिए 100% साबुत गेहूं का आटा।' },
        price: 55,
        category: 'Aata/Maida/Besan',
        image: 'https://drive.google.com/uc?export=view&id=1Xy8cLG3Y5Fct5TZyE_gT-vLqfUeG8t_A',
        unit: 'kg',
        available: true,
        dataAiHint: 'wheat flour'
    },
    {
        name: { en: 'Tata Salt', hi: 'टाटा नमक' },
        description: { en: 'Iodized salt for everyday cooking.', hi: 'रोजमर्रा के खाना पकाने के लिए आयोडीन युक्त नमक।' },
        price: 25,
        category: 'Masala & Salt',
        image: 'https://drive.google.com/uc?export=view&id=1pG4vB7gJ8bJkE-F4H-n9L1gQYdZ1zJ7o',
        unit: 'kg',
        available: true,
        dataAiHint: 'salt packet'
    },
    {
        name: { en: 'Parle-G Biscuits', hi: 'पारले-जी बिस्कुट' },
        description: { en: 'The original gluco-biscuit.', hi: 'ओरिजिनल ग्लूको-बिस्कुट।' },
        price: 10,
        category: 'Biscuits',
        image: 'https://drive.google.com/uc?export=view&id=1tO7dF5jA8rL3gN1jV8wP5bO0oYdE0gGk',
        unit: 'pc',
        available: true,
        dataAiHint: 'biscuit packet'
    },
    {
        name: { en: 'Cycle Agarbatti', hi: 'साइकिल अगरबत्ती' },
        description: { en: 'Popular brand of incense sticks for prayer.', hi: 'पूजा के लिए अगरबत्ती का लोकप्रिय ब्रांड।' },
        price: 20,
        category: 'Agarbatti',
        image: 'https://drive.google.com/uc?export=view&id=1bJ8Z3nQ9YhP6tX2fA5wS6gD1kF0aL9jR',
        unit: 'pc',
        available: true,
        dataAiHint: 'incense sticks'
    },
    {
        name: { en: 'Fortune Soyabean Oil', hi: 'फॉर्च्यून सोयाबीन तेल' },
        description: { en: 'Refined soyabean oil for cooking.', hi: 'खाना पकाने के लिए रिफाइंड सोयाबीन तेल।' },
        price: 130,
        category: 'Oil',
        image: 'https://drive.google.com/uc?export=view&id=1zK-9k8fJ7vG5bL3sN4wA0jS8gT1dF0wR',
        unit: 'L',
        available: true,
        dataAiHint: 'cooking oil'
    },
];

async function seedDatabase() {
  const batch = writeBatch(db);
  const productsCollection = collection(db, 'products');

  products.forEach(product => {
    const docRef = require('firebase/firestore').doc(productsCollection);
    batch.set(docRef, product);
  });

  try {
    await batch.commit();
    console.log('✅ Success: Firestore database has been seeded with initial products.');
  } catch (e) {
    console.error('❌ Error seeding database:', e);
  }
}

seedDatabase();
