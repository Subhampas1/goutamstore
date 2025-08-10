

export type Product = {
  id: string;
  name: {
    en: string;
    hi: string;
  };
  description: {
    en: string;
    hi: string;
  };
  price: number;
  category: string;
  image: string;
  dataAiHint: string;
  unit: 'kg' | 'L' | 'pc'; // pc for piece
  available: boolean;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type OrderItem = {
  product: Product;
  quantity: number;
}

export type Order = {
  id: string; // Document ID from Firestore
  orderId: string; // Human-readable order ID
  userId: string;
  date: string; // ISO string date
  status: 'Paid' | 'Pending' | 'Shipped' | 'Delivered';
  total: number;
  items: OrderItem[];
  paymentDetails?: {
    provider: string;
    paymentId: string;
    orderId: string;
    signature: string;
  }
};

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  disabled: boolean;
  photoURL?: string;
  address?: string;
}

    
