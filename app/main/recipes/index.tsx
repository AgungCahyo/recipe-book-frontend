import React, { useCallback, useMemo, useState, useEffect, memo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  InteractionManager,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Recipe, useRecipesData, useRecipesActions, } from '../../../context/RecipesContext';
import RecipeCard from 'app/components/RecipeCard';
import FilteredCategory from 'app/components/FilteredCategory';
import SearchBar from '../../components/SearchBar';
import FABAdd from '../../components/FABAdd';
import { useColorScheme } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRecipeImporter } from '../../../hooks/useRecipeImporter';
import SelectionModeActions from 'app/components/SelectionModeAction';
import RefreshableFlatList from 'app/components/RefreshFlatList';

type TabProps = {
  isFocused: boolean;
};

const MemoizedRecipeCard = memo(RecipeCard);
const MemoizedFilteredCategory = memo(FilteredCategory);
const MemoizedFABAdd = memo(FABAdd);
const MemoizedSearchBar = memo(SearchBar, (prevProps, nextProps) => prevProps.value === nextProps.value);

const KEYBOARD_OFFSET = Platform.OS === 'ios' ? 80 : 0;
const KEYBOARD_BEHAVIOR = Platform.OS === 'ios' ? 'padding' : 'height';

const PAGE_SIZE = 10;

