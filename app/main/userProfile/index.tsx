import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    TextInput,
    Alert,
    ActivityIndicator
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import BackButton from 'app/components/BackButton';

interface StoredProfile {
    name: string;
    age: number;
    email?: string;
    photoURL?: string;
    uid?: string;
    createdAt?: string;
    updatedAt?: string;
}

export default function UserProfile() {
    const { user, signOut, loading: authLoading, isAuthenticated } = useAuth();
    const [storedProfile, setStoredProfile] = useState<StoredProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editAge, setEditAge] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const stored = await AsyncStorage.getItem('userProfile');
            if (stored) {
                const profile: StoredProfile = JSON.parse(stored);
                setStoredProfile(profile);
                setEditName(profile.name || '');
                setEditAge(profile.age?.toString() || '');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!editName.trim() || !editAge.trim()) {
            Alert.alert('Error', 'Nama dan usia harus diisi');
            return;
        }

        setSaving(true);
        try {
            const updatedProfile: StoredProfile = {
                ...storedProfile,
                name: editName.trim(),
                age: parseInt(editAge, 10) || 0,
                email: user?.email ?? undefined,
                photoURL: user?.photoURL ?? undefined,
                uid: user?.uid ?? undefined,
                updatedAt: new Date().toISOString(),
                createdAt: storedProfile?.createdAt ?? new Date().toISOString()
            };

            await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
            setStoredProfile(updatedProfile);
            setIsEditing(false);
            Alert.alert('Success', 'Profile berhasil diupdate!');
        } catch (error) {
            Alert.alert('Error', 'Gagal menyimpan profile');
            console.error('Error saving profile:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Yakin mau keluar dari akun?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                            router.replace('/Welcome');
                        } catch (error) {
                            Alert.alert('Error', 'Gagal sign out');
                        }
                    }
                }
            ]
        );
    };

    if (!isAuthenticated || !user) {
        return (
            <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
                <Text className="text-muted dark:text-zinc-500 text-base">User tidak login</Text>
            </View>
        );
    }

    if (loading || authLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
                <ActivityIndicator size="large" color="#204C4B" />
            </View>
        );
    }

    return (
     <ScrollView className="flex-1 bg-background-light dark:bg-background-dark">
  <View className="p-6">
    {/* Header */}
    <View className="items-center mb-8 pt-8">
      <BackButton />
      <View className="relative mt-4 mb-4">
        {user?.photoURL ? (
          <Image
            source={{ uri: user.photoURL }}
            className="w-28 h-28 rounded-full border-4 border-accent dark:border-accent-dark shadow-lg"
          />
        ) : (
          <View className="w-28 h-28 rounded-full bg-accent dark:bg-accent-dark items-center justify-center shadow-lg">
            <Text className="text-3xl font-bold text-primary dark:text-primary-dark">
              {storedProfile?.name?.charAt(0).toUpperCase() || '?'}
            </Text>
          </View>
        )}
        {/* Online indicator */}
        <View className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-background-light dark:border-background-dark" />
      </View>

      <Text className="text-2xl font-bold text-primary dark:text-primary-dark mb-1">
        {storedProfile?.name || 'No Name'}
      </Text>
      <Text className="text-sm text-muted dark:text-zinc-400">
        Member sejak{' '}
        {storedProfile?.createdAt
          ? new Date(storedProfile.createdAt).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
            })
          : 'Unknown'}
      </Text>
    </View>

    {/* Profile Cards */}
    <View className=" mb-8">
      {/** Nama */}
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md mb-5">
        <Text className="text-sm text-muted dark:text-zinc-400 mb-1">Nama Lengkap</Text>
        {isEditing ? (
          <TextInput
            value={editName}
            onChangeText={setEditName}
            className="text-base text-primary dark:text-primary-dark bg-background-light dark:bg-dark px-3 py-2 rounded-lg border border-muted dark:border-zinc-600"
            placeholder="Masukkan nama"
          />
        ) : (
          <Text className="text-base text-primary dark:text-primary-dark">{storedProfile?.name || '-'}</Text>
        )}
      </View>

      {/** Usia */}
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md mb-5">
        <Text className="text-sm text-muted dark:text-zinc-400 mb-1">Usia</Text>
        {isEditing ? (
          <TextInput
            value={editAge}
            onChangeText={setEditAge}
            keyboardType="numeric"
            className="text-base text-primary dark:text-primary-dark bg-background-light dark:bg-dark px-3 py-2 rounded-lg border border-muted dark:border-zinc-600"
            placeholder="Masukkan usia"
          />
        ) : (
          <Text className="text-base text-primary dark:text-primary-dark">
            {storedProfile?.age ? `${storedProfile.age} tahun` : '-'}
          </Text>
        )}
      </View>

      {/** Email */}
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md mb-5">
        <Text className="text-sm text-muted dark:text-zinc-400 mb-1">Email</Text>
        <Text className="text-base text-primary dark:text-primary-dark">{user?.email || '-'}</Text>
        <Text className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Verified with Google</Text>
      </View>

      {/** UID */}
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
        <Text className="text-sm text-muted dark:text-zinc-400 mb-1">User ID</Text>
        <Text className="text-xs text-muted dark:text-zinc-300 font-mono">{user?.uid || '-'}</Text>
      </View>
    </View>

    {/* Action Buttons */}
    <View className="space-y-3">
      {isEditing ? (
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={handleSaveProfile}
            disabled={saving}
            className="flex-1 bg-primary py-3 rounded-2xl shadow-lg mb-5"
          >
            <Text className="text-white font-semibold text-center">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setIsEditing(false);
              setEditName(storedProfile?.name || '');
              setEditAge(storedProfile?.age?.toString() || '');
            }}
            className="flex-1 bg-gray-400 dark:bg-gray-600 py-3 rounded-2xl shadow-lg"
          >
            <Text className="text-white font-semibold text-center">Batal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setIsEditing(true)}
          className="bg-primary py-3 rounded-2xl shadow-lg mb-5"
        >
          <Text className="text-white font-semibold text-center">Edit Profile</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={handleSignOut}
        className="bg-red-500 py-3 rounded-2xl shadow-lg"
      >
        <Text className="text-white font-semibold text-center">Sign Out</Text>
      </TouchableOpacity>
    </View>

    {/* Footer */}
    <View className="mt-8 pt-6 border-t border-muted dark:border-zinc-700">
      <Text className="text-xs text-center text-muted dark:text-zinc-500">
        Account linked with Google • Data stored locally
      </Text>
    </View>
  </View>
</ScrollView>

    );
}
