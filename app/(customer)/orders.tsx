import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  useWindowDimensions,
  TouchableOpacity,
  AppState,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TabView, SceneMap } from "react-native-tab-view";
import {
  BadgeCheck,
  Ban,
  ClockFading,
  PackageCheck,
} from "lucide-react-native";
import PendingScreen from "@/app/screen/PendingScreen";
import ConfirmedScreen from "@/app/screen/ConfirmedScreen";
import DeliveredScreen from "@/app/screen/DeliveredScreen";
import CancelScreen from "@/app/screen/CancelScreen";
import { useOrderContext } from "@/provider/OrderProvider";

export default function OrderScreen() {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const previousIndex = useRef(0);
  const {
    fetchPendingOrders,
    fetchConfirmedOrders,
    fetchDeliveredOrders,
    fetchCancelledOrders,
    pendingOrders,
    confirmedOrders,
    deliveredOrders,
    cancelledOrders,
  } = useOrderContext();
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [appActive, setAppActive] = useState(true);
  // Add state variables to track count changes
  const [pendingUpdated, setPendingUpdated] = useState<boolean>(false);
  const [confirmedUpdated, setConfirmedUpdated] = useState<boolean>(false);
  const [deliveredUpdated, setDeliveredUpdated] = useState<boolean>(false);
  const [cancelledUpdated, setCancelledUpdated] = useState<boolean>(false);
  const [lastRefreshTimes, setLastRefreshTimes] = useState<
    Record<number, number>
  >({
    0: 0, // pending
    1: 0, // confirmed
    2: 0, // delivered
    3: 0, // cancelled
  });
  const [routes] = useState([
    { key: "pending", title: "Pending" },
    { key: "confirmed", title: "Confirmed" },
    { key: "delivered", title: "Delivered" },
    { key: "cancel", title: "Cancel" },
  ]);

  const renderScene = SceneMap({
    pending: PendingScreen,
    confirmed: ConfirmedScreen,
    delivered: DeliveredScreen,
    cancel: CancelScreen,
  });

  // Previous counts for comparison
  const prevCounts = useRef({
    pending: (pendingOrders && pendingOrders?.length) || 0,
    confirmed: (confirmedOrders && confirmedOrders?.length) || 0,
    delivered: (deliveredOrders && deliveredOrders?.length) || 0,
    cancelled: (cancelledOrders && cancelledOrders?.length) || 0,
  });

  useEffect(() => {
    // Clear notification for current tab whenever it becomes focused
    if (index === 0) setPendingUpdated(false);
    if (index === 1) setConfirmedUpdated(false);
    if (index === 2) setDeliveredUpdated(false);
    if (index === 3) setCancelledUpdated(false);
  }, [index]);

  /**
   * useEffect hook to set up polling for refreshing the current tab's data.
   *
   * - The polling interval is adaptive based on the currently selected tab (`index`)
   *   and the app's active state (`appActive`).
   * - Critical tabs (e.g., Pending and Confirmed) are polled more frequently, while
   *   less critical tabs (e.g., Delivered and Cancelled) are polled less frequently.
   * - When the app is in the background, polling frequency is reduced to conserve resources.
   * - The polling interval is cleared when the component unmounts or when dependencies change.
   *
   * Dependencies:
   * - `index`: Determines the currently selected tab and adjusts the polling frequency accordingly.
   * - `appActive`: Adjusts polling frequency based on whether the app is in the foreground or background.
   * - `pollingInterval`: Ensures the previous interval is cleared before setting a new one.
   */
  useEffect(() => {
    let pollingTime = 10000;

    // Critical tabs poll more frequently
    // Critical tabs poll more frequently
    if (index === 0 || index === 1) {
      pollingTime = 8000;
    } else {
      pollingTime = 15000;
    }

    if (!appActive) pollingTime = 30000;

    const interval = setInterval(() => {
      refreshCurrentTab(index);
    }, pollingTime);

    setPollingInterval(interval);

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [index, appActive]);

  useEffect(() => {
    // Fetch data immediately when the component mounts
    refreshCurrentTab(index);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        setAppActive(true);
        // Immediate refresh when app comes to foreground
        refreshCurrentTab(index);
      } else {
        setAppActive(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [index]);

  // For pending orders
  useEffect(() => {
    if (
      pendingOrders?.length !== undefined &&
      pendingOrders?.length !== prevCounts.current.pending
    ) {
      prevCounts.current.pending = pendingOrders.length;
      if (index !== 0) setPendingUpdated(true);
    }
  }, [pendingOrders, index]);

  // For confirmed orders
  useEffect(() => {
    if (
      confirmedOrders?.length !== undefined &&
      confirmedOrders?.length !== prevCounts.current.confirmed
    ) {
      prevCounts.current.confirmed = confirmedOrders.length;
      if (index !== 1) setConfirmedUpdated(true);
    }
  }, [confirmedOrders, index]);

  // For delivered orders
  useEffect(() => {
    if (
      deliveredOrders?.length !== undefined &&
      deliveredOrders?.length !== prevCounts.current.delivered
    ) {
      prevCounts.current.delivered = deliveredOrders.length;
      if (index !== 2) setDeliveredUpdated(true);
    }
  }, [deliveredOrders, index]);

  // For cancelled orders
  useEffect(() => {
    if (
      cancelledOrders?.length !== undefined &&
      cancelledOrders?.length !== prevCounts.current.cancelled
    ) {
      prevCounts.current.cancelled = cancelledOrders.length;
      if (index !== 3) setCancelledUpdated(true);
    }
  }, [cancelledOrders, index]);

  //Event handlers
  const handleIndexChange = (newIndex: number) => {
    previousIndex.current = index;
    setIndex(newIndex);

    // Reset update flag for the tab we're moving to
    if (newIndex === 0) setPendingUpdated(false);
    if (newIndex === 1) setConfirmedUpdated(false);
    if (newIndex === 2) setDeliveredUpdated(false);
    if (newIndex === 3) setCancelledUpdated(false);

    // When tab changes, fetch the relevant data for that tab
    refreshCurrentTab(newIndex);
  };

  const refreshCurrentTab = (tabIndex: number) => {
    const now = Date.now();
    const minTimeBetweenRequests = 3000; // 3 seconds

    // Don't allow rapid consecutive requests to the same endpoint
    if (now - lastRefreshTimes[tabIndex] < minTimeBetweenRequests) {
      return;
    }

    setLastRefreshTimes((prev) => ({
      ...prev,
      [tabIndex]: now,
    }));

    switch (tabIndex) {
      case 0:
        fetchPendingOrders?.();
        break;
      case 1:
        fetchConfirmedOrders?.();
        break;
      case 2:
        fetchDeliveredOrders?.();
        break;
      case 3:
        fetchCancelledOrders?.();
    }
  };

  const renderTabBar = (props: any) => {
    const tabWidth = Math.floor((layout.width - 8) / 4);

    return (
      <View style={{ flexDirection: "row", marginTop: 10 }}>
        {props.navigationState.routes.map((route: any, i: number) => {
          const focused = props.navigationState.index === i;

          let bgColor = "transparent";
          if (focused) {
            switch (route.key) {
              case "pending":
                bgColor = "transparent";
                break;
              case "confirmed":
                bgColor = "transparent";
                break;
              case "delivered":
                bgColor = "transparent";
                break;
              case "cancel":
                bgColor = "transparent";
                break;
              default:
                bgColor = "transparent";
            }
          }

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              key={route.key}
              onPress={() => setIndex(i)}
              style={{
                flex: 1,
                alignItems: "center",
                backgroundColor: bgColor,
                borderRadius: 8,
                marginHorizontal: 1,
                paddingVertical: 5,
                width: tabWidth,

                borderColor: focused ? "#D0D0D0" : "transparent",
              }}
            >
              {/* {((i === 0 && pendingUpdated) ||
                (i === 1 && confirmedUpdated) ||
                (i === 2 && deliveredUpdated) ||
                (i === 3 && cancelledUpdated)) &&
                !focused && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      right: tabWidth * 0.25,
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "#FF4040",
                      zIndex: 1,
                    }}
                  />
                )} */}
              {/* Icon */}
              {route.key === "pending" && (
                <ClockFading
                  color={focused ? "#285A2C" : "#A0A0A0"}
                  size={24}
                />
              )}
              {route.key === "confirmed" && (
                <BadgeCheck color={focused ? "#285A2C" : "#A0A0A0"} size={24} />
              )}
              {route.key === "delivered" && (
                <PackageCheck
                  color={focused ? "#285A2C" : "#A0A0A0"}
                  size={24}
                />
              )}
              {route.key === "cancel" && (
                <Ban color={focused ? "#285A2C" : "#A0A0A0"} size={24} />
              )}

              {/* Label */}
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: focused ? "bold" : "normal",
                  color: focused ? "#285A2C" : "#A0A0A0",
                  textAlign: "center",
                  marginTop: 4,
                }}
              >
                {route.title}
              </Text>

              {/* Custom indicator */}
              {focused && (
                <View
                  style={{
                    position: "absolute",
                    bottom: -1,
                    height: 3,
                    width: tabWidth * 0.7,
                    backgroundColor: "#285A2C",
                    borderRadius: 1.5,
                  }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 px-3">
      <View className="mt-2 flex flex-row items-center justify-between">
        <Text className="text-xl font-bold">My Orders</Text>
      </View>

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={handleIndexChange}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        swipeEnabled={false}
        animationEnabled={false}
        lazy={false}
      />
    </SafeAreaView>
  );
}
