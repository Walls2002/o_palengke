interface Customer {
  id: number;
  location_id: number;
  last_name: string;
  first_name: string;
  middle_name: string;
  email: string;
  profile_picture: string | null;
  contact: string;
  role: string;
  email_verified_at: string;
  created_at: string;
  updated_at: string;
}

interface Store {
  id: number;
  vendor_id: number;
  location_id: number;
  store_name: string;
  image: string | null;
  street: string;
  contact_number: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: number;
  name: string;
  unit_price: string;
  quantity: string;
  measurement: string;
  total_cost: string;
  created_at: string;
  updated_at: string;
}

interface OrderStatus {
  id: number;
  name: string;
}

interface RiderUser {
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  contact?: string;
}

export interface Rider {
  user?: RiderUser;
}

export interface ProcessedOrder extends Order {
  riderInfo: {
    name: string;
    contact: string;
  };
}
export interface Order {
  id: number;
  status: OrderStatus;
  rider_team_only: string | null;
  discount: string;
  shipping_fee: string;
  total_item_price: string;
  final_price: string;
  address: string;
  note: string | null;
  delivery_image: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  customer: Customer;
  store: Store;
  rider: string | null;
  items: OrderItem[];
  voucher: string | null;
}

export interface OrderContextType {
  pendingOrders: Order[];
  confirmedOrders: Order[];
  deliveredOrders: Order[];
  cancelledOrders: Order[];
  setPendingOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setConfirmedOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setDeliveredOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setCancelledOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  fetchPendingOrders: () => void;
  fetchConfirmedOrders: () => void;
  fetchDeliveredOrders: () => void;
  fetchCancelledOrders: () => void;
}
