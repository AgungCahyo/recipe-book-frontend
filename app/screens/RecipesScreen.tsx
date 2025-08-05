import React, { useCallback, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
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

export default function Recipes() {
  const { recipes, reloadRecipes } = useRecipes();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [isReady, setIsReady] = useState(false);
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const fabRef = useRef<{ reset: () => void }>(null);
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        await reloadRecipes();
        setIsReady(true);
      };
      load();
    }, [])
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

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
      .filter((r) => r.title.toLowerCase().includes(keyword));
  }, [search, recipes]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}

      >
        <View className=" px-4 pt-4">
          <SearchBar
            placeholder="Cari resep..."
            title="Daftar Resep"
            value={search}
            onChangeText={setSearch}
          />

          {filtered.length > 0 ? (
            <RefreshableFlatList
              data={filtered}
              keyExtractor={(item, index) => item?.id || index.toString()}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
              contentContainerStyle={{ paddingBottom: 160, paddingTop: 12 }}
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
              className={`text-center italic mt-10 text-base ${isDark ? 'text-gray-500' : 'text-gray-400'
                }`}
            >
              Tidak ada resep ditemukan.
            </Text>
          )}
        </View>

      </KeyboardAvoidingView>
      <View className="absolute bottom-6 right-6">
        <FABAdd
          actions={[
            {
              icon: 'book-outline',
              onPress: () => router.push('/recipes/recipeForm'),
            },
            {
              icon: 'leaf-outline',
              onPress: () => router.push('/ingredients/new'),
            },
            {
              icon: 'calculator-outline',
              onPress: () => console.log('Hitung HPP'),
            },
          ]}
        />
      </View>
    </SafeAreaView>
  );
}
