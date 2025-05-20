

export interface Location {
  id: number;
  province: string;
  city: string;
  city_code: string;
  barangay: string;
  barangay_code: string;
  shipping_fee: string;
  created_at: string;
  updated_at: string;
}

export interface Store {
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
  location: Location;
}

export interface Category {
  id: number;
  name: string;
  parent_id: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  category: Category;
  store: Store;
  name: string;
  price: string;
  quantity: string;
  measurement: string;
  image: string | null;
  average_rating: string;
}
