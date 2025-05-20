import { Text, View, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();

  const redirectoTologin = () => {
    router.push("/(auth)/login");
  };
  return (
    <SafeAreaView className="flex-1 px-3">
      <View className="flex items-center mt-20">
        <Image
          source={require("../../assets/images/no-login.png")}
          className="h-[350px] w-[350px] "
          resizeMode="contain"
        />
      </View>
      <View className="mt-10">
        <Text className="text-center text-2xl font-bold mt-4">
          You are not logged in!
        </Text>
        <Text className="text-center text-md text-textSecondary mt-2">
          Please log in to view your profile
        </Text>
        <View className="mt-10 flex items-center">
          <TouchableOpacity
            activeOpacity={1}
            onPress={redirectoTologin}
            className="w-[300px] h-12 bg-primary rounded-lg justify-center items-center"
          >
            <Text className="text-white text-lg font-semibold">Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
