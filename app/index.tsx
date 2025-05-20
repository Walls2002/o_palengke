import { Redirect } from "expo-router";
import { useAuth } from "@/provider/AuthProvider";
import { LogBox } from "react-native";
import Toast from "react-native-toast-message";

LogBox.ignoreAllLogs();

ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.error("Global Error:", error);

  if (isFatal) {
    // alert("A fatal error occurred. Please restart the app.");
    Toast.show({
      type: "error",
      position: "top",
      text1: "Error",
      text2: "A fatal error occurred. Please restart the app.",
      visibilityTime: 3000,
      text1Style: {
        fontSize: 18,
        fontWeight: "bold",
      },
      text2Style: {
        fontSize: 15,
        fontWeight: "semibold",
      },
    });
  }
});

export default function Index() {
  const { user, userType, isLoading } = useAuth() as {
    user: { type: string } | null;
    userType: string;
    isLoading: boolean;
  };

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(public)" />;
  }

  // Redirect based on user type
  if (userType === "customer") {
    return <Redirect href="/(customer)" />;
  } else if (userType === "vendor") {
    return <Redirect href="/(vendor)" />;
  } else if (userType === "rider") {
    return <Redirect href="/(rider)" />;
  }

  // Fallback
  return <Redirect href="/(public)" />;
}
