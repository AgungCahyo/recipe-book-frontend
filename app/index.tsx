// app/index.tsx

import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  InteractionManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRecipes } from 'context/RecipesContext';
import { useIngredients } from 'context/ingredients/IngredientsProvider';
import { Ionicons } from '@expo/vector-icons';
import RecipeCard from 'app/components/RecipeCard';
import FilteredCategory from 'app/components/FilteredCategory';
import { usePersonalGreeting } from '../hooks/personalGreetings';
import { useFocusEffect } from '@react-navigation/native';

type TabProps = {
  goToHome: () => void;
  goToRecipes: () => void; 
  goToIngredients: () => void;
  isFocused: boolean;
};

// Memoize components to prevent unnecessary re-renders
const MemoizedRecipeCard = memo(RecipeCard);
const MemoizedFilteredCategory = memo(FilteredCategory);

// Memoize static components
const StatCard = memo(({ icon, label, value, isDark }: {
  icon: string;
  label: string;
  value: number;
  isDark: boolean;
}) => (
  <View className="flex-1 bg-accent dark:bg-dark border border-accent-dark dark:border-muted rounded-2xl p-4 shadow-sm">
    <View className="flex-row items-center gap-2 mb-1">
      <Ionicons name={icon as any} size={20} color="#204C4B" />
      <Text className="text-primary dark:text-accent text-sm">{label}</Text>
    </View>
    <Text className="text-2xl font-bold text-dark dark:text-accent">
      {value}
    </Text>
  </View>
));

const QuickActionButton = memo(({ 
  onPress, 
  icon, 
  label, 
  bgClass,
  isDark 
}: {
  onPress: () => void;
  icon: string;
  label: string;
  bgClass: string;
  isDark: boolean;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-1 flex-row items-center justify-center gap-2 ${bgClass} py-3 rounded-2xl shadow-md`}
    activeOpacity={0.85}
  >
    <Ionicons name={icon as any} size={20} color="white" />
    <Text className="text-white font-semibold">{label}</Text>
  </TouchableOpacity>
));

const GreetingSection = memo(({ greetingMessage, ageLabel, joke }: {
  greetingMessage: string;
  ageLabel: string;
  joke: string;
}) => (
  <>
    <Text className="text-lg font-medium text-dark dark:text-accent mb-1">
      {greetingMessage}
    </Text>
    <Text className="text-xs italic text-primary dark:text-accent-dark mb-2">
      ({ageLabel})
    </Text>
    <View className="my-6 px-4 py-3 rounded-xl bg-accent dark:bg-dark">
      <Text className="text-sm text-primary dark:text-accent italic text-center">
        {joke}
      </Text>
    </View>
  </>
));

export default function HomePage({ goToIngredients }: TabProps) {
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused: HomeScreen');
    }, [])
  );

  const router = useRouter();
  const { recipes } = useRecipes();
  const { ingredients } = useIngredients();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { greetingMessage, joke, ageLabel } = usePersonalGreeting();

  // Optimize recent recipes calculation with memoization
  const recentRecipes = useMemo(() => {
    if (!recipes.length) return [];
    return [...recipes].slice(-6).reverse();
  }, [recipes]);

  // Optimize filtered recipes
  const filteredRecipes = useMemo(() => {
    if (!selectedCategory || selectedCategory === '') return recentRecipes;
    return recentRecipes.filter((recipe) => {
      return recipe.category?.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [recentRecipes, selectedCategory]);

  // Memoize stats to prevent unnecessary re-calculations
  const stats = useMemo(() => ({
    recipesCount: recipes.length,
    ingredientsCount: ingredients.length,
  }), [recipes.length, ingredients.length]);

  // Optimize navigation handlers with InteractionManager
  const handleAddRecipe = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      router.push('/recipePage');
    });
  }, [router]);

  const handleAddIngredient = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      router.push('../ingredientsPage');
    });
  }, [router]);

  const handleRecipePress = useCallback((recipeId: string) => {
    InteractionManager.runAfterInteractions(() => {
      router.push(`/recipes/${recipeId}`);
    });
  }, [router]);

  // Optimize category selection
  const handleCategorySelect = useCallback((cat: string) => {
    setSelectedCategory(cat === selectedCategory ? '' : cat);
  }, [selectedCategory]);

  // Memoize scroll view props
  const scrollViewProps = useMemo(() => ({
    showsVerticalScrollIndicator: false,
    contentContainerStyle: {
      paddingBottom: 80,
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    style: {
      flex: 1,
      backgroundColor: isDark ? '#101F24' : '#fff',
    },
  }), [isDark]);

  // Render recipe cards with memoization
  const renderRecipeCards = useMemo(() => {
    if (!filteredRecipes.length) {
      return (
        <View className="flex-1 items-center justify-center py-8">
          <Text className="text-center text-gray-500 italic">
            {selectedCategory 
              ? `Tidak ada resep dalam kategori "${selectedCategory}"`
              : "Belum ada resep terbaru"
            }
          </Text>
        </View>
      );
    }

    return filteredRecipes.map((recipe) => (
      <MemoizedRecipeCard
        key={recipe.id}
        item={recipe}
        isDark={isDark}
        onPress={() => handleRecipePress(recipe.id)}
        
      />
    ));
  }, [filteredRecipes, isDark, handleRecipePress, selectedCategory]);

  return (
    <ScrollView {...scrollViewProps}>
      {/* Greeting Section - Memoized */}
      <GreetingSection 
        greetingMessage={greetingMessage}
        ageLabel={ageLabel}
        joke={joke}
      />

      {/* App Title */}
      <Text className="text-3xl font-bold text-primary dark:text-accent mb-1">
        Buku Resep Digital
      </Text>
      <Text className="text-base text-muted dark:text-accent-dark mb-6">
        Simpan, kelola, dan temukan resep favoritmu di satu tempat.
      </Text>

      {/* Stats - Memoized */}
      <View className="flex-row gap-4 mb-6">
        <StatCard 
          icon="book-outline"
          label="Total Resep"
          value={stats.recipesCount}
          isDark={isDark}
        />
        <StatCard 
          icon="leaf-outline"
          label="Total Bahan"
          value={stats.ingredientsCount}
          isDark={isDark}
        />
      </View>

      {/* Quick Actions - Memoized */}
      <View className='flex-row flex-1 gap-4 mb-6'>
        <QuickActionButton
          onPress={handleAddRecipe}
          icon="add-circle-outline"
          label="Tambah Resep"
          bgClass="bg-primary"
          isDark={isDark}
        />
        <QuickActionButton
          onPress={handleAddIngredient}
          icon="add-circle-outline"
          label="Tambah Bahan"
          bgClass="bg-dark"
          isDark={isDark}
        />
      </View>

      {/* Filter Chips - Memoized */}
      <MemoizedFilteredCategory
        selected={selectedCategory}
        onSelect={handleCategorySelect}
      />

      {/* Section Title */}
      <Text className="text-lg font-semibold text-primary dark:text-accent mb-3">
        Resep Terbaru
      </Text>

      {/* Recipe Cards - Optimized rendering */}
      <View className="flex-row gap-4">
        {renderRecipeCards}
      </View>
    </ScrollView>
  );
}