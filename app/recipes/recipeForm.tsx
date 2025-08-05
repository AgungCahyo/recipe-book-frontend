import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useIngredients } from 'context/IngredientsContext';
import DropdownRecipes from 'app/components/DropdownRecipes';
import CustomDropdown from 'app/components/DropdownCustom';
import { useRecipeForm } from 'hooks/useRecipeForm';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';

export default function RecipeForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { satuanList, ingredients } = useIngredients();
  const router = useRouter();

  const {
    title, setTitle,
    steps, updateStep, addStep, removeStep,
    ingredientsList, ingredientName, quantity, unit,
    setIngredientName, setQuantity, setUnit,
    addIngredient, removeIngredient,
    imageUris,
    setImageUris,
    category, setCategory,
    calculateTotalHPP,
    handleSave,
    pickImage,
    editing,
    isUploading
  } = useRecipeForm(id);

  const handleRemoveImage = (index: number) => {
    setImageUris((prev) => prev.filter((_, i) => i !== index));
  };

  const items = ingredients.map((i) => ({ label: i.name, value: i.name }));

  useEffect(() => {
    const selected = ingredients.find((i) => i.name === ingredientName);
    if (selected) setUnit(selected.unit);
  }, [ingredientName]);

  return (
    <>
    <KeyboardAwareScrollView
      className="flex-1 bg-[#F9FAFB] dark:bg-black px-4 pt-8"
      contentContainerStyle={{ paddingBottom: 160 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-8 text-center">
        {editing ? 'Edit Resep' : 'Tambah Resep Baru'}
      </Text>

      {/* Judul */}
      <View className="mb-6">
        <Text className="text-gray-700 dark:text-gray-200 font-semibold mb-2">Judul Resep</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Contoh: Nasi Goreng"
          placeholderTextColor="#9CA3AF"
          className="bg-white dark:bg-neutral-900 border border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-3 text-black dark:text-white shadow-sm"
        />
      </View>

      {/* Kategori */}
      <Text className="text-gray-700 dark:text-gray-200 font-semibold mb-2">Kategori (Opsional)</Text>
      <TextInput
        value={category}
        onChangeText={setCategory}
        placeholder="Contoh: Sarapan"
        placeholderTextColor="#9CA3AF"
        className="bg-white dark:bg-neutral-900 border border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-3 mb-6 text-black dark:text-white shadow-sm"
      />
      <View className="relative flex-1 flex-row mb-6 gap-2">
        <TouchableOpacity
          onPress={pickImage}
          className="bg-gray-100 dark:bg-neutral-800 h-32 py-4 px-4 mr-4 rounded-2xl border border-dashed justify-center items-center gap-2 border-gray-400 dark:border-gray-600"
        >
          <Ionicons
            name='add-circle-outline'
            size={24}
            color="white"
          />
          <Text className="text-center text-gray-700 dark:text-gray-300 font-medium">Tambah Gambar</Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row "
        >
          {/* Gambar */}

          {imageUris.map((img, index) => (
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
                    className="w-full h-full  rounded-xl border border-gray-300"
                  />
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



      {/* Bahan */}
      <Text className="text-gray-700 dark:text-gray-200 font-semibold mb-2">Bahan-bahan</Text>
      <DropdownRecipes
        options={items}
        selectedValue={ingredientName}
        onSelect={setIngredientName}
        placeholder="Pilih bahan"
        onAddNew={() => router.push('/(tabs)/ingredientsSetUp')}
      />

      <View className="flex-row gap-3 mb-4 mt-3">
        <View className="flex-1">
          <Text className="text-gray-700 dark:text-gray-300 mb-1">Jumlah</Text>
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholder="Jumlah"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 text-black dark:text-white bg-white dark:bg-neutral-900"
          />
        </View>
        <View className="flex-1">
          <Text className="text-gray-700 dark:text-gray-300 mb-1">Satuan</Text>
          <CustomDropdown
            value={unit}
            options={satuanList}
            onSelect={setUnit}
            className=""
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={addIngredient}
        className="bg-green-500 py-3 px-4 rounded-xl mb-6 flex-row justify-center items-center gap-2"
      >
        <Ionicons
          name='add-circle-outline'
          size={24}
          color="white"
        />
        <Text className="text-center text-white font-semibold">Tambah Bahan</Text>
      </TouchableOpacity>
      {/* Langkah-langkah */}
      <Text className="text-gray-700 dark:text-gray-200 font-semibold mb-2">Steps (Opsional)</Text>
      {steps.map((step, index) => (
        <View key={index} className="mb-3">
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">Langkah {index + 1}</Text>
          <View className="flex-row items-start gap-2">
            <TextInput
              value={step}
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
      {/* Daftar bahan */}
      <View className="space-y-2 mb-6">
        {ingredientsList.map((item) => (
          <View
            key={item.id}
            className="flex-row justify-between items-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900 px-4 py-3 rounded-xl shadow-sm"
          >
            <Text className="text-black dark:text-white font-medium">
              {item.quantity} {item.unit} {item.name}
            </Text>
            <TouchableOpacity onPress={() => removeIngredient(item.id)}>
              <Text className="text-red-500 font-semibold">Hapus</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

    </KeyboardAwareScrollView>
    <View className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-white dark:bg-black border-t border-gray-200 dark:border-neutral-800">
  {/* Total HPP */}
  <Text className="text-gray-700 dark:text-gray-200 font-semibold mb-2">
    Total HPP: Rp {calculateTotalHPP().toLocaleString('id-ID')}
  </Text>

  {/* Tombol */}
  <TouchableOpacity
    onPress={handleSave}
    className="bg-blue-600 py-4 rounded-2xl shadow-lg flex-row justify-center items-center gap-2"
  >
    <Ionicons
      name={editing ? 'save-outline' : 'add-circle-outline'}
      size={24}
      color="white"
    />
    <Text className="text-white font-bold text-lg tracking-wide">
      {editing ? 'Simpan Perubahan' : 'Tambah Resep'}
    </Text>
  </TouchableOpacity>
</View>

      </>
  );
}