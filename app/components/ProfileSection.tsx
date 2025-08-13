// components/ProfileSection.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileSection() {
  const { user, signOut, loading } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  return (
    <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mx-4 my-2">
      {/* User Info */}
      <View className="flex-row items-center mb-4">
        {user?.photoURL ? (
          <Image
            source={{ uri: user.photoURL }}
            className="w-16 h-16 rounded-full"
          />
        ) : (
          <View className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 items-center justify-center">
            <Ionicons name="person" size={32} color="#666" />
          </View>
        )}
        <View className="ml-4 flex-1">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {user?.displayName || 'User'}
          </Text>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {user?.email}
          </Text>
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        onPress={handleSignOut}
        disabled={loading}
        className="flex-row items-center justify-center bg-red-500 rounded-lg p-3 mt-4"
      >
        <Ionicons name="log-out-outline" size={20} color="white" />
        <Text className="text-white font-medium ml-2">
          {loading ? 'Signing Out...' : 'Sign Out'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}