import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, FlatList,TextInput, KeyboardAvoidingView,Platform } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useRecipes } from 'context/RecipesContext';
import RecipeCard from 'app/components/RecipeCard';
import RecipeSearchBar from '../components/SearchBar';
import FABAdd from '../components/FABAdd';
import { useColorScheme } from 'react-native';
import SearchBar from '../components/SearchBar';

export default function Recipes() {
  const { recipes, reloadRecipes } = useRecipes();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [isReady, setIsReady] = useState(false);
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

  const filtered = useMemo(() => {
  const keyword = search.toLowerCase();
  return recipes
    .filter((r) => r && r.id && r.title)
    .filter((r) => r.title.toLowerCase().includes(keyword));
}, [search, recipes]);


  if (!isReady) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-400">Memuat resep...</Text>
      </View>
    );
  }

  return (
   <KeyboardAvoidingView
         className="flex-1 bg-white dark:bg-black"
         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
         keyboardVerticalOffset={80}
       >
        <SearchBar
        placeholder='Cari resep...'
        title='Daftar resep'
        value={search}
        onChangeText={setSearch}
        />

      {filtered.length > 0 ? (
        <FlatList
          data={filtered}
         keyExtractor={(item, index) => item?.id || index.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <RecipeCard item={item} isDark={isDark} onPress={() => router.push(`/recipes/${item.id}`)} />
          )}
        />
      ) : (
        <Text className={`text-center italic mt-10 text-base ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Tidak ada resep ditemukan.
        </Text>
      )}

      <FABAdd onPress={() => router.push('/recipes/recipeForm')} />
    </KeyboardAvoidingView>
  );
}
