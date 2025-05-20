import React, { createContext, useState, useContext, useEffect } from "react";
import { orderApi } from "@/api/customer/orderApi";
import { Order, OrderContextType } from "@/types/OrderItem";
import { useAuth } from "@/provider/AuthProvider";

interface OrdersResponse {
  orders: Order[];
  status?: string;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);
const COOLDOWN_TIME = 10000; // 10 seconds between requests

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading } = useAuth() as {
    user: { type: string } | null;
    isLoading: boolean;
  };
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [confirmedOrders, setConfirmedOrders] = useState<Order[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<Order[]>([]);
  const [lastFetchTimes, setLastFetchTimes] = useState({
    pending: 0,
    confirmed: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [backoffTime, setBackoffTime] = useState({
    pending: 0,
    confirmed: 0,
    delivered: 0,
    cancelled: 0,
  });

  // Helper to check if we should fetch based on cooldown
  const shouldFetch = (type: keyof typeof lastFetchTimes) => {
    const now = Date.now();
    return (
      now > backoffTime[type] && now - lastFetchTimes[type] > COOLDOWN_TIME
    );
  };

  // Update last fetch time
  const updateFetchTime = (type: keyof typeof lastFetchTimes) => {
    setLastFetchTimes((prev) => ({
      ...prev,
      [type]: Date.now(),
    }));
  };
 
  const updateOrderStates = (
    response: OrdersResponse,
    responseType: string
  ) => {
    if (!response || !response.orders || !Array.isArray(response.orders)) {
      return;
    }
    const responseOrders = response.orders;

    // Only process if we actually received orders
    if (responseOrders.length === 0) {
      return;
    }

    // Extract order IDs from each category for efficient lookup
    const pendingIds = new Set(pendingOrders?.map((order) => order.id));
    const confirmedIds = new Set(confirmedOrders?.map((order) => order.id));
    const deliveredIds = new Set(deliveredOrders?.map((order) => order.id));
    const cancelledIds = new Set(cancelledOrders?.map((order) => order.id));

    switch (responseType) {
      case "confirmed":
        const newConfirmedOrders = responseOrders.filter(
          (order) => pendingIds.has(order.id) && !confirmedIds.has(order.id)
        );

        if (newConfirmedOrders.length > 0) {
          setPendingOrders((prev) =>
            prev.filter(
              (order) =>
                !newConfirmedOrders.some((newOrder) => newOrder.id === order.id)
            )
          );
        }
        break;

      case "delivered":
        const newDeliveredOrders = responseOrders.filter(
          (order) => confirmedIds.has(order.id) && !deliveredIds.has(order.id)
        );

        if (newDeliveredOrders.length > 0) {
          setConfirmedOrders((prev) =>
            prev.filter(
              (order) =>
                !newDeliveredOrders.some((newOrder) => newOrder.id === order.id)
            )
          );
        }
        break;

      case "cancelled":
        const newCancelledFromPending = responseOrders.filter(
          (order) => pendingIds.has(order.id) && !cancelledIds.has(order.id)
        );

        const newCancelledFromConfirmed = responseOrders.filter(
          (order) => confirmedIds.has(order.id) && !cancelledIds.has(order.id)
        );

        if (newCancelledFromPending.length > 0) {
          setPendingOrders((prev) =>
            prev.filter(
              (order) =>
                !newCancelledFromPending.some(
                  (newOrder) => newOrder.id === order.id
                )
            )
          );
        }

        if (newCancelledFromConfirmed.length > 0) {
          setConfirmedOrders((prev) =>
            prev.filter(
              (order) =>
                !newCancelledFromConfirmed.some(
                  (newOrder) => newOrder.id === order.id
                )
            )
          );
        }
        break;
    }
  };

  const fetchPendingOrders = async () => {
    if (!user) return Promise.resolve(null);
    if (!shouldFetch("pending")) {
      return Promise.resolve(null);
    }

    try {
      const response = await orderApi.fetchPendingOrders(user);
      if (response && response.orders && Array.isArray(response.orders)) {
        setPendingOrders(response.orders);
        updateOrderStates(response, "pending");
      } else {
        setPendingOrders([]);
      }
      updateFetchTime("pending");
      return response;
    } catch (error: any) {
      if (error.response?.status === 429) {
        setLastFetchTimes((prev) => ({
          ...prev,
          pending: Date.now() + 30000,
        }));
      }
      throw error;
    }
  };

  const fetchConfirmedOrders = async () => {
    if (!user) return Promise.resolve(null);
    if (!shouldFetch("confirmed")) {
      return Promise.resolve(null);
    }
    try {
      const response = await orderApi.fetchConfirmedOrders(user);
      if (response && response.orders && Array.isArray(response.orders)) {
        setConfirmedOrders(response.orders);
        updateOrderStates(response, "confirmed");
      } else {
        setConfirmedOrders([]);
      }
      updateFetchTime("confirmed");
      return response;
    } catch (error: any) {
      if (error.response?.status === 429) {
        setLastFetchTimes((prev) => ({
          ...prev,
          confirmed: Date.now() + 30000,
        }));
      }
      throw error;
    }
  };

  const fetchDeliveredOrders = async () => {
    if (!user) return Promise.resolve(null);
    if (!shouldFetch("delivered")) {
      return Promise.resolve(null);
    }
    try {
      const response = await orderApi.fetchDeliveredOrders(user);
      if (response && response.orders && Array.isArray(response.orders)) {
        setDeliveredOrders(response.orders);
        updateOrderStates(response, "delivered");
      } else {
        setDeliveredOrders([]);
      }
      updateFetchTime("delivered");
      return response;
    } catch (error: any) {
      if (error.response?.status === 429) {
        setLastFetchTimes((prev) => ({
          ...prev,
          delivered: Date.now() + 30000,
        }));
      }
      throw error;
    }
  };

  const fetchCancelledOrders = async () => {
    if (!user) return Promise.resolve(null);
    if (!shouldFetch("cancelled")) {
      return Promise.resolve(null);
    }

    try {
      const response = await orderApi.fetchCancelledOrders(user);
      if (response && response.orders && Array.isArray(response.orders)) {
        setCancelledOrders(response.orders);
        updateOrderStates(response, "cancelled");
      } else {
        setCancelledOrders([]);
      }
      updateFetchTime("cancelled");
      return response;
    } catch (error: any) {
      if (error.response?.status === 429) {
        setLastFetchTimes((prev) => ({
          ...prev,
          cancelled: Date.now() + 30000,
        }));
      }
      throw error;
    }
  };

  useEffect(() => {
    if (!isLoading && user) {
      fetchPendingOrders().catch((err) =>
        console.error("Error fetching pending orders:", err)
      );
      setTimeout(
        () =>
          fetchConfirmedOrders().catch((err) =>
            console.error("Error fetching confirmed orders:", err)
          ),
        1000
      );
      setTimeout(
        () =>
          fetchDeliveredOrders().catch((err) =>
            console.error("Error fetching delivered orders:", err)
          ),
        2000
      );
      setTimeout(
        () =>
          fetchCancelledOrders().catch((err) =>
            console.error("Error fetching cancelled orders:", err)
          ),
        3000
      );
    }
  }, [user, isLoading]);

  return (
    <OrderContext.Provider
      value={{
        pendingOrders,
        confirmedOrders,
        deliveredOrders,
        cancelledOrders,
        setPendingOrders,
        setConfirmedOrders,
        setDeliveredOrders,
        setCancelledOrders,
        fetchPendingOrders,
        fetchConfirmedOrders,
        fetchDeliveredOrders,
        fetchCancelledOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

// Custom hook to use the OrderContext
export const useOrderContext = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrderContext must be used within an OrderProvider");
  }
  return context;
};
