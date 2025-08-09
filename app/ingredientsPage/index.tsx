import React, { useMemo, useCallback, useState, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  useColorScheme,
  InteractionManager,
} from 'react-native';
import { useIngredients } from 'context/ingredients/IngredientsProvider';
import IngredientForm from 'app/ingredients/IngredientForm';
import { cvsImporter } from 'utils/cvsImporter';
import IngredientItem from 'app/components/IngredientItems';
import { Ingredient } from 'context/ingredients/IngredientsProvider';
import useSelection from 'hooks/useSelection';
import SearchBar from 'app/components/SearchBar';
import { useAlert } from 'context/AlertContext';
import FABAdd from 'app/components/FABAdd';
import RefreshableFlatList from 'app/components/RefreshFlatList';
import { useFocusEffect } from '@react-navigation/native';

type TabProps = {
  goToHome: () => void;
  goToRecipes: () => void;
  goToIngredients: () => void;
  isFocused: boolean;
};

// Memoize components to prevent unnecessary re-renders
const MemoizedIngredientItem = memo(IngredientItem);
const MemoizedSearchBar = memo(SearchBar);
const MemoizedFABAdd = memo(FABAdd);
const MemoizedIngredientForm = memo(IngredientForm);

// Constants
const KEYBOARD_OFFSET = Platform.OS === 'ios' ? 80 : 0;
const KEYBOARD_BEHAVIOR = Platform.OS === 'ios' ? 'padding' : 'height';

export default function IngredientsSetup({ isFocused }: TabProps) {
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused: IngredientsScreen');
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
  const { showAlert } = useAlert();
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

  // Optimize filtering with better performance
  const filteredIngredients = useMemo(() => {
    if (!search.trim()) return ingredients;
    
    const searchTerm = search.toLowerCase().trim();
    return ingredients.filter((item) => {
      // Early return for performance
      if (!item?.name) return false;
      return item.name.toLowerCase().includes(searchTerm);
    });
  }, [ingredients, search]);

  // Memoize render item to prevent recreation
  const renderItem = useCallback(
    ({ item }: { item: Ingredient }) => {
      const isSelected = selectedIds.includes(item.id);
      
      const handlePress = () => {
        if (isSelectionMode) {
          toggleSelect(item.id);
        } else {
          // Defer heavy operations until interactions complete
          InteractionManager.runAfterInteractions(() => {
            editIngredient(item.id);
          });
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

  // Optimize key extractor
  const keyExtractor = useCallback((item: Ingredient) => item.id, []);

  // Optimize refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await reloadIngredients();
    } catch (error) {
      console.error('Gagal refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [reloadIngredients]);

  // Optimize CSV import with better error handling
  const handleImportCSV = useCallback(async () => {
    try {
      const data = await cvsImporter();
      if (!data) {
        showAlert('Gagal membaca file CSV', 'error');
        return;
      }

      // Use Set for better performance on duplicate checking
      const existingNames = new Set(
        ingredients.map(ing => ing.name.toLowerCase().trim())
      );

      const parsed = data
        .map(parseIngredientFromCSV)
        .filter((item): item is Ingredient => {
          if (!item) return false;
          return !existingNames.has(item.name.toLowerCase().trim());
        });

      if (parsed.length > 0) {
        await addManyIngredients(parsed);
        showAlert(`${parsed.length} bahan berhasil diimpor`, 'success');
      } else {
        showAlert('Tidak ada bahan baru yang diimpor', 'error');
      }
    } catch (error) {
      console.error('Import CSV error:', error);
      showAlert('Terjadi kesalahan saat mengimpor CSV', 'error');
    }
  }, [ingredients, parseIngredientFromCSV, addManyIngredients, showAlert]);

  // Optimize delete function
  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    
    InteractionManager.runAfterInteractions(() => {
      removeManyIngredients(selectedIds);
      cancelSelection();
    });
  }, [selectedIds, removeManyIngredients, cancelSelection]);

  // Memoize FAB actions
  const fabActions = useMemo(() => [
    { 
      icon: 'create-outline' as const, 
      onPress: () => {
        InteractionManager.runAfterInteractions(() => {
          setIsFormModalVisible(true);
        });
      }
    },
    { 
      icon: 'cloud-upload-outline' as const, 
      onPress: handleImportCSV 
    },
  ], [setIsFormModalVisible, handleImportCSV]);

  // Memoize content container style
  const contentContainerStyle = useMemo(() => ({
    paddingBottom: isSelectionMode ? 140 : 100,
    paddingTop: 12,
    flexGrow: 1,
  }), [isSelectionMode]);

  // Memoize extra data for FlatList
  const extraData = useMemo(() => ({
    selectedIds: selectedIds.join(','), // Convert to string for stable reference
    isSelectionMode
  }), [selectedIds, isSelectionMode]);

  // Memoize selection handlers
  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredIngredients.length) {
      deselectAll();
    } else {
      selectAll(filteredIngredients);
    }
  }, [selectedIds.length, filteredIngredients.length, filteredIngredients, deselectAll, selectAll]);

  // Memoize selection button text
  const selectAllText = useMemo(() => {
    return selectedIds.length === filteredIngredients.length
      ? 'Batal Pilih Semua'
      : 'Pilih Semua';
  }, [selectedIds.length, filteredIngredients.length]);

  // Memoize empty component
  const ListEmptyComponent = useMemo(() => (
    <View className="flex-1 items-center justify-center mt-10">
      <Text className="italic text-gray-500 text-center">
        {search
          ? 'Bahan tidak ditemukan.\nCoba kata kunci lain.'
          : 'Belum ada bahan.\nTambah bahan baru terlebih dahulu.'}
      </Text>
    </View>
  ), [search]);

  return (
    <SafeAreaView className="flex-1 bg-[#fff] dark:bg-dark">
      <View className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className='border-b mx-5 border-primary'>
          <Text className="text-3xl px-5 py-3 rounded-3xl font-semibold text-primary dark:text-accent text-center">
            Daftar Bahan
          </Text>
        </View>

        <KeyboardAvoidingView
          behavior={KEYBOARD_BEHAVIOR}
          keyboardVerticalOffset={KEYBOARD_OFFSET}
          style={{ flex: 1 }}
        >
          <RefreshableFlatList
            data={filteredIngredients}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            extraData={extraData}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={contentContainerStyle}
            // Performance optimizations
            initialNumToRender={15}
            maxToRenderPerBatch={15}
            windowSize={15}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={50}
            // Refresh functionality
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            // Empty state
            ListEmptyComponent={ListEmptyComponent}
          />
        </KeyboardAvoidingView>

        {/* Form Modal - Memoized */}
        <MemoizedIngredientForm />
      </View>

      {/* FAB - Memoized */}
      <View className="absolute bottom-10 right-6">
        <MemoizedFABAdd
          isFocused={isFocused}
          actions={fabActions}
        />
      </View>

      {/* Search Bar - Memoized */}
      <View className='pb-5'>
        <MemoizedSearchBar
          placeholder="Cari bahan..."
          title="Daftar Bahan"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Selection Mode Actions */}
      {isSelectionMode && (
        <View className="absolute bottom-6 left-6 right-6 flex-row gap-3">
          <TouchableOpacity
            onPress={handleSelectAll}
            className="flex-1 bg-blue-100 py-3 rounded-xl"
          >
            <Text className="text-blue-700 text-center font-medium">
              {selectAllText}
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
    </SafeAreaView>
  );
}