export default function Recipes({ isFocused }: TabProps) {
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused: RecipesScreen');
    }, [])
  );

  const { importFromCSV } = useRecipeImporter();
  const recipes = useRecipesData();
  const { reloadRecipes, deleteRecipe } = useRecipesActions();
  const router = useRouter();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setLoadingId(null);
      return () => setLoadingId(null);
    }, [])
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 50);
    return () => clearTimeout(handler);
  }, [search]);

  const sortedRecipes = useMemo(() => {
    return [...recipes].sort((a, b) => a.title.localeCompare(b.title));
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    if (!sortedRecipes.length) return [];
    const keyword = debouncedSearch.toLowerCase().trim();
    const categoryFilter = selectedCategory.toLowerCase().trim();
    return sortedRecipes.filter((recipe) => {
      if (!recipe?.id || !recipe?.title) return false;
      if (keyword && !recipe.title.toLowerCase().includes(keyword)) return false;
      if (categoryFilter && recipe.category?.toLowerCase() !== categoryFilter) return false;
      return true;
    });
  }, [debouncedSearch, selectedCategory, sortedRecipes]);

  const pagedRecipes = useMemo(() => filteredRecipes.slice(0, PAGE_SIZE * page), [filteredRecipes, page]);

  const handleLoadMore = useCallback(() => {
    if (pagedRecipes.length < filteredRecipes.length) {
      setPage((prev) => prev + 1);
    }
  }, [pagedRecipes.length, filteredRecipes.length]);

  const handlePress = useCallback(
    (id: string) => {
      setLoadingId(id);
      setTimeout(() => {
        InteractionManager.runAfterInteractions(() => {
          router.push(`/main/recipes/${id}`);
        });
      }, 100);
    },
    [router]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await reloadRecipes();
      setPage(1);
    } catch (error) {
      console.error('Gagal refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [reloadRecipes]);

  // SELECTION MODE STATE & HANDLERS
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const enableSelection = useCallback((id: string) => {
    setIsSelectionMode(true);
    setSelectedIds([id]);
  }, []);

  const cancelSelection = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedIds([]);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(pagedRecipes.map((r) => r.id));
  }, [pagedRecipes]);

  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const deleteSelected = useCallback(async () => {
    try {
      // Loop setiap id dan tunggu proses hapusnya selesai satu per satu
      for (const id of selectedIds) {
        await deleteRecipe(id);
      }
      cancelSelection();
    } catch (error) {
      console.error('Gagal hapus resep:', error);
    }
  }, [selectedIds, cancelSelection, deleteRecipe]);


  // Select all text toggle
  const selectAllText =
    selectedIds.length === pagedRecipes.length && pagedRecipes.length > 0
      ? 'Batal Pilih Semua'
      : 'Pilih Semua';

  const renderRecipeCard = useCallback(
    ({ item }: { item: Recipe }) => {
      const isSelected = selectedIds.includes(item.id);

      const onPress = () => {
        if (isSelectionMode) {
          toggleSelect(item.id);
        } else {
          handlePress(item.id);
        }
      };

      const onLongPress = () => {
        if (!isSelectionMode) {
          enableSelection(item.id);
        }
      };

      return (
        <MemoizedRecipeCard
          item={item}
          isDark={isDark}
          onPress={onPress}
          onLongPress={onLongPress}
          selected={isSelected}
          isSelectionMode={isSelectionMode}

        />
      );
    },
    [handlePress, isDark, loadingId, selectedIds, isSelectionMode, toggleSelect, enableSelection]
  );

  const keyExtractor = useCallback((item: Recipe) => item.id, []);
  const columnWrapperStyle = useMemo(
    () => ({
      justifyContent: 'space-between' as const,
      marginBottom: 12,
    }),
    []
  );

  const fabActions = useMemo(
    () => [
      {
        icon: 'book-outline' as const,
        onPress: () => {
          InteractionManager.runAfterInteractions(() => {
            router.push('/main/recipes/recipeForm');
          });
        },
      },
      {
        icon: 'cloud-upload-outline' as const,
        onPress: () => importFromCSV(),
      },
    ],
    [router, importFromCSV]
  );
  const isEmpty = pagedRecipes.length === 0;


  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark' : 'bg-white'}`}>
      <KeyboardAvoidingView
        behavior={KEYBOARD_BEHAVIOR}
        keyboardVerticalOffset={KEYBOARD_OFFSET}
        style={{ flex: 1 }}
      >
        <View className="flex-1 px-4 pt-4">
          <View className={`border-b mx-5 ${isDark ? 'border-accent' : 'border-primary'}`}>
            <Text className={`text-3xl px-5 py-3 rounded-3xl font-semibold ${isDark ? 'text-accent' : 'text-dark'} text-center`}>
              Daftar Resep
            </Text>
          </View>

          <View className="flex-row justify-end items-center mt-4 mb-2">
            <MemoizedFilteredCategory selected={selectedCategory} onSelect={setSelectedCategory} />
          </View>

          {isEmpty ? (
            <Text
              className={`text-center italic mt-10 text-base ${isDark ? 'text-muted' : 'text-primary'}`}
            >
              Tidak ada hasil.
            </Text>
          ) : (
            <RefreshableFlatList
              data={pagedRecipes}
              keyExtractor={keyExtractor}
              numColumns={2}
              columnWrapperStyle={columnWrapperStyle}
              keyboardShouldPersistTaps="handled"
              isRefreshing={isRefreshing}
              onRefresh={handleRefresh}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              showsVerticalScrollIndicator={false}
              renderItem={renderRecipeCard}
              removeClippedSubviews={true}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              windowSize={5}
              updateCellsBatchingPeriod={50}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          )}
        </View>
      </KeyboardAvoidingView>

      <View className="absolute bottom-10 right-6">
        <MemoizedFABAdd isFocused={isFocused} actions={fabActions} />
      </View>

      <View className="absolute bottom-0 right-0 left-0  pb-5">
        <MemoizedSearchBar placeholder="Cari Resep..." title="Daftar Resep" value={search} onChangeText={setSearch} />
      </View>

      <SelectionModeActions
        isSelectionMode={isSelectionMode}
        handleSelectAll={() => {
          const allSelected = selectedIds.length === pagedRecipes.length && pagedRecipes.length > 0;
          if (allSelected) {
            deselectAll();
          } else {
            selectAll();
          }
        }}
        selectAllText={selectAllText}
        deleteSelected={deleteSelected}
        selectedCount={selectedIds.length}
        cancelSelection={cancelSelection}
      />
    </SafeAreaView>
  );
}
