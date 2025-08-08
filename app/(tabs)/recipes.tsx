

import React, { useCallback, useState, useMemo, useRef, } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useRecipes } from 'context/RecipesContext';
import RecipeCard from 'app/components/RecipeCard';
import SearchBar from '../components/SearchBar';
import FABAdd from '../components/FABAdd';
import { useColorScheme } from 'react-native';
import RefreshableFlatList from 'app/components/RefreshFlatList';
import FilteredCategory from 'app/components/FilteredCategory';

type TabProps = {
  goToHome: () => void;
  goToRecipes: () => void;
  goToIngredients: () => void;
  isFocused: boolean;
};

export default function Recipes({ goToHome, goToIngredients, isFocused }: TabProps) {
  const { recipes, reloadRecipes } = useRecipes();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const theme = useColorScheme();
  const isDark = theme === 'dark';


  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        await reloadRecipes();
        setIsReady(true);
      };
      load();
    }, [])
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await reloadRecipes();
    } catch (error) {
      console.error('Gagal refresh:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();

    return recipes
      .filter((r) => r && r.id && r.title)
      .filter((r) => r.title.toLowerCase().includes(keyword))
      .filter((r) =>
        selectedCategory ? r.category?.toLowerCase() === selectedCategory.toLowerCase() : true
      );
  }, [search, selectedCategory, recipes]);
console.log('render recipes page');
  return (
  <SafeAreaView className="flex-1 bg-[#fff] dark:bg-dark">
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={80}
    style={{ flex: 1 }}
  >
    <View className="flex-1 px-4 pt-4">
      <View className='border-b mx-5 border-primary'>
      
            <Text className="text-3xl px-5 py-3 rounded-3xl font-semibold text-primary dark:text-accent text-center">
             Dartar Resep
            </Text>
             </View>

      {/* Filter Kategori */}
      <View className="flex-row justify-end items-center mt-4 mb-2">
        <FilteredCategory
          selected={selectedCategory}
          onSelect={(cat) => setSelectedCategory(cat)}
        />
      </View>

      {/* Daftar Resep */}
      {filtered.length > 0 ? (
        <RefreshableFlatList
          data={filtered}
          keyExtractor={(item, index) => item?.id || index.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
          contentContainerStyle={{
            paddingBottom: 120, // Supaya gak ketimpa FAB + SearchBar
            paddingTop: 12,
          }}
          keyboardShouldPersistTaps="handled"
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <RecipeCard
              item={item}
              isDark={isDark}
              onPress={() => router.push(`/recipes/${item.id}`)}
            />
          )}
        />
      ) : (
        <Text
          className={`text-center italic mt-10 text-base ${
            isDark ? 'text-muted' : 'text-primary'
          }`}
        >
          Tidak ada hasil.
        </Text>
      )}
    </View>
  </KeyboardAvoidingView>

  {/* FAB */}
  <View className="absolute bottom-6 right-6">
    <FABAdd
      isFocused={isFocused}
      actions={[
        {
          icon: 'book-outline',
          onPress: () => router.push('/recipes/recipeForm'),
        },
      ]}
    />
  </View>

  {/* SearchBar fix di bawah layar */}
  <View className="pb-5">
    <SearchBar
      placeholder="Cari resep..."
      title=""
      value={search}
      onChangeText={setSearch}
    />
  </View>
</SafeAreaView>


  );
}
