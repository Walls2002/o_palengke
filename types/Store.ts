export interface Store {
    id: string | number;
    store_name: string;
    
  }

  export interface StoreList {
    id: number;
    image: string; // URL or local path
    store_name: string;
    contact_number: string;
    street: string;  
    is_verified: boolean;
    location: {
      shipping_fee: string;
    };
    // You can define actions as functions if needed
    // e.g. onEdit?: () => void; onDelete?: () => void;
  }
  