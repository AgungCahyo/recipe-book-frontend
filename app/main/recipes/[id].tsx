import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
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
  StyleSheet,
  InteractionManager
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useRecipes } from 'context/RecipesContext';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { Ionicons } from '@expo/vector-icons';
import BackButton from 'app/components/BackButton';
import { useSellingPrice } from 'hooks/useSellingPrice';
import useBackHandler from 'hooks/backHandler';
import { useIngredients } from 'context/ingredients/IngredientsProvider';
import { useNavigationState } from 'context/NavigationContext';
import ConfirmModal from 'app/components/ConfirmModal';

const screenWidth = Dimensions.get('window').width;

const MemoizedImage = memo(({ uri, index }: { uri: string; index: number }) => (
  <Image
    key={index}
    source={{ uri }}
    style={{ width: screenWidth - 16, height: 240 }}
    className="rounded-lg mr-3"
    resizeMode="cover"
  />
));

const MemoizedIngredientItem = memo(({ item }: { item: any }) => (
  <View className="flex-row items-center gap-2">
    <View className="w-2 h-2 rounded-lg bg-dark dark:bg-zinc-600" />
    <View className=' flex-1 '>
      <Text className='italic '> {item.quantity} {item.unit}</Text>
    </View>
    <View className='flex-1 justify-items-start text-left'>
      <Text className="text-lg text-left justify-start font-semibold text-zinc-900 dark:text-white">
        {item.name}
      </Text>
    </View>
  </View>
));

const HeaderComponent = memo(({ title, category }: { title: string; category?: string }) => (
  <View className="flex-row absolute z-[999] bg-accent mt-2 mx-2 rounded-2xl items-center justify-between py-3 px-5">
    <View className="w-10"><BackButton /></View>
    <View className="flex-1 items-center">
      <Text className="text-3xl font-bold text-primary dark:text-blue-400 text-center" numberOfLines={1}>
        {title}
      </Text>
      <Text className="text-center text-xs text-dark dark:text-zinc-400">
        {category || 'Tanpa Kategori'}
      </Text>
    </View>
    <View className="w-10" />
  </View>
));

