
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { BottomSheetView, BottomSheetTextInput } from "@gorhom/bottom-sheet";

export interface FormData {
  address: string;
  note: string;
  voucher_code: string;
}

interface SheetContentProps {
  onClose: () => void;
  onPreview: (data: FormData) => void;
  onConfirm: (data: FormData) => void;
  voucherError?: string;
  isPreviewClicked?: boolean;
  previewItem?: any;
  resetForm?: boolean;
}

const CheckoutBottomSheet = ({
  onClose,
  onPreview,
  onConfirm,
  voucherError,
  isPreviewClicked = false,
  previewItem = null,
  resetForm = false,
}: SheetContentProps) => {

  const [form, setForm] = useState<FormData>({
    address: "",
    note: "",
    voucher_code: "",
  });

  useEffect(() => {
    if (resetForm) {
      setForm({
        address: "",
        note: "",
        voucher_code: "",
      });
    }
  }, [resetForm]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePreview = () => {
    onPreview(form);
  };

  const handleConfirm = () => {
    onConfirm(form);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
      style={{ flex: 1 }}
    >
      <BottomSheetView>
        <View className="p-4">
          <Text className="font-bold text-2xl">Confirm Checkout</Text>
          {voucherError && (
            <Text className="text-red-500 e mt-2 text-center">
              {voucherError}
            </Text>
          )}

          {/* Address */}
          <View className="mt-6">
            <Text className="text-black font-pbold text-lg">
              Address
              <Text className="text-red-500"> *</Text>
            </Text>
            <View className="w-full h-14 border border-gray-300 rounded-lg flex-row items-center px-4 mt-3">
              <BottomSheetTextInput
                value={form.address}
                onChangeText={(value) => handleInputChange("address", value)}
                className="flex-1"
                placeholder="Enter address"
              />
            </View>
          </View>

          {/* Note  */}
          <Text className="text-black font-pbold text-lg mt-4">Note</Text>
          <View className="w-full h-14 border border-gray-300 rounded-lg flex-row items-center px-4 mt-3">
            <BottomSheetTextInput
              value={form.note}
              onChangeText={(value) => handleInputChange("note", value)}
              className="flex-1"
              placeholder="Enter note (Optional)"
            />
          </View>

          {/* Voucher code  */}
          <Text className="text-black font-pbold text-lg mt-4">
            Voucher code
          </Text>
          <View className="w-full h-14 border border-gray-300 rounded-lg flex-row items-center px-4 mt-3">
            <BottomSheetTextInput
              value={form.voucher_code}
              onChangeText={(value) => handleInputChange("voucher_code", value)}
              className="flex-1"
              placeholder="Enter voucher code (Optional)"
            />
          </View>

          {/* Preview order */}
          {isPreviewClicked && (
            <View className="mt-8 flex justify-end">
              <Text className="text-lg font-bold text-right">
                Order Summary
              </Text>
              <Text className="font-medium text-right py-1">
                Subtotal: ₱{previewItem?.total_item_price}
              </Text>
              <Text className="font-medium text-right py-1">
                Delivery fee: ₱{previewItem?.shipping_fee}
              </Text>
              <Text className="font-medium text-right py-1">
                Discount:{" "}
                {previewItem?.discount === null || previewItem?.discount === 0
                  ? "0"
                  : `₱${previewItem?.discount}`}
              </Text>
              <Text className="font-medium text-right py-1">
                Total: ₱{previewItem?.final_price}
              </Text>
            </View>
          )}

          {/* Button */}
          <View className="flex flex-row justify-center items-center mt-6 gap-x-10">
            <TouchableOpacity activeOpacity={1} onPress={onClose}>
              <View className="bg-gray-300 h-12 px-3 rounded-md flex justify-center items-center w-32 ">
                <Text className="text-lg font-semibold">Close</Text>
              </View>
            </TouchableOpacity>
            {!isPreviewClicked && (
              <TouchableOpacity
                disabled={form.address === ""}
                onPress={handlePreview}
                activeOpacity={1}
              >
                <View
                  className={`bg-primary h-12 px-3 rounded-md flex justify-center items-center w-40 ${
                    form.address === "" ? "opacity-50" : ""
                  }`}
                >
                  <Text className="text-lg font-semibold text-white">
                    Preview Order
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {isPreviewClicked && (
              <TouchableOpacity onPress={handleConfirm} activeOpacity={1}>
                <View className="bg-primary h-12 px-3 rounded-md flex justify-center items-center w-48">
                  <Text className="text-lg font-semibold text-white">
                    Confirm Checkout
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </BottomSheetView>
    </KeyboardAvoidingView>
  );
};

export default CheckoutBottomSheet;
