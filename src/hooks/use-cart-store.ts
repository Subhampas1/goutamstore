
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, CartItem } from '@/types'

type Language = 'en' | 'hi'
type UserRole = 'admin' | 'user'

interface StoreState {
  cart: CartItem[]
  language: Language
  isAuthenticated: boolean
  userRole: UserRole | null
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  toggleLanguage: () => void
  clearCart: () => void
  login: (payload: { role: UserRole }) => void
  logout: () => void
  getCartTotal: () => number
  getCartCount: () => number
}

export const useCartStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      language: 'en',
      isAuthenticated: false,
      userRole: null,
      addToCart: (product, quantity = 1) => {
        const { cart } = get()
        const item = cart.find(i => i.product.id === product.id)
        if (item) {
          get().updateQuantity(product.id, item.quantity + quantity)
        } else {
          set({ cart: [...cart, { product, quantity }] })
        }
      },
      removeFromCart: productId =>
        set(state => ({
          cart: state.cart.filter(item => item.product.id !== productId)
        })),
      updateQuantity: (productId, quantity) =>
        set(state => ({
          cart: state.cart
            .map(item =>
              item.product.id === productId ? { ...item, quantity } : item
            )
            .filter(item => item.quantity >= 0) // Allow 0, but not negative
        })),
      toggleLanguage: () =>
        set(state => ({ language: state.language === 'en' ? 'hi' : 'en' })),
      clearCart: () => set({ cart: [] }),
      login: (payload) => set({ isAuthenticated: true, userRole: payload.role }),
      logout: () => set({ isAuthenticated: false, userRole: null, cart: [] }),
      getCartTotal: () => get().cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
      getCartCount: () => get().cart.length
    }),
    {
      name: 'goutam-store'
    }
  )
)
