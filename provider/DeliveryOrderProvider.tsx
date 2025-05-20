import React, { createContext, useContext, useState, useEffect } from "react";
import { deliveryApi } from "@/api/rider/deliveryApi";
import {useAuth} from "@/provider/AuthProvider";
interface OrdersContextProps {
  orders: any[];
  loading: boolean;
  error: unknown;
  fetchForDeliveryOrders: (showLoading?: boolean) => Promise<void>;
}

const OrdersContext = createContext<OrdersContextProps | undefined>(undefined);

export const DeliveryOrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const { user } = useAuth() as { user: { type: string } | null };
 


  const fetchForDeliveryOrders = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const fetchedOrders = await deliveryApi.fetchOrderForDelivery(user?.role);
      setOrders(fetchedOrders);
    } catch (err) {
      setError(err as unknown);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForDeliveryOrders();
  }, []);

  return (
    <OrdersContext.Provider value={{ orders, loading, error, fetchForDeliveryOrders }}>
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within an DeliveryOrderProvider");
  }
  return context;
};
