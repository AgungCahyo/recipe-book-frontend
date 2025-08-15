import React, { useMemo, useCallback, useState, memo } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  SafeAreaView,
  useColorScheme,
  InteractionManager,
} from 'react-native';
import { useIngredients } from 'context/ingredients/IngredientsProvider';
import IngredientForm from 'app/main/ingredients/IngredientForm';
import { cvsImporter } from 'utils/cvsImporter';
import IngredientItem from 'app/components/IngredientItems';
import { Ingredient } from 'context/ingredients/IngredientsProvider';
import useSelection from 'hooks/useSelection';
import SearchBar from 'app/components/SearchBar';
import FABAdd from 'app/components/FABAdd';
import RefreshableFlatList from 'app/components/RefreshFlatList';
import { useFocusEffect } from '@react-navigation/native';
import SelectionModeActions from 'app/components/SelectionModeAction';
import showToast from 'utils/showToast';

type TabProps = {
  goToHome: () => void;
  goToRecipes: () => void;
  goToIngredients: () => void;
  isFocused: boolean;
};

const MemoizedIngredientItem = memo(IngredientItem, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isSelectionMode === nextProps.isSelectionMode
  );
});

const MemoizedSearchBar = memo(SearchBar, (prevProps, nextProps) => {
  return prevProps.value === nextProps.value;
});

const MemoizedFABAdd = memo(FABAdd);
const MemoizedIngredientForm = memo(IngredientForm);

const FLATLIST_CONFIG = {
  initialNumToRender: 8,
  maxToRenderPerBatch: 8,
  windowSize: 21,
  removeClippedSubviews: true,
  updateCellsBatchingPeriod: 100,
  keyboardShouldPersistTaps: 'handled' as const,
};

