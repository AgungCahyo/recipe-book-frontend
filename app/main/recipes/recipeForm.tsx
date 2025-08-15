// app/recipes/recipeForm.tsx
import React, { useEffect, useState, useRef, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
  Animated,
  InteractionManager,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { useIngredients } from 'context/ingredients/IngredientsProvider';
import { useRecipesActions, useRecipeById } from 'context/RecipesContext';
import IngredientsDropdown from 'app/components/IngredientsDropdown';
import DropdownSelect from 'app/components/DropdownSelect';
import BackButton from 'app/components/BackButton';
import { recipeCategories } from '../../../data/categories';
import { useRecipeForm } from 'hooks/useRecipeForm';
import uuid from 'react-native-uuid';
import useBackHandler from 'hooks/backHandler';

// Memoized Components
const MemoizedImageItem = memo(({ img, index, onRemove }: any) => {
  console.log('🖼️ Rendering image item:', { index, status: img.status, uri: img.uri.slice(-20) });
  
  return (
    <View key={index} className="relative w-28 mr-3 h-32">
      {img.status === 'loading' ? (
        <View className="w-full h-full rounded-xl bg-gray-200 dark:bg-neutral-700 items-center justify-center">
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text className="text-xs mt-1 text-gray-500 dark:text-gray-400">Mengunggah...</Text>
        </View>
      ) : (
        <>
          <Image
            source={{ uri: img.uri }}
            className="w-full h-full rounded-xl border border-primary"
          />
          <TouchableOpacity
            onPress={() => onRemove(index)}
            className="absolute top-1 right-1 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
            activeOpacity={0.7}
          >
            <Text className="text-white font-bold text-xs">×</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
});

const MemoizedIngredientItem = memo(({ item, theme, onEdit, onRemove }: any) => (
  <TouchableOpacity
    key={item.id}
    onPress={() => onEdit(item.id)}
    className="flex-row justify-between items-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900 px-4 py-3 rounded-xl shadow-sm"
    activeOpacity={0.7}
  >
    <View className="flex-row items-center space-x-2">
      <Ionicons
        name="create-outline"
        size={18}
        color={theme === 'dark' ? '#ffffff' : '#000000'}
      />
      <Text className="text-black dark:text-white font-medium">
        {item.quantity} {item.unit} {item.name}
      </Text>
    </View>
    <TouchableOpacity
      onPress={() => onRemove(item.id)}
      activeOpacity={0.7}
    >
      <Text className="text-red-500 font-semibold">Hapus</Text>
    </TouchableOpacity>
  </TouchableOpacity>
));

const MemoizedStepInput = memo(({ step, index, steps, onUpdateStep, onRemoveStep }: any) => (
  <View key={index} className="mb-3">
    <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
      Langkah {index + 1}
    </Text>
    <View className="flex-row items-start gap-2">
      <TextInput
        value={step}
        autoCapitalize="sentences"
        onChangeText={(text) => onUpdateStep(index, text)}
        placeholder="Tulis instruksi..."
        placeholderTextColor="#9CA3AF"
        multiline
        className="flex-1 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-3 text-black dark:text-white shadow"
      />
      {steps.length > 1 && (
        <TouchableOpacity
          onPress={() => onRemoveStep(index)}
          className="mt-2"
          activeOpacity={0.7}
        >
          <Text className="text-red-500 font-bold text-xl">✕</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
));

export default function RecipeForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const theme = useColorScheme();

  const { ingredients, satuanList } = useIngredients();
  const existingRecipe = useRecipeById(id || '');
  const animatedValue = useRef(new Animated.Value(0)).current;

  const triggerFlash = useCallback(() => {
    animatedValue.setValue(0);
    Animated.sequence([
      Animated.timing(animatedValue, { toValue: 1, duration: 150, useNativeDriver: false }),
      Animated.timing(animatedValue, { toValue: 0, duration: 150, useNativeDriver: false }),
    ]).start();
  }, [animatedValue]);

  // FIXED: Add missing destructured properties from useRecipeForm
  const {
    title, setTitle,
    steps, updateStep, addStep, removeStep,
    ingredientsList, ingredientName, quantity, unit,
    setIngredientName, setQuantity, setUnit,
    addIngredient, removeIngredient,
    editIngredientId, setEditIngredientId, // ADDED: These were missing
    imageUris, setImageUris, removeImage, replaceImage, // ADDED: replaceImage
    category, setCategory,
    calculateTotalHPP,
    handleSave,
    pickImage,
    editing,
    isUploading,
    isSaving, // ADDED: This was missing
    setIngredientsList
  } = useRecipeForm(id);

  // REMOVED: This was duplicated - editIngredientId comes from useRecipeForm
  // const [editIngredientId, setEditIngredientId] = useState<string | null>(null);

  const ingredientOptions = useMemo(() =>
    ingredients.map((i) => ({ label: i.name, value: i.name })),
    [ingredients]
  );

  const handleEditIngredient = useCallback((itemId: string) => {
    console.log('✏️ Editing ingredient:', itemId);
    const item = ingredientsList.find((i) => i.id === itemId);
    if (!item) return;
    setIngredientName(item.name);
    setQuantity(item.quantity.toString());
    setUnit(item.unit);
    setEditIngredientId(itemId);
    InteractionManager.runAfterInteractions(triggerFlash);
  }, [ingredientsList, setIngredientName, setQuantity, setUnit, setEditIngredientId, triggerFlash]);

  const handleRemoveImage = useCallback((idx: number) => {
    console.log('🗑️ Component removing image at index:', idx);
    removeImage(idx);
  }, [removeImage]);

  const handleRemoveIngredient = useCallback((itemId: string) => {
    removeIngredient(itemId);
    if (editIngredientId === itemId) {
      setIngredientName('');
      setQuantity('');
      setUnit('');
      setEditIngredientId(null);
    }
  }, [removeIngredient, editIngredientId, setIngredientName, setQuantity, setUnit, setEditIngredientId]);

  const handleAddIngredient = useCallback(() => {
    if (!ingredientName || !quantity || !unit) return;

    const existing = ingredients.find((i) => i.name === ingredientName);
    if (!existing) return;

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) return;

    const cost = parseFloat((existing.pricePerUnit * qty).toFixed(2));

    if (editIngredientId) {
      setIngredientsList((prev) =>
        prev.map((item) =>
          item.id === editIngredientId
            ? { ...item, ingredientId: existing.id, name: existing.name, quantity: qty, unit, cost }
            : item
        )
      );
    } else {
      if (ingredientsList.find((i) => i.name === ingredientName)) return;
      setIngredientsList((prev) => [...prev, { id: uuid.v4() as string, ingredientId: existing.id, name: existing.name, quantity: qty, unit, cost }]);
    }

    setIngredientName('');
    setQuantity('');
    setUnit('');
    setEditIngredientId(null);
  }, [ingredientName, quantity, unit, ingredients, editIngredientId, ingredientsList, setIngredientsList, setIngredientName, setQuantity, setUnit, setEditIngredientId]);

  useEffect(() => {
    const selected = ingredients.find((i) => i.name === ingredientName);
    if (selected && unit !== selected.unit) {
      // pakai setTimeout 0 supaya keluar dari fase render
      const timer = setTimeout(() => setUnit(selected.unit), 0);
      return () => clearTimeout(timer);
    }
  }, [ingredientName, ingredients, unit, setUnit]);

  const animatedBackgroundStyle = useMemo(() => ({
    backgroundColor: animatedValue.interpolate({ inputRange: [0, 1], outputRange: ['transparent', '#dbeafe'] }),
    borderRadius: 100,
    padding: 2,
  }), [animatedValue]);

  useBackHandler(useCallback(() => { router.back(); return true; }, [router]));
  const totalHPP = useMemo(() => calculateTotalHPP(), [calculateTotalHPP]);

  // ADDED: Debug logging
  console.log('🔍 Component render:', { 
    imagesCount: imageUris.length, 
    editing, 
    isSaving,
    title: title.slice(0, 20) 
  });

  return (
    <>
      <KeyboardAwareScrollView
        className="flex-1 bg-[#fff] dark:bg-black px-4 pt-8"
        contentContainerStyle={{ paddingBottom: 150 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6 px-4">
          <View className="w-10"><BackButton /></View>
          <Text className="text-3xl font-bold text-primary dark:text-blue-400 text-center">
            {editing ? 'Edit Resep' : 'Tambah Resep Baru'}
          </Text>
          <View className="w-10" />
        </View>

        {/* Title Input */}
        <View className="mb-6">
          <Text className="text-gray-700 dark:text-gray-200 font-semibold mb-2">Judul Resep</Text>
          <TextInput
            autoCapitalize="words"
            value={title}
            onChangeText={setTitle}
            placeholder="Contoh: Nasi Goreng"
            placeholderTextColor="#9CA3AF"
            className="bg-white dark:bg-neutral-900 border border-primary dark:border-gray-600 rounded-2xl px-4 py-3 text-black dark:text-white shadow-sm"
          />
        </View>

        {/* Category Selector */}
        <Text className="text-gray-700 dark:text-gray-200 font-semibold mb-2">Kategori (Opsional)</Text>
        <DropdownSelect value={category} onSelect={setCategory} options={recipeCategories} placeholder="Pilih kategori" />

        {/* Image Section */}
        <View className="relative flex-1 flex-row mb-6 gap-2">
          <TouchableOpacity
            onPress={pickImage}
            disabled={isSaving} // ADDED: Disable saat saving
            className="bg-gray-100 dark:bg-neutral-800 h-32 py-4 px-4 mr-4 rounded-2xl border border-dashed justify-center items-center gap-2 border-primary dark:border-gray-600"
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={24} color={theme === 'dark' ? 'white' : 'black'} />
            <Text className="text-center text-gray-700 dark:text-gray-300 font-medium">
              {isSaving ? 'Menyimpan...' : 'Tambah Gambar'}
            </Text>
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row" removeClippedSubviews={true}>
            {imageUris.map((img, idx) => (
              <MemoizedImageItem
                key={`${img.uri}-${idx}`} // IMPROVED: Better key
                img={img}
                index={idx}
                onRemove={handleRemoveImage}
              />
            ))}
          </ScrollView>
        </View>

        {/* Ingredients Section */}
        <View className="mb-2">
          <Text className="text-gray-700 dark:text-gray-200 font-semibold mb-2">Bahan-bahan</Text>
          <Animated.View style={animatedBackgroundStyle}>
            <View className="rounded-xl overflow-hidden">
              <IngredientsDropdown
                options={ingredientOptions}
                selectedValue={ingredientName}
                onSelect={(item) => {
                  setIngredientName(item.value);
                  const selected = ingredients.find((i) => i.name === item.value);
                  if (selected) setUnit(selected.unit);
                }}
              />
            </View>
          </Animated.View>
        </View>

        {/* Quantity and Unit */}
        <View className="flex-row gap-3 mb-4 mt-3">
          <View className="flex-1">
            <Text className="text-gray-700 dark:text-gray-300 mb-1">Jumlah</Text>
            <Animated.View style={animatedBackgroundStyle}>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholder="Jumlah"
                placeholderTextColor="#9CA3AF"
                className="border border-primary dark:border-gray-600 rounded-xl px-4 py-2 text-black dark:text-white dark:bg-neutral-900"
              />
            </Animated.View>
          </View>
          <View className="flex-1">
            <Text className="text-gray-700 dark:text-gray-300 mb-1">Satuan</Text>
            <DropdownSelect value={unit} options={satuanList} onSelect={setUnit} />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAddIngredient}
          className="bg-dark py-3 px-4 rounded-xl mb-6 flex-row justify-center items-center gap-2"
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text className="text-center text-accent font-semibold">{editIngredientId ? 'Perbarui Bahan' : 'Tambah Bahan'}</Text>
        </TouchableOpacity>

        {/* Steps Section */}
        <Text className="text-gray-700 dark:text-gray-200 font-semibold mb-2">Steps (Opsional)</Text>
        {steps.map((step, index) => (
          <MemoizedStepInput key={`step-${index}`} step={step} index={index} steps={steps} onUpdateStep={updateStep} onRemoveStep={removeStep} />
        ))}
        <TouchableOpacity onPress={addStep} className="mb-6" activeOpacity={0.7}>
          <Text className="text-blue-600 dark:text-blue-400 font-medium text-sm">＋ Tambah Langkah</Text>
        </TouchableOpacity>

        {/* Ingredients List */}
        <View className="space-y-2 mb-2">
          {ingredientsList.map((item) => (
            <MemoizedIngredientItem key={`ingredient-${item.id}`} item={item} theme={theme} onEdit={handleEditIngredient} onRemove={handleRemoveIngredient} />
          ))}
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400 mb-6 italic">Ketuk bahan untuk mengedit jumlah atau satuan.</Text>
      </KeyboardAwareScrollView>

      {/* Bottom Section */}
      <View className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-[#fff] dark:bg-black border-t border-gray-200 dark:border-neutral-800">
        <Text className="text-gray-700 dark:text-gray-200 font-semibold mb-2">Total HPP: Rp {totalHPP.toLocaleString('id-ID')}</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isUploading || isSaving} // IMPROVED: Disable for both states
          className="bg-primary dark:bg-zinc-100 py-4 rounded-2xl shadow-md flex-row justify-center items-center gap-2 active:opacity-80"
          activeOpacity={isUploading || isSaving ? 1 : 0.8}
        >
          {(isUploading || isSaving) ? (
            <ActivityIndicator size="small" color={theme === 'dark' ? '#000' : '#fff'} />
          ) : (
            <Ionicons name={editing ? 'save-outline' : 'add-circle-outline'} size={24} color={theme === 'dark' ? '#000' : '#fff'} />
          )}
          <Text className={`font-bold text-lg tracking-wide ${theme === 'dark' ? 'text-black' : 'text-white'}`}>
            {(isUploading || isSaving) ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Resep'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}