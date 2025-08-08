import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRecipes } from 'context/RecipesContext';
import { useIngredients } from 'context/IngredientsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import RecipeCard from 'app/components/RecipeCard';
import FilteredCategory from 'app/components/FilteredCategory';
import { usePersonalGreeting } from '../../hooks/personalGreetings';

type TabProps = {
  goToHome: () => void;
  goToRecipes: () => void;
  goToIngredients: () => void;
  isFocused: boolean;
};

export default function HomePage({ goToIngredients }: TabProps) {
  const router = useRouter();
  const { recipes } = useRecipes();
  const { ingredients } = useIngredients();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const recentRecipes = [...recipes].slice(-6).reverse();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { greetingMessage, joke, ageLabel } = usePersonalGreeting();

  const filteredRecipes = useMemo(() => {
    if (!selectedCategory || selectedCategory === '') return recentRecipes;
    return recentRecipes.filter((r) => r.category === selectedCategory);
  }, [recentRecipes, selectedCategory]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 80,
        paddingHorizontal: 20,
        paddingTop: 24,
      }}
      style={{
        flex: 1,
        backgroundColor: isDark ? '#101F24' : '#fff',
      }}
    >
      {/* Greeting */}
      <Text className="text-lg font-medium text-dark dark:text-accent mb-1">
        {greetingMessage}
      </Text>
      <Text className="text-xs italic text-primary dark:text-accent-dark mb-2">
          ({ageLabel})
        </Text>
  {/* Random Quote / Joke */}
      <View className="my-6 px-4 py-3 rounded-xl bg-accent dark:bg-dark">
        <Text className="text-sm text-primary dark:text-accent italic text-center">
          {joke}
        </Text>
      </View>
      <Text className="text-3xl font-bold text-primary dark:text-accent mb-1">
        Buku Resep Digital
      </Text>
      <Text className="text-base text-muted dark:text-accent-dark mb-6">
        Simpan, kelola, dan temukan resep favoritmu di satu tempat.
      </Text>

      {/* Stats */}
      <View className="flex-row gap-4 mb-6">
        <View className="flex-1 bg-accent dark:bg-dark border border-accent-dark dark:border-muted rounded-2xl p-4 shadow-sm">
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="book-outline" size={20} color="#204C4B" />
            <Text className="text-primary dark:text-accent text-sm">Total Resep</Text>
          </View>
          <Text className="text-2xl font-bold text-dark dark:text-accent">
            {recipes.length}
          </Text>
        </View>

        <View className="flex-1 bg-accent dark:bg-dark border border-accent-dark dark:border-muted rounded-2xl p-4 shadow-sm">
          <View className="flex-row items-center gap-2 mb-1">
            <Ionicons name="leaf-outline" size={20} color="#204C4B" />
            <Text className="text-primary dark:text-accent text-sm">Total Bahan</Text>
          </View>
          <Text className="text-2xl font-bold text-dark dark:text-accent">
            {ingredients.length}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View className='flex-row flex-1 gap-4 mb-6'>
        <TouchableOpacity
          onPress={() => router.push('/recipes/recipeForm')}
          className="flex-1 flex-row items-center justify-center gap-2 bg-primary py-3 rounded-2xl shadow-md"
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text className="text-white font-semibold">Tambah Resep</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goToIngredients}
          className="flex-1 flex-row items-center justify-center gap-2 bg-dark py-3 rounded-2xl shadow-md"
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text className="text-white font-semibold">Tambah Bahan</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <FilteredCategory
        selected={selectedCategory}
        onSelect={(cat) => setSelectedCategory(cat === selectedCategory ? '' : cat)}
      />

      {/* Resep Terbaru */}
      <Text className="text-lg font-semibold text-primary dark:text-accent mb-3">
        Resep Terbaru
      </Text>

      <View className="flex-row flex-wrap gap-4 justify-between">
        {filteredRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            item={recipe}
            isDark={isDark}
            onPress={() => router.push(`/recipes/${recipe.id}`)}
          />
        ))}
      </View>

    
    </ScrollView>
  );
}
