import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Checkbox from 'expo-checkbox';
import { useRecipes } from 'context/RecipesContext';
import Slider from '@react-native-community/slider';

export default function RecipeDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { recipes, deleteRecipe } = useRecipes();
  const router = useRouter();
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const recipe = recipes.find((r) => r.id === id);

  const [margin, setMargin] = useState(60);
  const hpp = recipe?.hpp || 0;
  const [displayedPrice, setDisplayedPrice] = useState(
    Math.round(hpp * 1.3)
  );
  const tempMargin = useRef(margin);

  const handleSliding = (val: number) => {
    tempMargin.current = val;
    setDisplayedPrice(Math.round(hpp + hpp * val / 100));
  };

  if (!recipe) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Text className="text-lg text-gray-500 text-center">Resep tidak ditemukan.</Text>
      </View>
    );
  }

  const toggleCheck = (itemId: string) => {
    setCheckedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleDelete = () => {
    Alert.alert('Hapus Resep', 'Yakin ingin menghapus resep ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          deleteRecipe(recipe.id);
          router.replace('/recipes');
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white px-5 pt-5 ">
      {/* === FIXED TOP: Images + Title + Category === */}
      {Array.isArray(recipe.imageUris) && recipe.imageUris.length > 0 && (
        <View className=''>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5 rounded-xl ">
          {recipe.imageUris.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              className="w-72 h-56 mr-3 rounded-2xl"
              resizeMode="cover"
            />
          ))}
        </ScrollView>
        </View>
      )}
      <Text className="text-2xl font-bold text-center mb-1 text-gray-900">{recipe.title}</Text>
      <Text className="text-center text-base text-gray-500 mb-4">
        {recipe.category || 'Tanpa Kategori'}
      </Text>

      {/* === SCROLLABLE CONTENT: Steps & Ingredients === */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        {/* Steps */}
        <Text className="text-lg font-semibold text-gray-800 mb-2">Langkah-langkah</Text>
        <Text className="text-base text-gray-700 mb-6 whitespace-pre-line leading-relaxed">
          {recipe.description || '-'}
        </Text>

        {/* Ingredients with Checklist */}
        <Text className="text-lg font-semibold text-gray-800 mb-3">Bahan-bahan</Text>
      {recipe.ingredients.map((item, index) => (
  <View key={item.id} className="flex-row items-start gap-2 mb-2">
    <Text className="text-base text-gray-700">●</Text>
    <Text className="text-base text-gray-900">
      {item.quantity} {item.unit} {item.name}
    </Text>
  </View>
))}

        {/* Total HPP & Margin */}
        <View className="mt-6 mb-6">
          <Text className="text-lg font-semibold text-black">
            Total HPP: Rp {hpp.toLocaleString('id-ID')}
          </Text>
        </View>
        <View className="mb-10">
          <Text className="text-gray-700 font-semibold mb-2">Atur Margin (%)</Text>
          <Text className="text-lg mt-2 mb-2">Margin: {margin}%</Text>
          <Slider
            onValueChange={handleSliding}
            value={margin}
            minimumValue={0}
            maximumValue={500}
            step={5}
            onSlidingComplete={(val) => setMargin(val)}
          />
          <Text className="text-xl font-bold text-black mt-4">
            Harga Jual: Rp {displayedPrice.toLocaleString('id-ID')}
          </Text>
        </View>
      </ScrollView>

      {/* === FIXED BOTTOM: Buttons === */}
      <View className="flex-row justify-between gap-3 pb-6 pt-3 bg-white">
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
