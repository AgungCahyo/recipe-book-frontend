import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRecipes } from 'context/RecipesContext';
import { useIngredients } from 'context/ingredients/IngredientsProvider';
import { Ionicons } from '@expo/vector-icons';
import RecipeCard from 'app/components/RecipeCard';
import { usePersonalGreeting } from '../../hooks/personalGreetings';
import Drawer from 'app/components/Drawer';
import LogoText from 'app/logo/Logo';

type TabProps = {
  goToHome: () => void;
  goToRecipes: () => void;
  goToIngredients: () => void;
  isFocused: boolean;
};

const MemoizedRecipeCard = memo(RecipeCard);

const StatCard = memo(({ icon, label, value, isDark }: {
  icon: string;
  label: string;
  value: number;
  isDark: boolean;
}) => (
  <View
    className={`flex-1 rounded-2xl p-4 shadow-sm border ${isDark ? 'bg-dark border-muted' : 'bg-accent border-dark'
      }`}
  >
    <View className="flex-row items-center gap-2 mb-1">
      <Ionicons name={icon as any} size={20} color={isDark ? '#F2E8DC' : '#204C4B'} />
      <Text className={`${isDark ? 'text-accent' : 'text-primary'} text-lg font-semibold`}>{label}</Text>
    </View>
    <Text className={`${isDark ? 'text-accent' : 'text-dark'} text-2xl font-bold`}>
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
    className={`flex-row justify-center py-3 gap-3 items-center flex-1 rounded-2xl ${bgClass}`}
    activeOpacity={0.85}
    style={{ minWidth: '45%' }}
  >
    <Ionicons name={icon as any} size={20} color="white" />
    <Text className="text-accent font-semibold">{label}</Text>
  </TouchableOpacity>
));


const GreetingSection = memo(({ greetingMessage, ageLabel, joke, isDark }: {
  greetingMessage: string;
  ageLabel: string;
  joke: string;
  isDark: boolean;
}) => (
  <>
    <Text className={`text-lg font-medium ${isDark ? 'text-accent' : 'text-dark'} mb-1`}>
      {greetingMessage}
    </Text>
    <Text className={`${isDark ? 'text-accent-dark' : 'text-dark'} text-xs italic mb-2`}>
      ({ageLabel})
    </Text>
    <View className={`${isDark ? 'bg-accent' : 'bg-primary'} my-6 px-4 py-3 rounded-xl`}>
      <Text className={`${isDark ? 'text-accent' : 'text-dark'} text-sm italic text-center`}>
        {joke}
      </Text>
    </View>
  </>
));


export default function HomePage({ goToIngredients }: TabProps) {
  const router = useRouter();
  const { recipes } = useRecipes();
  const { ingredients } = useIngredients();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { name, greetingMessage, joke, ageLabel } = usePersonalGreeting();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const recentRecipes = useMemo(() => {
    if (!recipes.length) return [];
    return [...recipes].slice(-6).reverse();
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    let base = selectedCategory
      ? recentRecipes.filter(recipe => recipe.category?.toLowerCase() === selectedCategory.toLowerCase())
      : recentRecipes;

    return base.slice(0, 6);
  }, [recentRecipes, selectedCategory]);

  const stats = useMemo(() => ({
    recipesCount: recipes.length,
    ingredientsCount: ingredients.length,
  }), [recipes.length, ingredients.length]);

  const handleAddRecipe = useCallback(() => {
    router.push('/main/recipes/recipeForm');
  }, [router]);

  const handleAddIngredient = useCallback(() => {
    router.push('/main/ingredients');
  }, [router]);

  const handleRecipePress = useCallback((recipeId: string) => {
    router.push(`/main/recipes/${recipeId}`);
  }, [router]);

  const handleCategorySelect = useCallback((cat: string) => {
    setSelectedCategory(cat === selectedCategory ? '' : cat);
  }, [selectedCategory]);

  const renderItem: ListRenderItem<typeof recipes[0]> = ({ item }) => (
    <MemoizedRecipeCard
      item={item}
      isDark={isDark}
      onPress={async () => {
        setLoadingId(item.id);
        await handleRecipePress(item.id);
        setLoadingId(null);
      }}
    />
  );

  return (
    <View className={`flex-1 ${isDark ? 'bg-dark' : 'bg-background-light'}`}>
      <View className='absolute right-0 top-0 px-5 py-5 z-[999]'>
        <TouchableOpacity
          onPress={() => setDrawerVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu" size={28} color="black" />
        </TouchableOpacity>
      </View>
      <Drawer
        isVisible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        items={[
          { label: 'Profile', icon: 'person-outline', onPress: () => router.push('/main/userProfile') },
          { label: 'Resep', icon: 'book-outline', onPress: () => router.push('/main/recipes') },
          { label: 'Bahan', icon: 'leaf-outline', onPress: () => router.push('/main/ingredients') },
        ]}
      />

      {/* HEADER FIXED */}
      <View className="px-5 pt-6">
        <GreetingSection
          greetingMessage={greetingMessage}
          ageLabel={ageLabel}
          joke={joke}
          isDark={isDark}
        />

        <Text className={`text-3xl font-bold ${isDark ? 'text-accent' : 'text-dark'} mb-1`}>
          Buku Resep Digital
        </Text>
        <Text className={`text-base mb-6 ${isDark ? 'text-accent-dark' : 'text-dark/50'}`}>
          Simpan, kelola, dan temukan resep favoritmu di satu tempat.
        </Text>

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

        <View className="flex-row justify-between gap-4 mb-5">
          <QuickActionButton
            onPress={handleAddRecipe}
            icon="add-circle-outline"
            label="Tambah Resep"
            bgClass={isDark ? 'bg-primary' : 'bg-primary'}
            isDark={isDark}
          />
          <QuickActionButton
            onPress={handleAddIngredient}
            icon="add-circle-outline"
            label="Tambah Bahan"
            bgClass={isDark ? 'bg-dark' : 'bg-dark'}
            isDark={isDark}
          />
        </View>

        <Text className={`text-lg font-semibold mt-5 mb-3 ${isDark ? 'text-accent' : 'text-primary'}`}>
          Resep Terbaru
        </Text>
      </View>
      {/* LIST SCROLLABLE */}
      <FlatList
        data={filteredRecipes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          marginBottom: 16,
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-8">
            <Text className={`text-center italic ${isDark ? 'text-accent-dark' : 'text-gray-500'}`}>
              {selectedCategory
                ? `Tidak ada resep dalam kategori "${selectedCategory}"`
                : 'Belum ada resep terbaru'}
            </Text>
          </View>
        )}
      />
    </View>

  );
}
