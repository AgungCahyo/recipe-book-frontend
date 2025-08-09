import React, { useRef, useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import CustomModal from '../components/CustomModal';
import { useIngredients } from '../../context/ingredients/IngredientsProvider';
import UnitsDropdown from '../components/DropdownSelect';

export default function IngredientForm() {
  const {
    isFormModalVisible,
    setIsFormModalVisible,
    isEditing,
    idBeingEdited,
    ingredients,
    satuanList,
    handleSubmit,
    resetForm,
  } = useIngredients();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [unit, setUnit] = useState(satuanList[0]);

  const quantityRef = useRef<TextInput>(null);
  const priceRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!isFormModalVisible) return;

    if (isEditing && idBeingEdited) {
      const existing = ingredients.find((i) => i.id === idBeingEdited);
      if (existing) {
        setName(existing.name);
        setQuantity(existing.quantity.toString());
        setTotalPrice(existing.totalPrice.toString());
        setUnit(existing.unit);
      }
    } else {
      setName('');
      setQuantity('');
      setTotalPrice('');
      setUnit(satuanList[0]);
    }
  }, [isFormModalVisible]);

  const onSubmit = () => {
    const qty = parseFloat(quantity);
    const price = parseFloat(totalPrice);

    if (!name.trim() || isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
      return;
    }

    handleSubmit({
      name: name.trim(),
      quantity: qty,
      totalPrice: price,
      unit,
    });
  };

  return (
    <CustomModal
      open={isFormModalVisible}
      onClose={resetForm}
      title={isEditing ? 'Edit Bahan' : 'Tambah Bahan Baru'}
    >
      {/* Nama Bahan */}
      <Text className="text-gray-600 dark:text-gray-300 mb-1 text-sm">Nama Bahan</Text>
      <TextInput
        placeholder="Contoh: Gula Pasir"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        placeholderTextColor="#9CA3AF"
        returnKeyType="next"
        onSubmitEditing={() => quantityRef.current?.focus()}
        className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 mb-3 text-black dark:text-white bg-white dark:bg-gray-800"
      />

      {/* Harga Total */}
      <Text className="text-gray-600 dark:text-gray-300 mb-1 text-sm">Harga Total Bahan</Text>
      <TextInput
        placeholder="Contoh: 15000"
        value={totalPrice}
        onChangeText={setTotalPrice}
        keyboardType="numeric"
        placeholderTextColor="#9CA3AF"
        ref={quantityRef}
        returnKeyType="next"
        onSubmitEditing={() => priceRef.current?.focus()}
        className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 mb-3 text-black dark:text-white bg-white dark:bg-gray-800"
      />

      {/* Jumlah */}
      <Text className="text-gray-600 dark:text-gray-300 mb-1 text-sm">Jumlah Bahan</Text>
      <TextInput
        placeholder="Contoh: 1000"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        placeholderTextColor="#9CA3AF"
        returnKeyType="done"
        ref={priceRef}
        className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 mb-3 text-black dark:text-white bg-white dark:bg-gray-800"
      />

      {/* Satuan */}
      <Text className="text-gray-600 dark:text-gray-300 mb-1 text-sm">Satuan</Text>
      <UnitsDropdown
        value={unit}
        options={satuanList}
        onSelect={(val) => setUnit(val)}
      />

      {/* Aksi */}
      <View className="flex-row gap-2 mt-4">
        <TouchableOpacity
          onPress={onSubmit}
          className={`flex-1 py-3 rounded-lg ${isEditing ? 'bg-yellow-500' : 'bg-blue-600'}`}
        >
          <Text className="text-center text-white font-semibold">
            {isEditing ? 'Simpan Perubahan' : 'Tambah Bahan'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={resetForm}
          className="flex-1 py-3 rounded-lg bg-gray-300 dark:bg-gray-600"
        >
          <Text className="text-center text-gray-800 dark:text-white font-semibold">Batal</Text>
        </TouchableOpacity>
      </View>
    </CustomModal>
  );
}