export default function RecipeDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRecipeById, deleteRecipe } = useRecipes();
  const { ingredients } = useIngredients(); // <-- Hook baru
  const router = useRouter();
  const theme = useColorScheme();
  const isDark = theme === 'dark';
  
  const [showAllIngredients, setShowAllIngredients] = useState(false);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  
  const { setIsNavigating } = useNavigationState();
  const MAX_VISIBLE = 5;

  const originalRecipe = useMemo(() => {
    if (!id) return null;
    return getRecipeById(id);
  }, [id, getRecipeById]);

  const ingredientsMap = useMemo(() => {
    const map = new Map<string, typeof ingredients[0]>();
    ingredients.forEach((ingredient) => {
      map.set(ingredient.id, ingredient);
    });
    return map;
  }, [ingredients]);

  const updatedRecipe = useMemo(() => {
    if (!originalRecipe || !ingredientsMap.size) return originalRecipe;

    const updatedIngredients = originalRecipe.ingredients.map(item => {
      const latest = ingredientsMap.get(item.ingredientId);
      if (!latest) return item;

      const updatedCost = parseFloat((latest.pricePerUnit * item.quantity).toFixed(2));
      return {
        ...item,
        cost: updatedCost,
        unit: latest.unit,
        name: latest.name
      };
    });

    return { ...originalRecipe, ingredients: updatedIngredients };
  }, [originalRecipe, ingredientsMap]);

  const sellingPriceData = useSellingPrice(updatedRecipe ?? undefined);
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
  } = sellingPriceData;

  const totalHPP = useMemo(() => {
    if (!updatedRecipe?.ingredients) return 0;
    return updatedRecipe.ingredients.reduce((total, item) => total + (item.cost || 0), 0);
  }, [updatedRecipe?.ingredients]);

  const SliderMarker = useMemo(() => (
    <View className="items-center justify-center w-8 h-8 bg-accent dark:bg-zinc-900 border-2 border-dark rounded-full">
      <Ionicons name="cash-outline" size={18} color="#000" />
    </View>
  ), []);

  const sliderStyles = useMemo(() => ({
    selected: { backgroundColor: '#000', height: 6, borderRadius: 999 },
    unselected: { backgroundColor: isDark ? '#334155' : '#fff', height: 6, borderRadius: 999 },
    track: { height: 6, borderRadius: 999 },
    container: { paddingHorizontal: 0, marginHorizontal: 5 },
  }), [isDark]);

  useFocusEffect(
    useCallback(() => {
      setIsNavigating(false);
    }, [setIsNavigating])
  );

  useBackHandler(
    useCallback(() => {
      router.back();
      return true;
    }, [router])
  );

  useEffect(() => {
    if (isManual) setIsEditingPrice(false);
  }, [isManual]);

  const handleDelete = useCallback(() => {
    if (!updatedRecipe) return;
    setShowConfirm(true);
  }, [updatedRecipe]);

  const confirmDelete = useCallback(async () => {
    setShowConfirm(false);
    if (!updatedRecipe) {
      Alert.alert('Error', 'Resep tidak ditemukan');
      return;
    }
    try {
      await deleteRecipe(updatedRecipe.id);
      setTimeout(() => router.replace('/main/recipes'), 100);
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      Alert.alert('Error', 'Gagal menghapus resep');
    }
  }, [updatedRecipe, deleteRecipe, router]);

  const handleEdit = useCallback(() => {
    if (!updatedRecipe) return;
    InteractionManager.runAfterInteractions(() => {
      router.push({ pathname: '/main/recipes/recipeForm', params: { id: updatedRecipe.id } });
    });
  }, [updatedRecipe, router]);

  const handleEditPrice = useCallback(() => setIsEditingPrice(true), []);
  const handleSaveAndClose = useCallback(() => { handleSaveManualPrice(); setIsEditingPrice(false); }, [handleSaveManualPrice]);

  if (!id || !originalRecipe) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <Text style={{ color: isDark ? '#fff' : '#000' }}>
          {!id ? 'ID resep tidak valid' : 'Memuat...'}
        </Text>
      </View>
    );
  }

  if (!updatedRecipe) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <Text style={{ color: isDark ? '#fff' : '#000' }}>Gagal memuat data resep</Text>
      </View>
    );
  }
 
  return (
    <View className="flex-1 bg-primary dark:bg-black">
      <HeaderComponent title={updatedRecipe.title} category={updatedRecipe.category} />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {Array.isArray(updatedRecipe.imageUris) && updatedRecipe.imageUris.length > 0 && (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} className="mb-4 mx-2 mt-20 rounded-xl border border-primary" removeClippedSubviews>
            {updatedRecipe.imageUris.map((uri, index) => <MemoizedImage key={`image-${index}`} uri={uri} index={index} />)}
          </ScrollView>
        )}

        <View className="px-5 pb-28 mt-[80]">
          <Text className="text-xl font-semibold text-dark dark:text-zinc-200 mb-1">Bahan-bahan</Text>
          <View className="space-y-2 mb-2">
            {(showAllIngredients ? updatedRecipe.ingredients : updatedRecipe.ingredients.slice(0, MAX_VISIBLE))
              .map(item => <MemoizedIngredientItem key={`ingredient-${item.id}`} item={item} />)}
          </View>
          {updatedRecipe.ingredients.length > MAX_VISIBLE && (
            <TouchableOpacity onPress={() => setShowAllIngredients(!showAllIngredients)}>
              <Text className="text-primary text-left font-semibold">{showAllIngredients ? 'Tutup' : 'Lihat Selengkapnya'}</Text>
            </TouchableOpacity>
          )}

          <Text className="text-xl font-semibold text-dark dark:text-zinc-200 mb-1 mt-6">Langkah-langkah</Text>
          {updatedRecipe.description ? (
            <>
              <Text className="text-lg text-zinc-700 dark:text-zinc-300 mb-1 leading-relaxed" numberOfLines={showAllSteps ? undefined : 5}>
                {updatedRecipe.description}
              </Text>
              {updatedRecipe.description.split('\n').length > MAX_VISIBLE && (
                <TouchableOpacity onPress={() => setShowAllSteps(!showAllSteps)}>
                  <Text className="text-primary text-center font-semibold">{showAllSteps ? 'Tutup' : 'Lihat Selengkapnya'}</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Text className="text-primary/50 mb-4 italic text-lg">Tidak ada deskripsi langkah.</Text>
          )}

          <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Simulasi Margin (%)</Text>
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">Margin: {margin}%</Text>
            <Text className="text-xs text-zinc-500 dark:text-zinc-400">HPP: Rp {totalHPP.toLocaleString('id-ID')}</Text>
          </View>

          <MultiSlider
            values={[margin]}
            min={0}
            max={300}
            step={5}
            selectedStyle={sliderStyles.selected}
            unselectedStyle={sliderStyles.unselected}
            trackStyle={sliderStyles.track}
            onValuesChange={(val) => setMargin(val[0])}
            customMarker={() => SliderMarker}
            containerStyle={sliderStyles.container}
            sliderLength={screenWidth - 45}
          />

          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Estimasi Harga Jual: Rp {displayedPrice.toLocaleString('id-ID')}
          </Text>

          <View className="px-5">
            {!isManual || isEditingPrice ? (
              <>
                <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-6 mb-2">Tetapkan Harga Jual Manual</Text>
                <View className="gap-3 justify-center flex-row">
                  <TextInput
                    value={manualPrice}
                    onChangeText={setManualPrice}
                    placeholder="Rp."
                    style={{ width: 200 }}
                    keyboardType="numeric"
                    className="bg-white text-left text-xl font-bold dark:bg-zinc-900 border border-gray-300 dark:border-zinc-600 rounded-xl px-4 py-2 text-black dark:text-white"
                  />
                  <TouchableOpacity onPress={handleSaveAndClose} disabled={saving} style={{ width: 60 }} className="bg-green-700 dark:bg-blue-500 py-3 rounded-xl active:opacity-85" activeOpacity={0.7}>
                    <Text className="text-center text-white font-semibold">{saving ? 'Menyimpan...' : 'Confirm'}</Text>
                  </TouchableOpacity>
                  {isManual && (
                    <TouchableOpacity onPress={() => setIsEditingPrice(false)} className="py-3 px-4 rounded-xl border bg-dark dark:border-zinc-600">
                      <Text className="text-center text-primary dark:text-gray-300 text-sm font-semibold">Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            ) : (
              <View className="mt-6 items-center">
                <Text className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Harga Jual Saat Ini</Text>
                <Text className="text-2xl font-extrabold text-dark dark:text-blue-400">Rp {finalPrice.toLocaleString('id-ID')}</Text>
                <TouchableOpacity onPress={handleEditPrice} className="mt-3 py-2 px-6 rounded-2xl bg-dark dark:bg-blue-500 active:opacity-85" activeOpacity={0.7}>
                  <Text className="text-white font-semibold">Edit Harga Jual</Text>
                </TouchableOpacity>
                <Text className="text-xs text-zinc-400 mt-1 italic">Ditentukan manual oleh pengguna</Text>
                <Text className="text-xs text-zinc-400 mt-1 italic">
                  Margin: {totalHPP > 0 ? (((finalPrice - totalHPP) / totalHPP) * 100).toFixed(2) : 'N/A'}%
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 mb-2 left-0 right-0 px-5 py-4 mx-2 bg-accent dark:bg-black border-t border-primary/50 rounded-2xl dark:border-zinc-800 flex-row gap-3">
        <TouchableOpacity onPress={handleEdit} className="flex-1 py-3 rounded-2xl bg-primary dark:bg-blue-500 active:opacity-85" activeOpacity={0.7}>
          <Text className="text-center text-accent text-sm font-semibold">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDelete} className="flex-1 py-3 rounded-2xl bg-dark dark:bg-zinc-700 active:opacity-85" activeOpacity={0.7}>
          <Text className="text-center text-accent dark:text-white text-sm font-semibold">Hapus</Text>
        </TouchableOpacity>
      </View>
      
      <ConfirmModal visible={showConfirm} title="Hapus Resep" message="Yakin ingin menghapus resep ini?" onCancel={() => setShowConfirm(false)} onConfirm={confirmDelete} />
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
