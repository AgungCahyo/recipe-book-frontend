import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIngredients } from 'context/IngredientsContext';
import showToast from 'utils/showToast';

export default function EditIngredientPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const {
    ingredients,
    satuanList,
    handleSubmit,
    resetForm,
    setIdBeingEdited,
    setIsEditing,
  } = useIngredients();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [totalPrice, setTotalPrice] = useState('');

  useEffect(() => {
    const target = ingredients.find((item) => item.id === id);
    if (!target) {
      showToast('Bahan tidak ditemukan');
      return;
    }

    setName(target.name);
    setQuantity(target.quantity.toString());
    setUnit(target.unit);
    setTotalPrice(target.totalPrice.toString());

    setIsEditing(true);
    setIdBeingEdited(id ?? null);

    return () => {
      resetForm();
    };
  }, [id]);

  if (!id || !ingredients.find((item) => item.id === id)) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-black px-4">
        <Text className="text-gray-500 dark:text-gray-400">Bahan tidak ditemukan.</Text>
      </View>
    );
  }

  const handleSave = () => {
    const qty = parseFloat(quantity);
    const price = parseFloat(totalPrice);

    if (!name.trim() || isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
      showToast('Isi data dengan benar');
      return;
    }

    handleSubmit({
      name: name.trim(),
      quantity: qty,
      totalPrice: price,
      unit,
    });

    setTimeout(() => {
      router.back();
    }, 400);
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 100 }}
      className="flex-1 px-5 pt-8 bg-white dark:bg-black"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400 mb-10">
        Edit Bahan
      </Text>

      {/* Nama Bahan */}
      <View className="mb-6">
        <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
          Nama Bahan
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Contoh: Gula Pasir"
          placeholderTextColor="#9CA3AF"
          className="bg-white dark:bg-neutral-900 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-black dark:text-white shadow-sm"
        />
      </View>

      {/* Jumlah */}
      <View className="mb-6">
        <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
          Jumlah
        </Text>
        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          placeholder="Contoh: 1000"
          placeholderTextColor="#9CA3AF"
          className="bg-white dark:bg-neutral-900 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-black dark:text-white shadow-sm"
        />
      </View>

      {/* Satuan */}
      <View className="mb-6">
        <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
          Satuan
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
          {satuanList.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setUnit(item)}
              className={`px-4 py-2 rounded-full border ${
                unit === item
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-gray-600'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  unit === item ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                }`}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Total Harga */}
      <View className="mb-8">
        <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
          Total Harga (Rp)
        </Text>
        <TextInput
          value={totalPrice}
          onChangeText={setTotalPrice}
          keyboardType="numeric"
          placeholder="Contoh: 13000"
          placeholderTextColor="#9CA3AF"
          className="bg-white dark:bg-neutral-900 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-black dark:text-white shadow-sm"
        />
      </View>

      {/* Tombol Simpan */}
      <TouchableOpacity
        onPress={handleSave}
        className="bg-green-600 py-4 rounded-2xl shadow-lg flex-row justify-center items-center gap-2"
      >
        <Text className="text-white font-bold text-lg tracking-wide">
          Simpan Perubahan
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