export default function IngredientsSetup({ isFocused }: TabProps) {
  useFocusEffect(
    useCallback(() => {
      if (__DEV__) {
      }
    }, [])
  );

  const {
    ingredients,
    removeIngredient,
    editIngredient,
    setIsFormModalVisible,
    addIngredientFromCSV,
    removeManyIngredients,
    addManyIngredients,
    parseIngredientFromCSV,
    reloadIngredients,
  } = useIngredients();

  const [search, setSearch] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    selectedIds,
    isSelectionMode,
    toggleSelect,
    enableSelection,
    cancelSelection,
    selectAll,
    deselectAll,
  } = useSelection<Ingredient>();

  const colorScheme = useColorScheme();

  const filteredIngredients = useMemo(() => {
    if (!ingredients?.length) return [];

    if (!search.trim()) return ingredients;

    const searchTerm = search.toLowerCase().trim();
    const searchWords = searchTerm.split(/\s+/);

    return ingredients.filter((item) => {

      if (!item?.name) return false;
      const itemName = item.name.toLowerCase();
      return searchWords.every((word) => itemName.includes(word));
    });
  }, [ingredients, search]);

  const renderItem = useCallback(
    ({ item }: { item: Ingredient }) => {
      const isSelected = selectedIds.includes(item.id);

      const handlePress = () => {
        if (isSelectionMode) {
          toggleSelect(item.id);
        } else {
          editIngredient(item.id);
        }
      };

      const handleLongPress = () => {
        if (!isSelectionMode) {
          enableSelection(item.id);
        }
      };

      return (
        <MemoizedIngredientItem
          item={item}
          isSelected={isSelected}
          isSelectionMode={isSelectionMode}
          onPress={handlePress}
          onLongPress={handleLongPress}
        />
      );
    },
    [selectedIds, isSelectionMode, toggleSelect, editIngredient, enableSelection]
  );

  const keyExtractor = useCallback((item: Ingredient) => `ingredient-${item.id}`, []);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await reloadIngredients();
    } catch (error) {
      console.error('Gagal refresh:', error);
      showToast('Gagal memuat data', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [reloadIngredients, isRefreshing, showToast]);

  const handleImportCSV = useCallback(async () => {
    try {
      const data = await cvsImporter();
      if (!data?.length) {
        showToast('File CSV kosong atau tidak valid', 'error');
        return;
      }

      const existingNamesSet = new Set(
        ingredients.map((ing) => ing.name.toLowerCase().trim())
      );

      const validItems = data
        .map(parseIngredientFromCSV)
        .filter((item): item is Ingredient => {
          if (!item?.name?.trim()) return false;
          return !existingNamesSet.has(item.name.toLowerCase().trim());
        });

      if (validItems.length > 0) {
        InteractionManager.runAfterInteractions(async () => {
          try {
            await addManyIngredients(validItems);
            showToast(`${validItems.length} bahan berhasil diimpor`, 'success');
          } catch (error) {
            showToast('Gagal mengimpor beberapa bahan', 'error');
          }
        });
      } else {
        showToast('Tidak ada bahan baru yang valid untuk diimpor', 'warning');
      }
    } catch (error) {
      console.error('Import CSV error:', error);
      showToast('Terjadi kesalahan saat mengimpor CSV', 'error');
    }
  }, [ingredients, parseIngredientFromCSV, addManyIngredients, showToast]);

  const deleteSelected = useCallback(async () => {
    if (selectedIds.length === 0) return;

    try {
      await removeManyIngredients(selectedIds);
      cancelSelection();
      showToast(`${selectedIds.length} bahan berhasil dihapus`, 'success');
    } catch (error) {
      showToast('Gagal menghapus beberapa bahan', 'error');
    }
  }, [selectedIds, removeManyIngredients, cancelSelection, showToast]);

  const fabActions = useMemo(
    () => [
      {
        icon: 'create-outline' as const,
        onPress: () => setIsFormModalVisible(true),
      },
      {
        icon: 'cloud-upload-outline' as const,
        onPress: handleImportCSV,
      },
    ],
    [setIsFormModalVisible, handleImportCSV]
  );

  const extraData = useMemo(
    () => ({
      selection: `${selectedIds.length}-${isSelectionMode}`,
      filteredCount: filteredIngredients.length,
    }),
    [selectedIds.length, isSelectionMode, filteredIngredients.length]
  );

  const handleSelectAll = useCallback(() => {
    const allSelected =
      selectedIds.length === filteredIngredients.length && selectedIds.length > 0;
    if (allSelected) {
      deselectAll();
    } else {
      selectAll(filteredIngredients);
    }
  }, [selectedIds.length, filteredIngredients, deselectAll, selectAll]);

  const selectAllText = useMemo(() => {
    const allSelected =
      selectedIds.length === filteredIngredients.length && selectedIds.length > 0;
    return allSelected ? 'Batal Pilih Semua' : 'Pilih Semua';
  }, [selectedIds.length, filteredIngredients.length]);

  const ListEmptyComponent = useMemo(
    () => (
      <View className="flex-1 items-center justify-center mt-20">
        <Text className="italic text-primary text-center text-base leading-6">
          {search
            ? 'Bahan tidak ditemukan.\nCoba kata kunci lain.'
            : 'Belum ada bahan\n ditambahkan.'}
        </Text>
      </View>
    ),
    [search]
  );

  return (
    <SafeAreaView className="flex-1 bg-[#fff] dark:bg-dark">
      <View className="flex-1 px-2 pt-4">
        {/* Header */}
        <View className="border-b mx-5 border-primary">
          <Text className="text-3xl px-5 py-3 rounded-3xl font-semibold text-dark dark:text-accent text-center">
            Daftar Bahan
          </Text>
        </View>



        <KeyboardAvoidingView style={{ flex: 1, }}>
          <RefreshableFlatList
            data={filteredIngredients}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            extraData={extraData}
            {...FLATLIST_CONFIG}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={ListEmptyComponent}
            contentContainerClassName="pb-[100] bg-transparent"
          />
        </KeyboardAvoidingView>

        <MemoizedIngredientForm />

        <View className="absolute bottom-10 right-6">
          <MemoizedFABAdd isFocused={isFocused} actions={fabActions} />
        </View>

        {/* Search Bar */}
        <View className="absolute bottom-0 right-0 left-0 pb-5">
          <MemoizedSearchBar
            placeholder="Cari bahan..."
            title="Daftar Bahan"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>


      <SelectionModeActions
        isSelectionMode={isSelectionMode}
        handleSelectAll={handleSelectAll}
        selectAllText={selectAllText}
        deleteSelected={deleteSelected}
        selectedCount={selectedIds.length}
        cancelSelection={cancelSelection}
      />
    </SafeAreaView>
  );
}
