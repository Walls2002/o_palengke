import Images from '@/constants/images';
import { Profile } from '@/types/Profile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, SafeAreaView } from 'react-native';
export default function HomeScreen() {
  const [currentDay, setCurrentDay] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [user, setUser] = useState<Profile | null>(null);
  

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const day = now.toLocaleDateString('en-US', { weekday: 'long' });
      const date = now.toLocaleDateString('en-US');
      const time = now.toLocaleTimeString('en-US');
      setCurrentDay(day);
      setCurrentDate(date);
      setCurrentTime(time);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await AsyncStorage.getItem("user");
        if (response !== null) {
          const parsedUser = JSON.parse(response);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Error fetching user from storage", error);
      }
    };

    fetchUser();
  }, []);

  return (
   <SafeAreaView>
     <ScrollView className="px-4 mt-5">
      {/* Page Header */}
      <View className="flex flex-col sm:flex-row justify-between mb-4">
        <View className="mb-3 sm:mb-0">
          <Text className="text-2xl font-bold mb-1">Home</Text>
          <Text className="text-sm text-gray-500">
            <Text className="font-semibold">{currentDay}</Text> &middot; {currentDate} &middot; {currentTime}
          </Text>
        </View>
      </View>

      {/* Welcome Card */}
      <View className="bg-white shadow rounded-2xl mt-5 mb-4 p-5 card-waves">
        <View className="flex flex-col lg:flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold mb-2 text-[#337037]" id="welcomeMessage">Welcome back, {user?.first_name} {user?.middle_name} {user?.last_name} 👋</Text>
            <Text className="text-gray-700">
              We’re glad to have you with us again! Whether you’re managing your store, exploring new products, or
              tracking your orders, everything you need is just a click away. Let’s make today productive!
            </Text>
          </View>
          <Image
              source={Images.banner}
              className="w-48 h-48"
              resizeMode="contain"
            />
        </View>
      </View>
    </ScrollView>
   </SafeAreaView>
  );
}
