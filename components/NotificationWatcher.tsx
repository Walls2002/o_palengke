import { useEffect, useRef } from "react";
import { useOrderContext } from "@/provider/OrderProvider";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

const NotificationWatcher = () => {
  const {
    pendingOrders,
    fetchPendingOrders,
    confirmedOrders,
    fetchConfirmedOrders,
  } = useOrderContext();

  const prevPendingOrdersLength = useRef<number>(pendingOrders?.length || 0);
  const prevConfirmedOrdersLength = useRef<number>(
    confirmedOrders?.length || 0
  );
  //Pending orders notification watcher

  //   useEffect(() => {
  //     const interval = setInterval(() => {
  //       if (typeof fetchPendingOrders === "function") {
  //         fetchPendingOrders();
  //         console.log("Fetching pending orders...");
  //       }
  //       if (typeof fetchConfirmedOrders === "function") {
  //         fetchConfirmedOrders();
  //         console.log("Fetching confirmed orders...");
  //       }
  //     }, 5000);

  //     return () => clearInterval(interval); // 🔁 cleanup on unmount
  //   }, []);

  // useEffect(() => {
  //   const sub1 = Notifications.addNotificationReceivedListener(
  //     async (notification) => {
  //       console.log("🔔 Notification Received1111:", notification);
  //       await Notifications.presentNotificationAsync({
  //         title: notification.request.content.title,
  //         body: notification.request.content.body,
  //         sound: true,
  //       });
  //     }
  //   );

  //   const sub2 = Notifications.addNotificationResponseReceivedListener(
  //     (response) => {
  //       console.log("👆 User tapped notification:", response);
  //     }
  //   );

  //   return () => {
  //     sub1.remove();
  //     sub2.remove();
  //   };
  // }, []);

  // useEffect(() => {
  //   const sendNotification = async () => {
  //     await Notifications.scheduleNotificationAsync({
  //       content: {
  //         title: "New Pending Order",
  //         body: "You have a new pending order!",
  //         sound: true,
  //         subtitle: "Check your orders for details.",
  //         priority: Notifications.AndroidNotificationPriority.HIGH,
  //       },
  //       trigger: {
  //         seconds: 1,
  //         repeats: false,
  //         channelId: "default",
  //       },
  //     });
  //   };

  //   if (
  //     prevPendingOrdersLength.current === 0 &&
  //     pendingOrders?.length !== prevPendingOrdersLength.current
  //   ) {
  //     prevPendingOrdersLength.current = pendingOrders?.length || 0;
  //   }
  //   if (pendingOrders?.length > prevPendingOrdersLength.current) {
  //     console.log("🔔 Notification: New pending order");
  //     sendNotification();
  //   }

  //   prevPendingOrdersLength.current = pendingOrders?.length || 0;
  // }, [pendingOrders?.length]);

  // //Confirmed orders notification watcher
  // useEffect(() => {
  //   const sendNotification = async () => {
  //     await Notifications.scheduleNotificationAsync({
  //       content: {
  //         title: "New Confirmed Order",
  //         body: "You have a new confirmed order!",
  //         sound: true,
  //         subtitle: "Check your orders for details.",
  //         priority: Notifications.AndroidNotificationPriority.HIGH,
  //       },
  //       trigger: {
  //         seconds: 1,
  //         repeats: false,
  //         channelId: "default",
  //       },
  //     });
  //   };

  //   if (
  //     prevConfirmedOrdersLength.current === 0 &&
  //     confirmedOrders?.length !== prevConfirmedOrdersLength.current
  //   ) {
  //     prevConfirmedOrdersLength.current = confirmedOrders?.length || 0;
  //   }
  //   if (confirmedOrders?.length > prevConfirmedOrdersLength.current) {
  //     console.log("🔔 Notification: new confirmed order");
  //     sendNotification();
  //   }

  //   console.log("Confirmed orders length:", confirmedOrders?.length);
  //   console.log(
  //     "Previous confirmed orders length:",
  //     prevConfirmedOrdersLength.current
  //   );
  //   prevConfirmedOrdersLength.current = confirmedOrders?.length || 0;
  // }, [confirmedOrders?.length]);

  return null;
};

export default NotificationWatcher;
