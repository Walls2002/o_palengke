import images from '@/constants/images';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
export default function HomeScreen() {
  const [currentDay, setCurrentDay] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

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

  return (
    <ScrollView className="px-4 mt-5">
      {/* Page Header */}
      <View className="flex flex-col sm:flex-row justify-between mb-4">
        <View className="mb-3 sm:mb-0">
          <Text className="text-2xl font-bold mb-1">Home</Text>
          <Text className="text-sm text-gray-500">
            <Text className="font-semibold text-blue-600">{currentDay}</Text> &middot; {currentDate} &middot; {currentTime}
          </Text>
        </View>
      </View>

      {/* Welcome Card */}
      <View className="bg-white shadow rounded-2xl mt-5 mb-4 p-5 card-waves">
        <View className="flex flex-col lg:flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-blue-600 mb-2" id="welcomeMessage">Welcome back, 👋</Text>
            <Text className="text-gray-700">
              We’re glad to have you with us again! Whether you’re managing your store, exploring new products, or
              tracking your orders, everything you need is just a click away. Let’s make today productive!
            </Text>
          </View>
          <Image
              source={images.banner}
              className="w-48 h-48"
              resizeMode="contain"
            />
        </View>
      </View>
    </ScrollView>
  );
}
