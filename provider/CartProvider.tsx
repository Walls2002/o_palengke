import React, { createContext, useState, useContext, useEffect } from "react";
import { cartApi } from "@/api/customer/cartApi";
import { CartItem, CartContextType } from "@/types/CartItem";
import { useAuth } from "@/provider/AuthProvider";
const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  // Fetch cart data
  const refreshCart = async () => {
    setIsLoading(true);
    if (!user) {
      return;
    }
    try {
      const response = await cartApi.fetchCart(user);
      setCartItems(response.cart);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cart data on mount
  useEffect(() => {
    if (user) {
      refreshCart();
    }
  }, [user]);

  return (
    <CartContext.Provider value={{ cartItems, isLoading, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the CartContext
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
