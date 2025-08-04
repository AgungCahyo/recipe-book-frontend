// app/ingredients/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIngredients } from 'context/IngredientsContext';
import showToast from '../utils/showToast';

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
  const [unit, setUnit] = useState(satuanList[0]);
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
      <View className="p-4">
        <Text>Bahan tidak ditemukan.</Text>
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
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text className="text-lg font-bold mb-4">Edit Bahan</Text>

      <Text className="mb-1">Nama Bahan</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        className="border p-2 rounded mb-4"
      />

      <Text className="mb-1">Jumlah</Text>
      <TextInput
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        className="border p-2 rounded mb-4"
      />

      <Text className="mb-1">Satuan</Text>
      <ScrollView horizontal className="mb-4">
        {satuanList.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setUnit(item)}
            className={`px-3 py-2 rounded mr-2 ${unit === item ? 'bg-blue-500' : 'bg-gray-200'}`}
          >
            <Text className={unit === item ? 'text-white' : 'text-black'}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text className="mb-1">Total Harga</Text>
      <TextInput
        value={totalPrice}
        onChangeText={setTotalPrice}
        keyboardType="numeric"
        className="border p-2 rounded mb-6"
      />

      <TouchableOpacity
        onPress={handleSave}
        className="bg-green-600 p-3 rounded items-center"
      >
        <Text className="text-white font-bold">Simpan Perubahan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
