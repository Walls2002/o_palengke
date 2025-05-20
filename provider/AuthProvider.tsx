// context/auth.js
import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
interface AuthContextType {
  user: string | null;
  isLoading: boolean;
  userType: string | null;
  setUser: React.Dispatch<React.SetStateAction<string | null>>;
  setUserType: React.Dispatch<React.SetStateAction<string | null>>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Load user from AsyncStorage when the app starts
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const userJSON = await AsyncStorage.getItem("user");
      const userTypeJSON = await AsyncStorage.getItem("user_type");
      
      setUser(userJSON ? JSON.parse(userJSON) : null);
      setUserType(userTypeJSON ? userTypeJSON : null);
    } catch (error) {
      console.error("Failed to load user", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      // Remove token and user data from AsyncStorage
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("user_type");
      setUser(null);
      setUserType(null);
      // Redirect to the public screen
      setTimeout(() => {
        router.replace("/(public)");
      }, 1500);
    } catch (error) {
      console.error("Logout failed", error);
    }
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        userType,
        setUser,
        setUserType,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
