export interface Voucher {
  id: number;
  code: string;
  is_percent: boolean;
  value: string;
  min_order_price: string;
  description: string;
  expired_at: string;
  expired_at_readable: string;
  used_at: string | null;
}

export interface VoucherResponse {
  message: string;
  vouchers: Voucher[];
}
