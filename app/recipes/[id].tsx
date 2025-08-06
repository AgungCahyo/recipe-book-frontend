import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRecipes } from 'context/RecipesContext';
import Slider from '@react-native-community/slider';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Ionicons } from '@expo/vector-icons';


const screenWidth = Dimensions.get('window').width;

export default function RecipeDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { recipes, deleteRecipe } = useRecipes();
  const router = useRouter();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const recipe = recipes.find((r) => r.id === id);
  const hpp = recipe?.hpp || 0;

  const [margin, setMargin] = useState(60);
  const [displayedPrice, setDisplayedPrice] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [tempMargin, setTempMargin] = useState(margin); // value sementara saat geser
  const [sliderVal, setSliderVal] = useState(60); // untuk tampilan real-time

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const newPrice = Math.round(hpp + (hpp * margin) / 100);
      setDisplayedPrice(newPrice);
    }, 100);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [margin, hpp]);

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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Gambar */}
        {Array.isArray(recipe.imageUris) && recipe.imageUris.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            {recipe.imageUris.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={{ width: screenWidth, height: 280 }}
                className="rounded-none"
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        {/* Konten */}
        <View className="px-5 pb-24">
          <Text className="text-3xl font-extrabold text-center mt-4 text-gray-900 dark:text-white">
            {recipe.title}
          </Text>
          <Text className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            {recipe.category || 'Tanpa Kategori'}
          </Text>

          {/* Langkah */}
          <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Langkah-langkah
          </Text>
          {recipe.description ? (
            <Text className="text-base text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              {recipe.description}
            </Text>
          ) : (
            <Text className="text-gray-400 mb-6 italic">Tidak ada deskripsi langkah.</Text>
          )}

          {/* Bahan */}
          <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Bahan-bahan
          </Text>
          <View className="space-y-2">
            {recipe.ingredients.map((item) => (
              <View key={item.id} className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 mt-1" />
                <Text className="text-base text-gray-900 dark:text-white">
                  {item.quantity} {item.unit} {item.name}
                </Text>
              </View>
            ))}
          </View>

          {/* HPP & Slider */}
          <View className="mt-10">
            {/* HPP & Slider */}
            <View className="mt-10">
              <Text className="text-gray-700 dark:text-gray-300 font-medium mb-2">Atur Margin (%)</Text>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  Margin: {margin}%
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  HPP: Rp {hpp.toLocaleString('id-ID')}
                </Text>
              </View>
              <MultiSlider
                values={[margin]}
                min={0}
                max={300}
                step={5}
                selectedStyle={{
                  backgroundColor: '#3B82F6',
                  height: 8,
                  borderRadius: 999,
                }}
                unselectedStyle={{
                  backgroundColor: '#E5E7EB',
                  height: 8,
                  borderRadius: 999,
                }}
                trackStyle={{
                  height: 8,
                  borderRadius: 999,
                }}
                onValuesChange={(val) => setMargin(val[0])}
                customMarker={() => (
                  <View className="items-center justify-center w-10 h-10 bg-white border-2 border-blue-500 rounded-full shadow-sm">
                    <Ionicons name="cash-outline" size={20} color="#3B82F6" />
                  </View>
                )}
                containerStyle={{
                  paddingHorizontal: 0,
                  marginHorizontal: 5, // tarik keluar dikit biar mentok ke sisi screen
                }}
                sliderLength={screenWidth - 45}
              />

              <Text className="text-2xl font-extrabold text-center text-blue-600 dark:text-blue-400 mt-6">
                Harga Jual: Rp {(hpp + (hpp * margin) / 100).toLocaleString('id-ID')}
              </Text>

            </View>


          </View>
        </View>
      </ScrollView>

      {/* Aksi */}
      <View className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-white dark:bg-black border-t border-gray-100 dark:border-gray-800 flex-row gap-3">
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/recipes/recipeForm', params: { id: recipe.id } })}
          className="flex-1 py-3 rounded-full bg-yellow-500"
        >
          <Text className="text-center text-white text-base font-semibold">Edit</Text>
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
