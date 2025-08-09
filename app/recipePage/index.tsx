import React, { useCallback, useMemo, useState, memo } from 'react';
import { View, Text, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, StyleSheet, InteractionManager } from 'react-native';
import { useRouter } from 'expo-router';
import { Recipe, useRecipes } from '../../context/RecipesContext';
import RecipeCard from 'app/components/RecipeCard';
import RefreshableFlatList from 'app/components/RefreshFlatList';
import FilteredCategory from 'app/components/FilteredCategory';
import SearchBar from '../components/SearchBar';
import FABAdd from '../components/FABAdd';
import { useColorScheme } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {useRecipeImporter} from '../../hooks/useRecipeImporter'

type TabProps = {
  isFocused: boolean;
};

// Memoize individual components to prevent unnecessary re-renders
const MemoizedRecipeCard = memo(RecipeCard);
const MemoizedFilteredCategory = memo(FilteredCategory);
const MemoizedSearchBar = memo(SearchBar);
const MemoizedFABAdd = memo(FABAdd);

// Constants to avoid recreating objects
const KEYBOARD_OFFSET = Platform.OS === 'ios' ? 80 : 0;
const KEYBOARD_BEHAVIOR = Platform.OS === 'ios' ? 'padding' : 'height';

export default function Recipes({ isFocused }: TabProps) {
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused: RecipesScreen');
    }, [])
  );
 const { importFromCSV } = useRecipeImporter();
  const { recipes, reloadRecipes } = useRecipes();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const theme = useColorScheme();
  const isDark = theme === 'dark';

  // Optimize navigation with InteractionManager
  const handlePress = useCallback(
    (id: string) => {
      // Use InteractionManager to defer navigation until current interactions complete
      InteractionManager.runAfterInteractions(() => {
        router.push(`/recipes/${id}`);
      });
    },
    [router]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await reloadRecipes();
    } catch (error) {
      console.error('Gagal refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [reloadRecipes]);

  // Optimize filtering with better memoization
  const filtered = useMemo(() => {
    if (!recipes.length) return [];
    
    const keyword = search.toLowerCase().trim();
    const categoryFilter = selectedCategory.toLowerCase().trim();
    
    return recipes.filter((recipe) => {
      // Early return for invalid recipes
      if (!recipe?.id || !recipe?.title) return false;
      
      // Search filter
      if (keyword && !recipe.title.toLowerCase().includes(keyword)) {
        return false;
      }
      
      // Category filter
      if (categoryFilter && recipe.category?.toLowerCase() !== categoryFilter) {
        return false;
      }
      
      return true;
    });
  }, [search, selectedCategory, recipes]);

  // Memoize render function to prevent recreation
  const renderRecipeCard = useCallback(
    ({ item }: { item: Recipe }) => (
      <MemoizedRecipeCard 
        item={item} 
        isDark={isDark} 
        onPress={() => handlePress(item.id)} 
      />
    ),
    [handlePress, isDark]
  );

  // Memoize keyExtractor
  const keyExtractor = useCallback((item: Recipe) => item.id, []);

  // Memoize column wrapper style
  const columnWrapperStyle = useMemo(() => ({
    justifyContent: 'space-between' as const,
    marginBottom: 12
  }), []);

  // Memoize FAB actions
  const fabActions = useMemo(() => [
    { 
      icon: 'book-outline' as const, 
      onPress: () => {
        InteractionManager.runAfterInteractions(() => {
          router.push('/recipes/recipeForm');
        });
      }
    },
    { 
      icon: 'cloud-upload-outline' as const, 
    onPress: () => 
      importFromCSV()
    
  }
  ], [router]);

  // Memoize styles to prevent recreation
  const overlayStyle = useMemo(() => ({
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    zIndex: 10,
  }), []);

  const searchBarContainerStyle = useMemo(() => ({
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: isDark ? '#0c0c0c' : '#fff',
  }), [isDark]);

  // Early return for empty state to avoid unnecessary renders
  const isEmpty = filtered.length === 0;

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark' : 'bg-white'}`}>
      <KeyboardAvoidingView
        behavior={KEYBOARD_BEHAVIOR}
        keyboardVerticalOffset={KEYBOARD_OFFSET}
        style={{ flex: 1 }}
      >
        <View className="flex-1 px-4 pt-4">
          {/* Header - memoized to prevent re-renders */}
          <View className="border-b mx-5 border-primary">
            <Text className="text-3xl px-5 py-3 rounded-3xl font-semibold text-primary dark:text-accent text-center">
              Daftar Resep
            </Text>
          </View>

          {/* Filter - memoized component */}
          <View className="flex-row justify-end items-center mt-4 mb-2">
            <MemoizedFilteredCategory 
              selected={selectedCategory} 
              onSelect={setSelectedCategory} 
            />
          </View>

          {/* Content */}
          {isEmpty ? (
            <Text className={`text-center italic mt-10 text-base ${isDark ? 'text-muted' : 'text-primary'}`}>
              Tidak ada hasil.
            </Text>
          ) : (
            <RefreshableFlatList
              data={filtered}
              keyExtractor={keyExtractor}
              numColumns={2}
              columnWrapperStyle={columnWrapperStyle}
              keyboardShouldPersistTaps="handled"
              isRefreshing={isRefreshing}
              onRefresh={handleRefresh}
              showsVerticalScrollIndicator={false}
              renderItem={renderRecipeCard}
              // Performance optimizations for FlatList
              removeClippedSubviews={true}
              maxToRenderPerBatch={6} // 3 rows of 2 items
              windowSize={10}
              initialNumToRender={6}
              updateCellsBatchingPeriod={50}
              // Optimize scrolling performance
              getItemLayout={undefined} // Let FlatList handle dynamic heights
            />
          )}
        </View>
      </KeyboardAvoidingView>

      {/* FAB - memoized component */}
      <View className="absolute bottom-10 right-6">
        <MemoizedFABAdd
          isFocused={isFocused}
          actions={fabActions}
        />
      </View>

      {/* Search Bar - memoized component */}
      <View className='pb-5'>
        <MemoizedSearchBar 
          placeholder="Cari resep..." 
          title="" 
          value={search} 
          onChangeText={setSearch} 
        />
      </View>
    </SafeAreaView>
  );
}