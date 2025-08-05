import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRecipes } from 'context/RecipesContext';
import { useIngredients } from 'context/IngredientsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomePage() {
  const router = useRouter();
  const { recipes } = useRecipes();
  const { ingredients } = useIngredients();

  const recentRecipes = [...recipes].slice(-6).reverse();

  useEffect(() => {
    const logStorage = async () => {
      const keys = await AsyncStorage.getAllKeys();
      const entries = await AsyncStorage.multiGet(keys);
    };
    logStorage();
  }, []);

  return (
    <View className="flex-1 bg-white dark:bg-black px-5 pt-6">
      {/* === Header === */}
      <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
        Buku Resep Digital
      </Text>
      <Text className="text-base text-gray-500 dark:text-gray-400 mb-6">
        Simpan, kelola, dan temukan resep favoritmu di satu tempat.
      </Text>

      {/* === Stats Ringkas === */}
      <View className="flex-row gap-4 mb-6">
        <View className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
          <Text className="text-gray-500 text-sm mb-1">Total Resep</Text>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {recipes.length}
          </Text>
        </View>
        <View className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
          <Text className="text-gray-500 text-sm mb-1">Total Bahan</Text>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {ingredients.length}
          </Text>
        </View>
      </View>

      {/* === Quick Actions === */}
      <View className="flex-row gap-4 mb-6">
        <TouchableOpacity
          onPress={() => router.push('/recipes/recipeForm')}
          className="flex-1 bg-blue-600 py-3 rounded-2xl shadow-md"
        >
          <Text className="text-white text-center font-semibold">＋ Tambah Resep</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/ingredientsSetUp')}
          className="flex-1 bg-green-500 py-3 rounded-2xl shadow-md"
        >
          <Text className="text-white text-center font-semibold">＋ Tambah Bahan</Text>
        </TouchableOpacity>
      </View>

      {/* === Resep Terbaru === */}
      <View className="mb-3">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          Resep Terbaru
        </Text>
      </View>

      {recentRecipes.length === 0 ? (
        <Text className="text-gray-500 dark:text-gray-400 text-sm">
          Belum ada resep yang ditambahkan.
        </Text>
      ) : (
        <View className='grid-rows-3 grid-cols-1 '>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recentRecipes.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(`/recipes/${item.id}`)}
              className="w-52 mr-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm"
            >
              {item.imageUris?.[0] ? (
                <Image
                source={{ uri: item.imageUris[0] }}
                className="w-full h-28 rounded-xl mb-2"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-28 bg-zinc-200 dark:bg-zinc-700 rounded-xl mb-2 items-center justify-center">
                  <Text className="text-xs text-zinc-500">Tidak Ada Gambar</Text>
                </View>
              )}
              <Text
                className="text-gray-900 dark:text-white font-semibold mb-1"
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                className="text-gray-500 dark:text-gray-400 text-xs"
                numberOfLines={1}
              >
                {item.category || 'Tanpa kategori'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
                </View>
      )}
    </View>
  );
}
