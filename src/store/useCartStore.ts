import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/types";

interface CartState {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (product) => {
        const currentCart = get().cart;
        const existingItem = currentCart.find((item) => item.id === product.id);

        if (existingItem) {
          if (existingItem.quantity >= product.stock) return; // Cap at available stock
          set({
            cart: currentCart.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          });
        } else {
          if (product.stock <= 0) return; // Out of stock
          set({
            cart: [...currentCart, { ...product, quantity: 1 }],
          });
        }
      },
      removeFromCart: (productId) => {
        const currentCart = get().cart;
        const existingItem = currentCart.find((item) => item.id === productId);

        if (!existingItem) return;

        if (existingItem.quantity === 1) {
          set({
            cart: currentCart.filter((item) => item.id !== productId),
          });
        } else {
          set({
            cart: currentCart.map((item) =>
              item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
            ),
          });
        }
      },
      clearCart: () => set({ cart: [] }),
      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getCartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "inventory-cart-persistence", // Storage key
    }
  )
);
