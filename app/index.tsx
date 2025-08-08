// app/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomTabs from './components/CustomTab';

export default function IndexPage() {
  const [loading, setLoading] = useState(true);
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('userProfile');
        if (userData) {
          setShowInput(false);
        } else {
          setShowInput(true);
        }
      } catch (e) {
        console.error('Gagal baca AsyncStorage:', e);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !age.trim()) return;

    try {
      await AsyncStorage.setItem(
        'userProfile',
        JSON.stringify({ name, age: parseInt(age) })
      );
      setShowInput(false);
    } catch (e) {
      console.error('Gagal simpan userProfile:', e);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-zinc-700 dark:text-white">Memuat aplikasi...</Text>
      </View>
    );
  }

  if (showInput) {
    return (
      <View className="flex-1 items-center justify-center px-8 bg-white dark:bg-black">
        <Text className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
          Selamat datang! Yuk isi data kamu dulu
        </Text>
        <TextInput
          placeholder="Masukkan nama"
          placeholderTextColor="#aaa"
          value={name}
          onChangeText={setName}
          className="w-full px-4 py-3 mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white"
        />
        <TextInput
          placeholder="Masukkan usia"
          placeholderTextColor="#aaa"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
          className="w-full px-4 py-3 mb-6 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white"
        />
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-zinc-900 dark:bg-white px-6 py-3 rounded-xl"
        >
          <Text className="text-white dark:text-zinc-900 font-bold">Lanjutkan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <CustomTabs />;
}

export const unstable_settings = {
  initialRouteName: 'index',
};

export const options = {
  headerShown: false,
};
