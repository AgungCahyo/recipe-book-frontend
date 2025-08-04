import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  FlatList,
} from 'react-native';
import { useIngredients } from 'context/IngredientsContext';
import IngredientForm from 'app/ingredients/IngredientForm';
import ImportCSV from 'app/components/ImportCSV';
import IngredientItem from 'app/components/IngredientItems';
import { Ingredient } from 'context/IngredientsContext';
import useSelection from 'hooks/useSelection';
import showToast from 'app/utils/showToast';
export default function IngredientsSetup() {
  const {
    ingredients,
    removeIngredient,
    editIngredient,
    setIsFormModalVisible,
    addIngredientFromCSV,
    removeManyIngredients,
    addManyIngredients,
    parseIngredientFromCSV
  } = useIngredients();

  const [search, setSearch] = React.useState('');
  const {
    selectedIds,
    isSelectionMode,
    toggleSelect,
    enableSelection,
    cancelSelection,
    selectAll,
    deselectAll,

  } = useSelection<Ingredient>();

  const deleteSelected = () => {
    removeManyIngredients(selectedIds);
    cancelSelection();
  };

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [ingredients, search]);

  const renderItem = useCallback(
    ({ item }: { item: Ingredient }) => {
      const isSelected = selectedIds.includes(item.id);
      return (
        <IngredientItem
          item={item}
          isSelected={isSelected}
          isSelectionMode={isSelectionMode}
          onPress={() => {
            if (isSelectionMode) {
              toggleSelect(item.id);
            } else {
              editIngredient(item.id);
            }
          }}
          onLongPress={() => {
            if (!isSelectionMode) enableSelection(item.id);
          }}
        />
      );
    },
    [selectedIds, isSelectionMode]
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-black"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      {/* Header */}
      <View className="px-5 pt-10 pb-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black shadow-sm">
        <Text className="text-2xl font-semibold text-gray-900 dark:text-white text-center">
          Daftar Bahan
        </Text>
        <TextInput
          placeholder="Cari bahan..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl"
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredIngredients}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        extraData={{ selectedIds, isSelectionMode }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 160 }}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={21}
      />

      {/* Form */}
      <IngredientForm />

      <View className="absolute bottom-6 right-6 items-end gap-2">
        {isMenuOpen && (
          <View className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-48 py-2">
            <TouchableOpacity
              onPress={() => {
                setIsMenuOpen(false);
                setIsFormModalVisible(true);
              }}
              className="px-4 py-4 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Text className="text-gray-800 dark:text-white">Tambah Manual</Text>
            </TouchableOpacity>

            <ImportCSV
              onImport={(data) => {
                const valid = data
                  .map(parseIngredientFromCSV)
                  .filter((item): item is Ingredient => {
                    if (!item) return false;

                    const isDuplicate = ingredients.some((ing) =>
                      ing.name.toLowerCase().trim() === item.name.toLowerCase().trim()
                    );

                    return !isDuplicate;
                  });

                if (valid.length > 0) {
                  addManyIngredients(valid);
                  showToast(`${valid.length} bahan berhasil diimpor`);
                } else {
                  showToast('Tidak ada bahan baru yang diimpor');
                }
              }}
            />
          </View>
        )}

        <TouchableOpacity
          onPress={() => setIsMenuOpen((prev) => !prev)}
          className="bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-md"
          activeOpacity={0.85}
        >
          <Text className="text-white text-3xl font-bold">＋</Text>
        </TouchableOpacity>
      </View>

      {/* Selection Mode Actions */}
      {isSelectionMode && (
        <View className="absolute bottom-6 left-6 right-6 flex-row gap-3">
          <TouchableOpacity
            onPress={() =>
              selectedIds.length === filteredIngredients.length
                ? deselectAll()
                : selectAll(filteredIngredients)
            }
            className="flex-1 bg-blue-100 py-3 rounded-xl"
          >
            <Text className="text-blue-700 text-center font-medium">
              {selectedIds.length === filteredIngredients.length
                ? 'Batal Pilih Semua'
                : 'Pilih Semua'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={deleteSelected}
            className="flex-1 bg-red-500 py-3 rounded-xl"
          >
            <Text className="text-white text-center font-medium">Hapus</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={cancelSelection}
            className="flex-1 bg-gray-200 py-3 rounded-xl"
          >
            <Text className="text-gray-800 text-center font-medium">Batal</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>

  );
}
