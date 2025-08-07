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
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Ionicons } from '@expo/vector-icons';
import BackButton from 'app/components/BackButton';

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
  const [showFullSteps, setShowFullSteps] = useState(false);
  const [showFullIngredients, setShowFullIngredients] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
          setTimeout(() => router.back(), 100);
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <View className="flex-row items-center justify-between mt-4 mb-2 px-5">
        <View className="w-10">
          <BackButton />
        </View>
        <View className="flex-1 items-center">
          <Text className="text-xl font-bold text-blue-600 dark:text-blue-400 text-center" numberOfLines={1}>
            {recipe.title}
          </Text>
          <Text className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            {recipe.category || 'Tanpa Kategori'}
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
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
                style={{ width: screenWidth, height: 240 }}
                className="rounded-none"
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        <View className="px-5 pb-28">
          <Text className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Langkah-langkah</Text>
          {recipe.description ? (
            <>
              <Text
                className="text-sm text-zinc-700 dark:text-zinc-300 mb-1 leading-relaxed"
                numberOfLines={showFullSteps ? undefined : 4}
              >
                {recipe.description}
              </Text>
              <TouchableOpacity onPress={() => setShowFullSteps((prev) => !prev)}>
                <Text className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-4">
                  {showFullSteps ? 'Sembunyikan' : 'Lihat Selengkapnya'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text className="text-zinc-400 mb-4 italic">Tidak ada deskripsi langkah.</Text>
          )}

          <Text className="text-base font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Bahan-bahan</Text>
          <View className="space-y-2 mb-2">
            {(showFullIngredients ? recipe.ingredients : recipe.ingredients.slice(0, 5)).map((item) => (
              <View key={item.id} className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600 mt-1" />
                <Text className="text-sm text-zinc-900 dark:text-white">
                  {item.quantity} {item.unit} {item.name}
                </Text>
              </View>
            ))}
          </View>
          {recipe.ingredients.length > 5 && (
            <TouchableOpacity onPress={() => setShowFullIngredients((prev) => !prev)}>
              <Text className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-6">
                {showFullIngredients ? 'Sembunyikan' : 'Lihat Semua Bahan'}
              </Text>
            </TouchableOpacity>
          )}

          <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Atur Margin (%)</Text>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">Margin: {margin}%</Text>
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">HPP: Rp {hpp.toLocaleString('id-ID')}</Text>
          </View>

          <MultiSlider
            values={[margin]}
            min={0}
            max={300}
            step={5}
            selectedStyle={{ backgroundColor: '#3B82F6', height: 6, borderRadius: 999 }}
            unselectedStyle={{ backgroundColor: isDark ? '#334155' : '#E5E7EB', height: 6, borderRadius: 999 }}
            trackStyle={{ height: 6, borderRadius: 999 }}
            onValuesChange={(val) => setMargin(val[0])}
            customMarker={() => (
              <View className="items-center justify-center w-8 h-8 bg-white dark:bg-zinc-900 border-2 border-blue-500 rounded-full">
                <Ionicons name="cash-outline" size={18} color="#3B82F6" />
              </View>
            )}
            containerStyle={{ paddingHorizontal: 0, marginHorizontal: 5 }}
            sliderLength={screenWidth - 45}
          />

          <Text className="text-xl font-extrabold text-center text-blue-600 dark:text-blue-400 mt-6">
            Harga Jual: Rp {displayedPrice.toLocaleString('id-ID')}
          </Text>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800 flex-row gap-3">
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/recipes/recipeForm', params: { id: recipe.id } })}
          className="flex-1 py-3 rounded-2xl bg-blue-600 dark:bg-blue-500 active:opacity-85"
        >
          <Text className="text-center text-white text-sm font-semibold">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          className="flex-1 py-3 rounded-2xl bg-zinc-200 dark:bg-zinc-700 active:opacity-85"
        >
          <Text className="text-center text-zinc-900 dark:text-white text-sm font-semibold">Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
