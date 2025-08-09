
import type { Product, Order } from '@/types';

// Mock products are now fetched from Firestore. This file can be kept for reference or for other mock data.
export const mockProducts: Product[] = [];

export const mockOrders: Order[] = [
    {
        id: 'ord_123',
        date: '2023-10-26',
        status: 'Delivered',
        total: 7,
        items: [
            { 
              product: {
                id: 'prod_1',
                name: { en: 'Whole Wheat Aata', hi: 'साबुत गेहूं का आटा' },
                description: { en: 'Freshly ground whole wheat flour.', hi: 'ताज़ी पिसी हुई साबुत गेहूं का आटा।' },
                price: 5,
                category: 'Aata/Maida/Besan',
                image: 'https://placehold.co/600x400.png',
                dataAiHint: 'wheat flour'
              },
              quantity: 1 
            },
            { 
              product: {
                id: 'prod_2',
                name: { en: 'Sandalwood Agarbatti', hi: 'चंदन अगरबत्ती' },
                description: { en: 'Fragrant incense sticks for prayers.', hi: 'पूजा के लिए सुगंधित अगरबत्ती।' },
                price: 2,
                category: 'Agarbatti',
                image: 'https://placehold.co/600x400.png',
                dataAiHint: 'incense sticks'
              },
              quantity: 1 
            },
        ],
    },
];

// Product categories are now dynamically generated from Firestore data on the homepage.
export const productCategories: string[] = [];
