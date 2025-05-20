import { Text, View, FlatList, TextInput, RefreshControl } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { BadgeDollarSign, Search } from "lucide-react-native";
import { voucherApi } from "@/api/customer/voucherApi";
import { VoucherResponse, Voucher } from "@/types/Voucher";
import debounce from "lodash.debounce";
import { useAuth } from "@/provider/AuthProvider";
import { useTabVisibility } from "@/provider/TabVisibilityProvider";

// Add proper type for the auth context
interface AuthContext {
  user: { type: string } | null;
  isLoading: boolean;
}

export default function VoucherScreen() {
  const { user, isLoading } = useAuth() as AuthContext;
  const [voucherData, setVoucherData] = useState<VoucherResponse | null>(null);
  const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>([]);
  const [search, setSearch] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const { setTabVisible } = useTabVisibility();

  useEffect(() => {
    fetchVouchers();
  }, [user, isLoading]);

  // Fetch vouchers with better null checks
  const fetchVouchers = async () => {
    if (isLoading || !user) return;

    try {
      const response = await voucherApi.fetchVouchers(user);
      let data: VoucherResponse | null = null;

      if (typeof response === "string") {
        try {
          data = JSON.parse(response) as VoucherResponse;
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          data = null;
        }
      } else {
        data = response as VoucherResponse;
      }

      // Filter out expired vouchers with null checks
      if (data?.vouchers?.length) {
        const currentDate = new Date();
        const activeVouchers = data.vouchers.filter((voucher: Voucher) => {
          if (!voucher?.expired_at) return false;
          if (voucher?.used_at) return false;

          const expiryDate = new Date(voucher.expired_at);
          return expiryDate > currentDate;
        });

        data = { ...data, vouchers: activeVouchers };
      }

      setVoucherData(data);
      setFilteredVouchers(data?.vouchers ?? []);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
      setVoucherData(null);
      setFilteredVouchers([]);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Call the fetch function
    fetchVouchers();

    // Force the loading indicator to disappear after 3 seconds
    setTimeout(() => {
      setRefreshing(false);
    }, 3000);
  }, [fetchVouchers]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Debounced search with null checks
  const debouncedSearch = useCallback(
    debounce((searchText: string) => {
      if (!searchText?.trim() || !voucherData?.vouchers?.length) {
        setFilteredVouchers(voucherData?.vouchers ?? []);
        return;
      }

      const query = searchText.toLowerCase().trim();
      const results = voucherData.vouchers.filter((voucher) => {
        return (
          voucher?.code?.toLowerCase().includes(query) ||
          voucher?.description?.toLowerCase().includes(query) ||
          voucher?.value?.toString().includes(query) ||
          voucher?.min_order_price?.toString().includes(query) ||
          (query === "yes" && voucher?.is_percent) ||
          (query === "no" && !voucher?.is_percent)
        );
      });

      setFilteredVouchers(results);
    }, 300),
    [voucherData]
  );

  const handleInputChange = (text: string) => {
    setSearch(text);
    debouncedSearch(text);
  };

  // Render voucher item with null checks
  const renderVoucherItem = ({ item }: { item: Voucher }) => {
    if (!item) return null;

    const today = new Date();
    const expiryDate = new Date(item.expired_at ?? "");
    const daysRemaining = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    let expiryTextClass = "font-medium text-sm mt-1 ";
    if (daysRemaining <= 3) {
      expiryTextClass += "text-red-600";
    } else if (daysRemaining <= 7) {
      expiryTextClass += "text-orange-500";
    } else if (daysRemaining <= 14) {
      expiryTextClass += "text-amber-400";
    } else {
      expiryTextClass += "text-gray-600";
    }

    return (
      <View className="rounded-md w-full shadow-sm bg-card px-2 py-4 flex flex-row flex-wrap items-center mt-2 h-auto">
        <View className="w-1/5 min-w-[55px] flex items-center">
          <BadgeDollarSign size={55} color={"#285A2C"} />
        </View>

        <View className="ml-4 flex-1 min-w-[200px]">
          <View className="flex flex-row items-center justify-between flex-wrap">
            <Text className="font-bold text-lg sm:text-2xl">
              Code: {item.code ?? "N/A"}
            </Text>

            <Text className="text-black bg-primaryLight rounded-full px-2 mt-2 sm:mt-0">
              Percent: {item?.is_percent ? "Yes" : "No"}
            </Text>
          </View>

          <Text className="font-medium text-base sm:text-lg mt-2">
            Value:{" "}
            {item?.is_percent ? `${item.value ?? 0}%` : `₱${item.value ?? 0}`}
          </Text>

          <Text className="font-medium text-base sm:text-lg">
            Min. Order Price: ₱{item?.min_order_price ?? 0}
          </Text>

          <Text className={expiryTextClass}>
            Expires:{" "}
            {item.expired_at_readable ??
              new Date(item.expired_at ?? "").toLocaleDateString()}
            {daysRemaining <= 3 ? " (Expiring soon!)" : ""}
          </Text>

          <View className="bg-divider h-[2px] mt-2 w-full" />
          <Text className="font-medium text-sm sm:text-md mt-2">
            {item?.description ?? "No description available"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 px-3">
      <View className="mt-2 flex flex-row items-center justify-between">
        <Text className="text-xl font-bold">My Vouchers</Text>
      </View>
      <View className="mt-4 relative">
        <TextInput
          className="h-12 border border-gray-300 rounded-lg pl-12 pr-12"
          placeholder="Search vouchers..."
          value={search}
          onChangeText={handleInputChange}
          onFocus={() => setTabVisible(false)}
          onBlur={() => setTabVisible(true)}
        />
        <View className="absolute left-3 top-3">
          <Search size={24} color={"#BFBFBF"} />
        </View>
        {search.length > 0 && (
          <View className="absolute right-3 top-3">
            <Text
              onPress={() => {
                setSearch("");
                setFilteredVouchers(voucherData?.vouchers || []);
              }}
              className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-center"
            >
              ✕
            </Text>
          </View>
        )}
      </View>
      <View className="mt-4 flex-1">
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={filteredVouchers ?? []}
          renderItem={renderVoucherItem}
          keyExtractor={(item) =>
            item?.id?.toString() ?? Math.random().toString()
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text className="text-center mt-4">
              {search?.length > 0
                ? "No matching vouchers found"
                : "No vouchers available"}
            </Text>
          }
          ListFooterComponent={<View style={{ height: 20 }} />}
          showsVerticalScrollIndicator={true}
        />
      </View>
    </SafeAreaView>
  );
}
