import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Welcome() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    if (!name.trim() || !age.trim()) return;

    await AsyncStorage.setItem('userProfile', JSON.stringify({ name, age: parseInt(age) }));
    router.replace('/');
  };

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black px-8">
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
