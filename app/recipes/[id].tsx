// app/recipes/[id].tsx

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRecipes } from 'context/RecipesContext';
import Slider from '@react-native-community/slider';

export default function RecipeDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { recipes, deleteRecipe } = useRecipes();
  const router = useRouter();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const [margin, setMargin] = useState(60);
  const recipe = recipes.find((r) => r.id === id);
  const hpp = recipe?.hpp || 0;
  const displayedPrice = Math.round(hpp + hpp * margin / 100);

  useEffect(() => {
    if (!recipe) {
      const timeout = setTimeout(() => {
        router.replace('/recipes');
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [recipe]);

  if (!recipe) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-black">
        <Text className="text-gray-500 dark:text-gray-400">Memuat data resep...</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('Hapus Resep', 'Yakin ingin menghapus resep ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          await deleteRecipe(recipe.id);
          setTimeout(() => router.replace('/recipes'), 100);
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* IMAGES */}
        {Array.isArray(recipe.imageUris) && recipe.imageUris.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6 px-5"
          >
            {recipe.imageUris.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                className="w-72 h-56 mr-4 rounded-2xl"
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {/* TITLE & CATEGORY */}
        <View className="px-6">
          <Text className="text-3xl font-extrabold text-center mb-1 text-gray-900 dark:text-white">
            {recipe.title}
          </Text>
          <Text className="text-center text-base text-gray-500 dark:text-gray-400 mb-6">
            {recipe.category || 'Tanpa Kategori'}
          </Text>

          {/* DESCRIPTION */}
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
            Langkah-langkah
          </Text>
          <Text className="text-base text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            {recipe.description || '-'}
          </Text>

          {/* INGREDIENTS */}
          <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">
            Bahan-bahan
          </Text>
          {recipe.ingredients.map((item) => (
            <View key={item.id} className="flex-row items-start gap-2 mb-2">
              <Text className="text-base text-gray-700 dark:text-gray-400">●</Text>
              <Text className="text-base text-gray-900 dark:text-white">
                {item.quantity} {item.unit} {item.name}
              </Text>
            </View>
          ))}

          {/* HPP & MARGIN */}
          <View className="mt-8 mb-4">
            <Text className="text-lg font-semibold text-black dark:text-white">
              Total HPP: Rp {hpp.toLocaleString('id-ID')}
            </Text>
          </View>

          <View className="mb-12">
            <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
              Atur Margin (%)
            </Text>
            <Text className="text-lg text-gray-900 dark:text-white mb-2">
              Margin: {margin}%
            </Text>
            <Slider
              onValueChange={(val) => setMargin(val)}
              value={margin}
              minimumValue={0}
              maximumValue={500}
              step={5}
            />
            <Text className="text-xl font-bold text-black dark:text-white mt-4">
              Harga Jual: Rp {displayedPrice.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ACTION BUTTONS */}
      <View className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 flex-row gap-4">
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/recipes/recipeForm', params: { id: recipe.id } })}
          className="flex-1 py-3 rounded-full bg-yellow-500"
        >
          <Text className="text-center text-white text-base font-semibold">Edit Resep</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          className="flex-1 py-3 rounded-full bg-red-600"
        >
          <Text className="text-center text-white text-base font-semibold">Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}