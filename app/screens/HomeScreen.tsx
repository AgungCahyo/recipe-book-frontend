import React, { useEffect, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';

export default function HomePage() {
  const router = useRouter();
  const { recipes } = useRecipes();
  const { ingredients } = useIngredients();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const recentRecipes = [...recipes].slice(-6).reverse();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return '☀️ Selamat pagi';
    if (hour >= 12 && hour < 15) return '🌞 Selamat siang';
    if (hour >= 15 && hour < 18) return '🌤️ Selamat sore';
    if (hour >= 18 && hour < 21) return '🌇 Selamat petang';
    return '🌙 Selamat malam';
  };

  const quotes = [
    '"Memasak bukan soal resep, tapi soal hati yang ingin berbagi."',
    '"Resep bisa sama, tapi rasa punya cerita berbeda."',
    '"Dapur yang hangat lahir dari tangan yang tulus."',
    '"Bahan yang sederhana bisa jadi luar biasa di tangan yang tepat."',
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  useEffect(() => {
    const logStorage = async () => {
      const keys = await AsyncStorage.getAllKeys();
      const entries = await AsyncStorage.multiGet(keys);
    };
    logStorage();
  }, []);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 20, paddingTop: 24 }}
      style={{ flex: 1, backgroundColor: 'white' }} // tambahkan background & flex
    >
      {/* === Greeting === */}
      <Text className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-1">
        {getGreeting()}, Agung 👋
      </Text>

      {/* === Header === */}
      <Text className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
        Buku Resep Digital
      </Text>
      <Text className="text-base text-zinc-500 dark:text-zinc-400 mb-6">
        Simpan, kelola, dan temukan resep favoritmu di satu tempat.
      </Text>

      {/* === Stats Ringkas === */}
    <View className="flex-row gap-4 mb-6">
  <View className="flex-1 bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl p-4 shadow-sm">
    <View className="flex-row items-center gap-2 mb-1">
      <Ionicons name="book-outline" size={20} color="#7C3AED" />
      <Text className="text-zinc-700 dark:text-zinc-300 text-sm">Total Resep</Text>
    </View>
    <Text className="text-2xl font-bold text-zinc-900 dark:text-white">
      {recipes.length}
    </Text>
  </View>

  <View className="flex-1 bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-2xl p-4 shadow-sm">
    <View className="flex-row items-center gap-2 mb-1">
      <Ionicons name="leaf-outline" size={20} color="#10B981" />
      <Text className="text-zinc-700 dark:text-zinc-300 text-sm">Total Bahan</Text>
    </View>
    <Text className="text-2xl font-bold text-zinc-900 dark:text-white">
      {ingredients.length}
    </Text>
  </View>
</View>


      {/* === Quick Actions === */}
      <View className="flex-row gap-4 mb-6">
        <TouchableOpacity
          onPress={() => router.push('/recipes/recipeForm')}
          className="flex-1 flex-row items-center justify-center gap-2 bg-zinc-900 py-3 rounded-2xl shadow-md"
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text className="text-white font-semibold">Tambah Resep</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/ingredientsSetUp')}
          className="flex-1 flex-row items-center justify-center gap-2 bg-zinc-700 py-3 rounded-2xl shadow-md"
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text className="text-white font-semibold">Tambah Bahan</Text>
        </TouchableOpacity>
      </View>

      {/* === Filter Chips === */}
     <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
  {['Minuman', 'Cemilan', 'Favorit', 'Terbaru'].map((cat) => {
    const isActive = selectedCategory === cat;
    return (
      <TouchableOpacity
        key={cat}
        onPress={() => setSelectedCategory(cat)}
        className={`px-4 py-2 mr-3 rounded-full ${isActive
          ? 'bg-zinc-900'
          : 'bg-zinc-200 dark:bg-zinc-700'
          }`}
        activeOpacity={0.8}
      >
        <Text
          className={`text-sm font-medium ${isActive
            ? 'text-white'
            : 'text-zinc-800 dark:text-zinc-100'
            }`}
        >
          {cat}
        </Text>
      </TouchableOpacity>
    );
  })}
</ScrollView>


      {/* === Resep Terbaru === */}
      <View className="mb-3">
        <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
          Resep Terbaru
        </Text>
      </View>

      {recentRecipes.length === 0 ? (
        <Text className="text-zinc-500 dark:text-zinc-400 text-sm">
          Belum ada resep yang ditambahkan.
        </Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
         {recentRecipes.length === 0 ? (
  <Text className="text-zinc-500 dark:text-zinc-400 text-sm">
    Belum ada resep yang ditambahkan.
  </Text>
) : (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingRight: 4 }}
  >
    {recentRecipes.map((item) => (
      <TouchableOpacity
        key={item.id}
        onPress={() => router.push(`/recipes/${item.id}`)}
        className="w-52 mr-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-4 shadow-sm"
        activeOpacity={0.85}
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
          className="text-zinc-900 dark:text-white font-semibold mb-1"
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          className="text-zinc-500 dark:text-zinc-400 text-xs"
          numberOfLines={1}
        >
          {item.category || 'Tanpa kategori'}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
)}

        </ScrollView>
      )}

      {/* === Random Quote === */}
      <View className="mt-8 px-4 py-3 bg-stone-100 dark:bg-zinc-800 rounded-xl">
        <Text className="text-sm text-zinc-700 dark:text-zinc-200 italic text-center">
          {randomQuote}
        </Text>
      </View>
    </ScrollView>
  );
}
