// app/recipes/recipeForm.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  BackHandler,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import { useIngredients } from 'context/IngredientsContext';
import IngredientsDropdown from 'app/components/IngredientsDropdown';
import DropdownSelect from 'app/components/DropdownSelect';
import BackButton from 'app/components/BackButton';
import { recipeCategories } from '../../data/categories';
import { useRecipeForm } from 'hooks/useRecipeForm';
import { Animated } from 'react-native';
import uuid from 'react-native-uuid';

export default function RecipeForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const theme = useColorScheme();
  const { satuanList, ingredients } = useIngredients();
  const animatedValue = useRef(new Animated.Value(0)).current;

  const triggerFlash = () => {
    animatedValue.setValue(0);
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const {
    title, setTitle,
    steps, updateStep, addStep, removeStep,
    ingredientsList, ingredientName, quantity, unit,
    setIngredientName, setQuantity, setUnit,
    addIngredient, removeIngredient,
    imageUris, setImageUris,
    category, setCategory,
    calculateTotalHPP,
    handleSave,
    pickImage,
    editing,
    isUploading,
    setIngredientsList
  } = useRecipeForm(id);

  const [editIngredientId, setEditIngredientId] = useState<string | null>(null);

  const items = ingredients.map((i) => ({ label: i.name, value: i.name }));

  const handleEditIngredient = (id: string) => {
    const item = ingredientsList.find((i) => i.id === id);
    if (!item) return;

    setIngredientName(item.name);
    setQuantity(item.quantity.toString());
    setUnit(item.unit);
    setEditIngredientId(id);
    triggerFlash();
  };

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', '#dbeafe'],
  });

  const handleRemoveImage = (index: number) => {
    setImageUris((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddIngredient = () => {
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
            ? { ...item, quantity: qty, unit, cost }
            : item
        )
      );
    } else {
      if (ingredientsList.find((i) => i.name === ingredientName)) return;
      const newIngredient = {

        id: uuid.v4(),
        name: existing.name,
        quantity: qty,
        unit,
        cost,
      };
      setIngredientsList((prev) => [...prev, newIngredient]);
    }

    setIngredientName('');
    setQuantity('');
    setUnit('');
    setEditIngredientId(null);
  };

  useEffect(() => {
    const selected = ingredients.find((i) => i.name === ingredientName);
    if (selected) setUnit(selected.unit);
  }, [ingredientName]);

  useEffect(() => {
    const onBackPress = () => {
      router.back();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, []);

  return (
    <>
      <KeyboardAwareScrollView
        className="flex-1 bg-[#F9FAFB] dark:bg-black px-4 pt-8"
        contentContainerStyle={{ paddingBottom: 160 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between mb-6 px-4">
          <View className="w-10"><BackButton /></View>
          <Text className="text-xl font-bold text-blue-600 dark:text-blue-400 text-center">
            {editing ? 'Edit Resep' : 'Tambah Resep Baru'}
          </Text>
          <View className="w-10" />
        </View>

        <View className="mb-6">
          <Text className="text-gray-700 dark:text-gray-200 font-semibold mb-2">Judul Resep</Text>
          <TextInput
            autoCapitalize="words"
            value={title}
            onChangeText={setTitle}
            placeholder="Contoh: Nasi Goreng"
            placeholderTextColor="#9CA3AF"
            className="bg-white dark:bg-neutral-900 border border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-3 text-black dark:text-white shadow-sm"
          />
        </View>

        <Text className="text-gray-700 dark:text-gray-200 font-semibold mb-2">Kategori (Opsional)</Text>
        <DropdownSelect
          value={category}
          onSelect={setCategory}
          options={recipeCategories}
          placeholder="Pilih kategori"
        />

        <View className="relative flex-1 flex-row mb-6 gap-2">
          <TouchableOpacity
            onPress={pickImage}
            className="bg-gray-100 dark:bg-neutral-800 h-32 py-4 px-4 mr-4 rounded-2xl border border-dashed justify-center items-center gap-2 border-gray-400 dark:border-gray-600"
          >
            <Ionicons name='add-circle-outline' size={24} color="white" />
            <Text className="text-center text-gray-700 dark:text-gray-300 font-medium">Tambah Gambar</Text>
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {imageUris.map((img, index) => (
              <View key={index} className="relative w-28 mr-3 h-32">
                {img.status === 'loading' ? (
                  <View className="w-full h-full rounded-xl bg-gray-200 dark:bg-neutral-700 items-center justify-center">
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text className="text-xs mt-1 text-gray-500 dark:text-gray-400">Mengunggah...</Text>
                  </View>
                ) : (
                  <>
                    <Image source={{ uri: img.uri }} className="w-full h-full rounded-xl border border-gray-300" />
                    <TouchableOpacity
                      onPress={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
                    >
                      <Text className="text-white font-bold text-xs">×</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        <View className="mb-2">
          <Text className="text-gray-700 dark:text-gray-200 font-semibold mb-2">Bahan-bahan</Text>
          <Animated.View style={{ backgroundColor, borderRadius: 10, padding: 2 }}>
            <View className="rounded-xl overflow-hidden">
              <IngredientsDropdown
                options={items}
                selectedValue={ingredientName}
                onSelect={setIngredientName}
                placeholder="Pilih bahan"
                onAddNew={() => router.push('/(tabs)/ingredientsSetUp')}
              />
            </View>
          </Animated.View>
        </View>

        <View className="flex-row gap-3 mb-4 mt-3">
          <View className="flex-1">
            <Text className="text-gray-700 dark:text-gray-300 mb-1">Jumlah</Text>
            <Animated.View style={{ backgroundColor, borderRadius: 12 }}>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholder="Jumlah"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 text-black dark:text-white dark:bg-neutral-900"
              />
            </Animated.View>
          </View>
          <View className="flex-1">
            <Text className="text-gray-700 dark:text-gray-300 mb-1">Satuan</Text>
            <DropdownSelect
              value={unit}
              options={satuanList}
              onSelect={setUnit}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAddIngredient}
          className="bg-green-500 py-3 px-4 rounded-xl mb-6 flex-row justify-center items-center gap-2"
        >
          <Ionicons name='add-circle-outline' size={24} color="white" />
          <Text className="text-center text-white font-semibold">
            {editIngredientId ? 'Perbarui Bahan' : 'Tambah Bahan'}
          </Text>
        </TouchableOpacity>

        <Text className="text-gray-700 dark:text-gray-200 font-semibold mb-2">Steps (Opsional)</Text>
        {steps.map((step, index) => (
          <View key={index} className="mb-3">
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">Langkah {index + 1}</Text>
            <View className="flex-row items-start gap-2">
              <TextInput
                value={step}
                autoCapitalize="sentences"
                onChangeText={(text) => updateStep(index, text)}
                placeholder={`Tulis instruksi...`}
                placeholderTextColor="#9CA3AF"
                multiline
                className="flex-1 bg-white dark:bg-neutral-900 border border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-3 text-black dark:text-white shadow"
              />
              {steps.length > 1 && (
                <TouchableOpacity onPress={() => removeStep(index)} className="mt-2">
                  <Text className="text-red-500 font-bold text-xl">✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
        <TouchableOpacity onPress={addStep} className="mb-6">
          <Text className="text-blue-600 dark:text-blue-400 font-medium text-sm">＋ Tambah Langkah</Text>
        </TouchableOpacity>

        <View className="space-y-2 mb-2">
          {ingredientsList.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleEditIngredient(item.id)}
              className="flex-row justify-between items-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900 px-4 py-3 rounded-xl shadow-sm"
            >
              <View className="flex-row items-center space-x-2">
                <Ionicons name="create-outline" size={18} color={theme === 'dark' ? '#ffffff' : '#000000'} />
                <Text className="text-black dark:text-white font-medium">
                  {item.quantity} {item.unit} {item.name}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeIngredient(item.id)}>
                <Text className="text-red-500 font-semibold">Hapus</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-xs text-gray-500 dark:text-gray-400 mb-6 italic">
          Ketuk bahan untuk mengedit jumlah atau satuan.
        </Text>
      </KeyboardAwareScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-white dark:bg-black border-t border-gray-200 dark:border-neutral-800">
        <Text className="text-gray-700 dark:text-gray-200 font-semibold mb-2">
          Total HPP: Rp {calculateTotalHPP().toLocaleString('id-ID')}
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          className="bg-zinc-900 dark:bg-zinc-100 py-4 rounded-2xl shadow-md flex-row justify-center items-center gap-2 active:opacity-80"
        >
          <Ionicons
            name={editing ? 'save-outline' : 'add-circle-outline'}
            size={24}
            color={theme === 'dark' ? '#000' : '#fff'}
          />
          <Text className={`font-bold text-lg tracking-wide ${theme === 'dark' ? 'text-black' : 'text-white'}`}>
            {editing ? 'Simpan Perubahan' : 'Tambah Resep'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
