import { useState, useEffect, useRef, useCallback } from "react";
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Store } from "lucide-react-native";
import { cartApi } from "@/api/customer/cartApi";
import { useOrderContext } from "@/provider/OrderProvider";
import {
  BottomSheetModalProvider,
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useCart } from "@/provider/CartProvider";
import formatKiloMeasurement from "@/utils/formatKiloMeasurement";
import { useTabVisibility } from "@/provider/TabVisibilityProvider";
import { voucherApi } from "@/api/customer/voucherApi";
import { useAuth } from "@/provider/AuthProvider";
import CheckoutBottomSheet from "@/app/(customer)/_components/CheckoutBottomSheet";
import { FormData } from "@/app/(customer)/_components/CheckoutBottomSheet";

export default function CartScreen() {
  //States
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [storeId, setStoreId] = useState<number>(0);
  const [isPreviewClicked, setIsPreviewClicked] = useState<boolean>(false);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const { cartItems, isLoading, refreshCart } = useCart();
  const { fetchPendingOrders } = useOrderContext();
  const [updatingQuantity, setUpdatingQuantity] = useState<boolean>(false);
  const initialLoading = isLoading && cartItems.length === 0;
  const { setTabVisible } = useTabVisibility();
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [validatingVoucher, setValidatingVoucher] = useState<boolean>(false);
  const [storeTotal, setStoreTotal] = useState<number>(0);
  const [resetFormFlag, setResetFormFlag] = useState<boolean>(false);
  const { user } = useAuth();

  //Hooks
  //Fetch cart
  useEffect(() => {
    refreshCart();
  }, []);

  //Event handler
  const handleCheckout = (itemId: number, storeTotal: number) => {
    setStoreId(itemId);
    setTabVisible(false);
    setStoreTotal(storeTotal);
    bottomSheetModalRef.current?.present();
  };

  const handleCloseModal = () => {
    bottomSheetModalRef.current?.close();
    setTabVisible(true);
    setVoucherError(null);
    setTimeout(() => {
      setResetFormFlag((prev) => !prev);
      setIsPreviewClicked(false);
    }, 300);
  };

  // Validates address and shows error if needed
  const validateAddress = (data: FormData) => {
    if (!data.address.trim()) {
      Toast.show({
        type: "error",
        position: "top",
        text1: "Please enter your delivery address",
        visibilityTime: 3000,
      });
      return false;
    }
    return true;
  };

  // Validates if voucher meets minimum order requirements
  const validateVoucherMinimumOrder = async (formData: FormData) => {
    if (!formData.voucher_code.trim()) return true;
    setValidatingVoucher(true);

    try {
      const vouchersResponse = await voucherApi.fetchVouchers(
        user ? { type: user } : null
      );

      if (!vouchersResponse?.vouchers) return true;

      const enteredVoucher = vouchersResponse.vouchers.find(
        (v: any) => v.code.toLowerCase() === formData.voucher_code.toLowerCase()
      );

      if (!enteredVoucher) return true;

      const minOrderPrice = parseFloat(enteredVoucher.min_order_price || "0");
      if (storeTotal < minOrderPrice) {
        setVoucherError(
          `Minimum order of ₱${minOrderPrice} required for this voucher`
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating voucher minimum order:", error);
      return true;
    }
  };

  // Process API response for voucher validation
  const processVoucherValidation = (response: any, formData: FormData) => {
    if (!formData.voucher_code.trim()) return;

    // Check if API returned an error message
    if (response?.voucher_error) {
      setVoucherError(response.voucher_error);
      setIsPreviewClicked(false);
      return;
    }

    // Check minimum order price requirement
    if (
      response?.total_item_price &&
      response?.min_order_price &&
      parseFloat(response.total_item_price) <
        parseFloat(response.min_order_price)
    ) {
      setVoucherError(
        `Minimum order of ₱${response.min_order_price} required for this voucher`
      );
      setIsPreviewClicked(false);
      return;
    }

    // Generic error if discount is 0 or null
    if (!response?.discount || response?.discount === 0) {
      setVoucherError("Invalid code or expired voucher.");
      setIsPreviewClicked(false);
      return;
    }

    setVoucherError(null);
  };

  // Handle API error responses
  const handleApiError = (error: any, formData: FormData) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 422 && formData.voucher_code.trim()) {
        handleVoucherValidationError(error, formData);
      } else if (status === 404) {
        setVoucherError("Voucher code not found");
        setIsPreviewClicked(false);
      } else if (error.response.data?.message) {
        setVoucherError(error.response.data.message);
        setIsPreviewClicked(false);
      } else {
        setVoucherError("Error applying voucher");
        setIsPreviewClicked(false);
      }
    } else if (error.request) {
      setVoucherError("Network error, please try again");
      setIsPreviewClicked(false);
    } else {
      setVoucherError("Error applying voucher");
      setIsPreviewClicked(false);
    }
  };

  // Handle validation errors specifically
  const handleVoucherValidationError = (error: any, formData: FormData) => {
    if (
      error.response.data?.errors?.voucher_code ||
      error.response.data?.message?.includes("voucher")
    ) {
      setVoucherError("Invalid voucher code: This voucher doesn't exist");
      setIsPreviewClicked(false);
      clearVoucherAndRetry(formData);
    } else {
      setVoucherError("Error validating voucher");
      setIsPreviewClicked(false);
    }
  };

  // Clear voucher and retry the preview
  const clearVoucherAndRetry = (formData: FormData) => {
    const payloadWithoutVoucher = {
      address: formData.address,
      note: formData.note,
      voucher_code: "",
    };

    cartApi
      .previewItem(storeId, payloadWithoutVoucher)
      .then((response) => {
        setPreviewItem(response);
      })
      .catch((innerError) => {
        console.error("Error previewing order without voucher:", innerError);
        Toast.show({
          type: "error",
          position: "top",
          text1: "Failed to preview order",
          visibilityTime: 3000,
        });
      });
  };

  //Handle preview order
  const handlePreviewOrder = useCallback(
    async (formData: FormData) => {
      setIsPreviewClicked(true);
      setTabVisible(false);
      setVoucherError(null);

      // Validate address
      if (!validateAddress(formData)) {
        setIsPreviewClicked(false);
        return;
      }

      try {
        // Validate voucher minimum order if needed
        if (formData.voucher_code.trim()) {
          const isVoucherValid = await validateVoucherMinimumOrder(formData);
          if (!isVoucherValid) {
            setIsPreviewClicked(false);
            setValidatingVoucher(false);
            return;
          }
        }

        const payload = {
          address: formData.address,
          note: formData.note,
          voucher_code: formData.voucher_code,
        };

        cartApi
          .previewItem(storeId, payload)
          .then((response) => {
            processVoucherValidation(response, formData);
            setPreviewItem(response);
          })
          .catch((error) => handleApiError(error, formData))
          .finally(() => {
            setValidatingVoucher(false);
          });
      } catch (error) {
        setValidatingVoucher(false);
        setVoucherError("Error previewing order");
        setIsPreviewClicked(false);
      }
    },
    [
      storeId,
      validateVoucherMinimumOrder,
      processVoucherValidation,
      handleApiError,
    ]
  );

  //Handle confirm checkout
  const handleConfirmCheckout = useCallback(
    async (formData: FormData) => {
      const payload = {
        address: formData.address,
        note: formData.note,
        voucher_code: formData.voucher_code,
      };
      cartApi
        .storeOrder(storeId, payload)
        .then((response) => {
          Toast.show({
            type: "success",
            position: "top",
            text1: response?.message || "Order placed successfully",
            visibilityTime: 3000,
            text1Style: {
              fontSize: 18,
              fontWeight: "bold",
            },
          });
          setTimeout(() => {
            refreshCart();
            fetchPendingOrders();
            handleCloseModal();
          }, 500);
        })
        .catch((error) => {
          console.error("Error storing order:", error);
        });
    },
    [storeId, refreshCart, fetchPendingOrders, handleCloseModal]
  );

  const handleClearCart = async () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to clear all items from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, Clear Cart",
          style: "destructive",
          onPress: async () => {
            try {
              await cartApi.clearCart();
              refreshCart();
              Toast.show({
                type: "success",
                position: "top",
                text1: "Cart cleared successfully",
                visibilityTime: 2000,
              });
            } catch (error) {
              console.error("Error clearing cart:", error);
              Toast.show({
                type: "error",
                position: "top",
                text1: "Failed to clear cart",
                visibilityTime: 2000,
              });
            }
          },
        },
      ]
    );
  };

  const handleIncreaseQuantity = async (
    productId: number,
    kiloMeasurement: string | null
  ) => {
    try {
      let payload = {};
      setUpdatingQuantity(true);
      if (kiloMeasurement) {
        let kiloValue: number;
        if (kiloMeasurement === "1/4") {
          kiloValue = 0.25;
        } else if (kiloMeasurement === "1/2") {
          kiloValue = 0.5;
        } else {
          kiloValue = parseFloat(kiloMeasurement);
        }
        payload = { kilo_measurement: kiloValue };
      } else {
        payload = { quantity: 1 };
      }

      // Make API call to add item to cart
      if (kiloMeasurement) {
        let kiloValue: number;
        if (kiloMeasurement === "1/4") {
          kiloValue = 0.25;
        } else if (kiloMeasurement === "1/2") {
          kiloValue = 0.5;
        } else {
          kiloValue = parseFloat(kiloMeasurement);
        }
        await cartApi.increaseItemQuantity(productId, kiloValue);
      } else {
        await cartApi.increaseItemQuantity(productId, 1);
      }

      // Refresh cart data
      setTimeout(() => {
        refreshCart();
      }, 300);
    } catch (error) {
      console.error("Error increasing item quantity:", error);
      Toast.show({
        type: "error",
        position: "top",
        text1: "Failed to increase quantity",
        visibilityTime: 2000,
      });
    } finally {
      setUpdatingQuantity(false);
    }
  };

  const handleDecreaseQuantity = async (
    productId: number,
    quantity: number
  ) => {
    try {
      const clear = quantity <= 1;
      await cartApi.decreaseItemQuantity(productId, clear);
      refreshCart();
    } catch (error) {
      console.error("Error decreasing item quantity:", error);
      Toast.show({
        type: "error",
        position: "top",
        text1: "Failed to decrease quantity",
        visibilityTime: 2000,
      });
    }
  };

  return (
    <GestureHandlerRootView>
      <SafeAreaView className="flex-1 px-3">
        <BottomSheetModalProvider>
          <View className="mt-2 flex flex-row items-center justify-between">
            <Text className="text-xl font-bold">My Cart</Text>
            <TouchableOpacity activeOpacity={1} onPress={handleClearCart}>
              <View className="bg-red-500 rounded-md h-10 px-3 flex justify-center items-center">
                <Text className="text-white font-medium">Clear cart</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Item for a specific store */}
          {initialLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#285A2C" />
            </View>
          ) : cartItems && cartItems.length > 0 ? (
            <FlatList
              data={cartItems}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View className="mt-4">
                  <View className="flex flex-row items-center mb-2 gap-x-2">
                    <Store size={24} color={"#285A2C"} className="mr-2" />
                    <Text className="font-bold text-lg text-primary">
                      Store: {item.name}
                    </Text>
                  </View>
                  {/* Product item */}
                  {item?.products &&
                    item.products.map((product, productIndex) => {
                      return (
                        <View
                          key={productIndex}
                          className="rounded-md w-full shadow-sm bg-card px-2 py-4  mt-2 h-auto"
                        >
                          <View className="flex flex-row items-center justify-between w-full ">
                            <Text className="font-bold text-lg text-primary w-full">
                              <View className=" flex-row items-center justify-between w-full">
                                <Text className="font-bold text-lg text-primary">
                                  {product?.name || "Product"}
                                </Text>
                                <Text className="font-bold text-lg text-primary">
                                  ₱{product?.total_cost || "0.00"}
                                </Text>
                              </View>
                            </Text>
                          </View>
                          <Text className="text-textSecondary text-right">
                            {product?.measurement === "kilo" &&
                            product?.kilo_measurement
                              ? `${formatKiloMeasurement(
                                  product.kilo_measurement
                                )} ${product.measurement}`
                              : `${product?.selected_qty || 0} ${
                                  product?.measurement || "unit"
                                }`}
                          </Text>
                          <View className="mt-4 flex flex-row justify-end items-center gap-x-4">
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() =>
                                handleDecreaseQuantity(
                                  product.id,
                                  product.selected_qty
                                )
                              }
                            >
                              <View className="rounded-md border border-primaryDark px-3">
                                <Text className="font-bold text-lg">-</Text>
                              </View>
                            </TouchableOpacity>
                            <View>
                              <Text> {product.selected_qty}</Text>
                            </View>
                            <TouchableOpacity
                              activeOpacity={0.7}
                              onPress={() =>
                                handleIncreaseQuantity(
                                  product.id,
                                  product.kilo_measurement
                                    ? product.kilo_measurement === 0.25
                                      ? "1/4"
                                      : product.kilo_measurement === 0.5
                                      ? "1/2"
                                      : product.kilo_measurement.toString()
                                    : null
                                )
                              }
                            >
                              <View className="rounded-md border border-primaryDark px-3">
                                <Text className="font-bold text-lg">+</Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  <View className="flex flex-row items-center justify-end mt-1">
                    <Text className="font-bold text-lg mt-4">
                      Total: ₱{item.total_price}
                    </Text>
                  </View>
                  <View className=" flex flex-row justify-end">
                    <TouchableOpacity
                      className=" w-32"
                      activeOpacity={1}
                      onPress={() =>
                        handleCheckout(item?.id, item?.total_price)
                      }
                    >
                      <View className=" mt-4">
                        <View className="bg-primary h-10 px-3 rounded-md flex justify-center items-center ml-3 ">
                          <Text className="text-white font-medium">
                            Checkout
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>

                  <View className="bg-divider h-[3px] mt-1" />
                </View>
              )}
            />
          ) : (
            <View className="flex-1 justify-center items-center mt-10">
              <Text className="text-lg font-semibold text-gray-500">
                No items available in the cart
              </Text>
            </View>
          )}
          {/* Bottom modal sheet */}
          <BottomSheetModal
            enablePanDownToClose={false}
            enableHandlePanningGesture={false}
            enableContentPanningGesture={false}
            enableOverDrag={false}
            handleComponent={null}
            key="checkout-modal"
            ref={bottomSheetModalRef}
            index={0}
            snapPoints={["80%"]}
            style={{ borderRadius: 40, overflow: "hidden" }}
            onDismiss={() => {
              setIsPreviewClicked(false);
            }}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            android_keyboardInputMode="adjustResize"
            backdropComponent={(props) => (
              <BottomSheetBackdrop
                {...props}
                pressBehavior={"none"}
                opacity={0.5}
                enableTouchThrough={true}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
              />
            )}
          >
            <CheckoutBottomSheet
              onClose={handleCloseModal}
              onPreview={handlePreviewOrder}
              onConfirm={handleConfirmCheckout}
              voucherError={voucherError ?? undefined}
              isPreviewClicked={isPreviewClicked || false}
              previewItem={previewItem || null}
              resetForm={resetFormFlag || false}
            />
          </BottomSheetModal>
        </BottomSheetModalProvider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
