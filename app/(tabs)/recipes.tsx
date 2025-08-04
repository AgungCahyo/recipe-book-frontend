import React, { useCallback, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useRecipes } from 'context/RecipesContext';
import RecipeCard from 'app/components/RecipeCard';
import RecipeSearchBar from '../components/RecipeSerachBar';
import FABAdd from '../components/FABAdd';
import { useColorScheme } from 'react-native';

export default function Recipes() {
  const { recipes, reloadRecipes } = useRecipes();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  useFocusEffect(useCallback(() => { reloadRecipes(); }, []));

  const filtered = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-[#F9FAFB]'} px-4 pt-6`}>
      <Text className={`text-3xl font-bold text-center mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        RESEP SAYA
      </Text>

      <RecipeSearchBar value={search} onChange={setSearch} isDark={isDark} />

      {filtered.length > 0 ? (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
          contentContainerStyle={{ paddingBottom: 120 }}
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
    </View>
  );
}
