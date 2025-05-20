interface Customer {
    first_name: string;
    middle_name?: string;
    last_name: string;
    contact: string;
    email: string;
  }
  
  interface OrderItem {
    name: string;
    quantity: number;
    total_cost: number;
  }
  
  export interface Order {
    id: string | number;
    customer: Customer;
    address: string;
    note?: string;
    items: OrderItem[];
    total_item_price: number;
    shipping_fee: number;
    discount: number;
    final_price: number;
  }
  

  export interface VendorOrder {
    id: string | number;
    customer: Customer;
    address: string;
    note?: string;
    items: OrderItem[];
    total_item_price: number;
    shipping_fee: number;
    discount: number;
    final_price: number;
    delivery_image?: string;
    delivery_note?: string;
    rider?: {
      user: {
        first_name: string;
        middle_name?: string;
        last_name: string;
        contact: string;
        email: string;
      };
      plate_number: string;
      license_number: string;
      rating: number;
    };
    rider_team_only?: boolean;
  }