import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useIngredients } from 'context/IngredientsContext';
import IngredientForm from 'app/ingredients/IngredientForm';
import { cvsImporter } from 'utils/cvsImporter';
import IngredientItem from 'app/components/IngredientItems';
import { Ingredient } from 'context/IngredientsContext';
import useSelection from 'hooks/useSelection';
import SearchBar from 'app/components/SearchBar';
import { useAlert } from 'context/AlertContext';
import FABAdd from 'app/components/FABAdd';
import RefreshableFlatList from 'app/components/RefreshFlatList';
import { Ionicons } from '@expo/vector-icons';
export default function IngredientsSetup() {
  const {
    ingredients,
    removeIngredient,
    editIngredient,
    setIsFormModalVisible,
    addIngredientFromCSV,
    removeManyIngredients,
    addManyIngredients,
    parseIngredientFromCSV,
    reloadIngredients
  } = useIngredients();

  const [search, setSearch] = useState('');
  const { showAlert } = useAlert();
  const [isCSVImportVisible, setIsCSVImportVisible] = useState(false);

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
          onPress={() =>
            isSelectionMode
              ? toggleSelect(item.id)
              : editIngredient(item.id)
          }
          onLongPress={() => {
            if (!isSelectionMode) enableSelection(item.id);
          }}
        />
      );
    },
    [selectedIds, isSelectionMode]
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await reloadIngredients();
    } catch (error) {
      console.error('Gagal refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleImportCSV = async () => {
    const data = await cvsImporter();
    if (!data) {
      showAlert('Gagal membaca file CSV', 'error');
      return;
    }

    const parsed = data
      .map(parseIngredientFromCSV)
      .filter((item): item is Ingredient => {
        if (!item) return false;
        const isDuplicate = ingredients.some(
          (ing) =>
            ing.name.toLowerCase().trim() ===
            item.name.toLowerCase().trim()
        );
        return !isDuplicate;
      });

    if (parsed.length > 0) {
      addManyIngredients(parsed);
      showAlert(`${parsed.length} bahan berhasil diimpor`, 'success');
    } else {
      showAlert('Tidak ada bahan baru yang diimpor', 'error');
    }
  };
  console.log('ingredients rendered');
  console.log(Ionicons.glyphMap['create-outline']); // kalau undefined → error!
  console.log('ingredients:', ingredients);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
        style={{ flex: 1 }}
      >
        <View className="flex-1 px-4 pt-4">
          <SearchBar
            placeholder="Cari bahan..."
            title="Daftar Bahan"
            value={search}
            onChangeText={setSearch}
          />

          <RefreshableFlatList
            data={filteredIngredients}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            extraData={{ selectedIds, isSelectionMode }}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 12, paddingTop: 12, borderRadius: 10, borderBlockColor: '#000' }}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={21}
            removeClippedSubviews
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
          <IngredientForm />
        </View>
        <View className="absolute bottom-6 right-6">
          <FABAdd
            actions={[
              {
                icon: 'create-outline',
                onPress: () => setIsFormModalVisible(true),
              },
              {
                icon: 'cloud-upload-outline',
                onPress: handleImportCSV,
              },
            ]}
          />
        </View>
        {/* Selection Mode Action Bar */}
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
    </SafeAreaView>
  );
}
