
export interface CartItem {
  id: number;
  name: string;
  total_price: number;
  products: {
    id: number;
    name: string;
    selected_qty: number;
    measurement: string;
    kilo_measurement: number;
    price: number;
    total_cost: number;
  }[];
}

export interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  // addToCart: (productId: number, payload: any) => Promise<void>;
}
