import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Dimensions,
  TextInput,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useRecipes } from 'context/RecipesContext';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Ionicons } from '@expo/vector-icons';
import BackButton from 'app/components/BackButton';
import { useSellingPrice } from 'hooks/useSellingPrice';
import useBackHandler from 'hooks/backHandler';
import { useIngredients, Ingredient } from 'context/ingredients/IngredientsProvider';
import { useNavigationState } from 'context/NavigationContext';

const screenWidth = Dimensions.get('window').width;

export default function RecipeDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { recipes, deleteRecipe, getRecipeById } = useRecipes();
  const { ingredients: allIngredients } = useIngredients();
  const router = useRouter();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const recipe = getRecipeById(id);
  const { setIsNavigating } = useNavigationState();
  const [loading, setLoading] = useState(true);
  useFocusEffect(() => {
    setIsNavigating(false);
  });


  const [updatedRecipe, setUpdatedRecipe] = useState(recipe);

   const ingredientsMap: { [key: string]: Ingredient } = useMemo(() => {
    const map: { [key: string]: Ingredient } = {};
    allIngredients.forEach((ingredient) => {
      map[ingredient.id] = ingredient;
    });
    return map;
  }, [allIngredients]);

  useEffect(() => {
    if (!recipe) return;
    setLoading(true);

    const updatedIngredients = recipe.ingredients.map(item => {
      const latest = ingredientsMap[item.ingredientId];
      if (!latest) return item;
      const updatedCost = parseFloat((latest.pricePerUnit * item.quantity).toFixed(2));
      return { ...item, cost: updatedCost, unit: latest.unit, name: latest.name };
    });

    setUpdatedRecipe({ ...recipe, ingredients: updatedIngredients });
    setLoading(false);
  }, [ingredientsMap, recipe]);


  useBackHandler(() => {
    router.back();
    return true;
  });

  const {
    margin,
    setMargin,
    displayedPrice,
    manualPrice,
    setManualPrice,
    handleSaveManualPrice,
    saving,
    finalPrice,
    isManual,
    hpp,
  } = useSellingPrice(updatedRecipe);

  if (loading || !updatedRecipe) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <ActivityIndicator size="large" color="#0a84ff" />
        <Text style={{ marginTop: 10, color: isDark ? '#fff' : '#000' }}>Memuat data resep...</Text>
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
          await deleteRecipe(updatedRecipe.id);
          setTimeout(() => {
            if (router.canGoBack?.()) {
              router.back();
            }
          }, 200);
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-accent/60 dark:bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between mt-4 mb-2 px-5">
        <View className="w-10">
          <BackButton />
        </View>
        <View className="flex-1 items-center">
          <Text
            className="text-3xl font-bold text-primary dark:text-blue-400 text-center"
            numberOfLines={1}
          >
            {updatedRecipe.title}
          </Text>
          <Text className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            {updatedRecipe.category || 'Tanpa Kategori'}
          </Text>
        </View>
        <View className="w-10" />
      </View>

      {/* Main Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Gambar Resep */}
        {Array.isArray(updatedRecipe.imageUris) && updatedRecipe.imageUris.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            className="mb-4 mx-2 rounded-xl border border-primary"
          >
            {updatedRecipe.imageUris.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={{ width: screenWidth, height: 240 }}
                className="rounded-lg mr-3"
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        )}

        <View className="px-5 pb-28">
          {/* Langkah-langkah */}
          <Text className="text-xl font-semibold text-dark dark:text-zinc-200 mb-1">Langkah-langkah</Text>
          {updatedRecipe.description ? (
            <>
              <Text
                className="text-lg text-zinc-700 dark:text-zinc-300 mb-1 leading-relaxed"
                numberOfLines={4}
              >
                {updatedRecipe.description}
              </Text>
              {/* You can add toggle for full steps if needed */}
            </>
          ) : (
            <Text className="text-primary/50 mb-4 italic text-lg">Tidak ada deskripsi langkah.</Text>
          )}

          {/* Bahan-bahan */}
          <Text className="text-xl font-semibold text-dark dark:text-zinc-200 mb-1">Bahan-bahan</Text>
          <View className="space-y-2 mb-2">
            {updatedRecipe.ingredients.map((item) => (
              <View key={item.id} className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-lg bg-primary/50 dark:bg-zinc-600 " />
                <Text className="text-lg text-zinc-900 dark:text-white">
                  {item.quantity} {item.unit} {item.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Harga dan margin */}
          <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Simulasi Margin (%)</Text>
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">Margin: {margin}%</Text>
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">
              HPP: Rp {updatedRecipe.ingredients.reduce((total, i) => total + (i.cost || 0), 0).toLocaleString('id-ID')}
            </Text>
          </View>

          <MultiSlider
            values={[margin]}
            min={0}
            max={300}
            step={5}
            selectedStyle={{ backgroundColor: '#204c4b', height: 6, borderRadius: 999 }}
            unselectedStyle={{ backgroundColor: isDark ? '#334155' : '#E5E7EB', height: 6, borderRadius: 999 }}
            trackStyle={{ height: 6, borderRadius: 999 }}
            onValuesChange={(val) => setMargin(val[0])}
            customMarker={() => (
              <View className="items-center justify-center w-8 h-8 bg-accent dark:bg-zinc-900 border-2 border-primary rounded-full">
                <Ionicons name="cash-outline" size={18} color="#204c4b" />
              </View>
            )}
            containerStyle={{ paddingHorizontal: 0, marginHorizontal: 5 }}
            sliderLength={screenWidth - 45}
          />

          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Estimasi Harga Jual: Rp {displayedPrice.toLocaleString('id-ID')}
          </Text>

          {/* Harga Jual Manual */}
          <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-6 mb-2">Tetapkan Harga Jual Manual</Text>
          <View className="items-center justify-start gap-3 flex-row">
            <TextInput
              value={manualPrice}
              onChangeText={setManualPrice}
              placeholder="Rp."
              style={{ width: 100 }}
              keyboardType="numeric"
              className="bg-white text-center text-xl font-bold dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 rounded-xl px-4 py-2 text-black dark:text-white"
            />
            <TouchableOpacity
              onPress={handleSaveManualPrice}
              disabled={saving}
              style={{ width: 100 }}
              className="bg-primary dark:bg-blue-500 py-3 rounded-xl active:opacity-85"
            >
              <Text className="text-center text-white font-semibold">
                {saving ? 'Menyimpan...' : 'Set Harga Jual'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Harga Jual Saat Ini */}
          <View className="mt-6 items-center">
            <Text className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Harga Jual Saat Ini</Text>
            <Text className="text-2xl font-extrabold text-primary dark:text-blue-400">
              Rp {finalPrice.toLocaleString('id-ID')}
            </Text>
            {isManual && (
              <Text className="text-xs text-zinc-400 mt-1 italic">Ditentukan manual oleh pengguna</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Tombol Bawah */}
      <View className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-accent dark:bg-black border-t border-primary/50 mx-2 dark:border-zinc-800 flex-row gap-3">
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/recipes/recipeForm', params: { id: updatedRecipe.id } })}
          className="flex-1 py-3 rounded-2xl bg-primary dark:bg-blue-500 active:opacity-85"
        >
          <Text className="text-center text-accent text-sm font-semibold">Edit</Text>
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
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});