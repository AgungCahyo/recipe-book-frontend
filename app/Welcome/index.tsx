import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function Welcome() {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isSettingUpProfile, setIsSettingUpProfile] = useState(false);

  const router = useRouter();
  const { signInWithGoogle, loading, error, user, isAuthenticated, hasProfile } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Jangan router.replace di sini, biarkan RootLayout handle redirect
    } catch (err) {
      Alert.alert('Login Error', 'Gagal login dengan Google. Silakan coba lagi.');
    }
  };

  const handleProfileSubmit = async () => {
    if (!name.trim() || !age.trim()) {
      Alert.alert('Error', 'Nama dan usia harus diisi');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum <= 0) {
      Alert.alert('Error', 'Usia harus berupa angka valid');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User belum login');
      return;
    }

    setIsSettingUpProfile(true);

    try {
      const profileData = {
        name: name.trim(),
        age: ageNum,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
      console.log('Profile saved:', profileData);
    } catch (err) {
      console.error('Save Profile Error:', err);
      Alert.alert('Error', 'Gagal menyimpan profile. Silakan coba lagi.');
      setIsSettingUpProfile(false);
    }
  };


  useEffect(() => {
    const checkProfile = async () => {
      const storedProfile = await AsyncStorage.getItem('userProfile');
      console.log('AsyncStorage before set:', storedProfile);
    };

    checkProfile();
  }, []);

  useEffect(() => {
    if (isAuthenticated && hasProfile) {
      router.replace('/main'); // redirect aman
    }
  }, [isAuthenticated, hasProfile]);


  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black px-8">
      {!isAuthenticated ? (
        <>
          <Text className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 text-center">
            Selamat datang!
          </Text>
          <Text className="text-base text-zinc-600 dark:text-zinc-400 mb-8 text-center">
            Masuk dengan Google untuk mulai menggunakan aplikasi
          </Text>

          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 px-6 py-4 rounded-xl flex-row items-center justify-center mb-4 shadow-sm"
          >
            <Text className="text-zinc-900 dark:text-white font-semibold ml-3">
              {loading ? 'Signing in...' : 'Masuk dengan Google'}
            </Text>
          </TouchableOpacity>

          {error && (
            <Text className="text-red-500 text-sm text-center mt-2">
              {error}
            </Text>
          )}
        </>
      ) : (
        <>
          <Text className="text-xl font-semibold text-zinc-900 dark:text-white mb-2 text-center">
            Hi, {user?.displayName || 'there'}! 👋
          </Text>
          <Text className="text-base text-zinc-600 dark:text-zinc-400 mb-8 text-center">
            Yuk lengkapi data kamu dulu
          </Text>

          <TextInput
            placeholder="Masukkan nama lengkap"
            placeholderTextColor="#aaa"
            value={name}
            onChangeText={setName}
            className="w-full px-4 py-3 mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white"
            defaultValue={user?.displayName || ''}
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
            onPress={handleProfileSubmit}
            disabled={isSettingUpProfile}
            className="w-full bg-zinc-900 dark:bg-white px-6 py-3 rounded-xl"
          >
            <Text className="text-white dark:text-zinc-900 font-bold text-center">
              {isSettingUpProfile ? 'Menyimpan...' : 'Lanjutkan'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
