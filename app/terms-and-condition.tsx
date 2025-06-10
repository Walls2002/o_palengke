import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";

const TermsAndConditions = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <ScrollView className="flex-1">
        <View className="items-center mb-6">
          <Text className="text-lg font-bold text-center">
            Terms and Conditions
          </Text>
        </View>
        <View className="mb-4">
          <Text className="text-base mb-2">
            Welcome to our platform. Please read these Terms and Conditions
            carefully before using our services.
          </Text>
          <Text className="text-lg font-semibold mb-2">
            1. Acceptance of Terms
          </Text>
          <Text className="text-base mb-4">
            By accessing or using our website, you agree to be bound by these
            Terms and Conditions and our Privacy Policy.
          </Text>
          <Text className="text-lg font-semibold mb-2">
            2. User Responsibilities
          </Text>
          <Text className="text-base mb-2">Users must:</Text>
          <View className="ml-4 mb-4">
            <Text className="text-base">
              • Provide accurate and up-to-date information during registration
              and use of the platform.
            </Text>
            <Text className="text-base">
              • Maintain the confidentiality of your account credentials.
            </Text>
            <Text className="text-base">
              • Comply with all applicable laws and regulations.
            </Text>
          </View>
          <Text className="text-lg font-semibold mb-2">
            3. Prohibited Activities
          </Text>
          <Text className="text-base mb-2">Users must not:</Text>
          <View className="ml-4 mb-4">
            <Text className="text-base">
              • Use the platform for unlawful or fraudulent purposes.
            </Text>
            <Text className="text-base">
              • Attempt to gain unauthorized access to other accounts or
              systems.
            </Text>
            <Text className="text-base">
              • Post or transmit harmful, offensive, or inappropriate content.
            </Text>
          </View>
          <Text className="text-lg font-semibold mb-2">
            4. Limitation of Liability
          </Text>
          <Text className="text-base mb-4">
            We are not liable for any damages arising from your use of the
            platform. Use the services at your own risk.
          </Text>
          <Text className="text-lg font-semibold mb-2">
            5. Changes to Terms
          </Text>
          <Text className="text-base mb-4">
            We reserve the right to update or modify these Terms and Conditions
            at any time. Continued use of the platform constitutes acceptance of
            the new terms.
          </Text>
          <Text className="text-lg font-semibold mb-2">6. Contact Us</Text>
          <Text className="text-base mb-4">
            If you have any questions about these Terms and Conditions, please
            contact us through our support page.
          </Text>
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={() => router.push("/login")}
        className="w-[300px] h-12 bg-primary rounded-lg justify-center items-center self-center mb-4"
      >
        <Text className="text-white text-lg font-semibold">Back to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default TermsAndConditions;
