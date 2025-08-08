// app/components/RecipeGroupedByCategory.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RecipeCard from './RecipeCard';
import { Recipe } from 'context/RecipesContext'; // Ini udah bener kalau tipe Recipe ada di sini

type Props = {
  data: Recipe[]; // ❌ sebelumnya salah: `data: Recipe;` padahal harus array
  isDark: boolean;
  onPressRecipe: (id: string) => void;
};

const RecipeGroupedByCategory = ({ data, isDark, onPressRecipe }: Props) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  if (Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
  }

  const categories = Array.from(
    new Set(data.map((item) => item.category || 'Tanpa Kategori'))
  );

  const toggleCategory = (cat: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <View className="mt-4">
      {categories.map((cat) => {
        const filtered = data.filter((r) => r.category === cat);
        const isCollapsed = collapsed[cat];

        return (
          <View key={cat} className="mb-4">
            {/* Header Kategori */}
            <TouchableOpacity
              onPress={() => toggleCategory(cat)}
              className="flex-row justify-between items-center mb-2"
            >
              <Text className="text-lg font-semibold text-zinc-900 dark:text-white">
                {cat}
              </Text>
              <Ionicons
                name={isCollapsed ? 'chevron-down' : 'chevron-up'}
                size={20}
                color={isDark ? 'white' : 'black'}
              />
            </TouchableOpacity>

            {/* List Resep */}
            {!isCollapsed && (
              <View className="gap-y-4">
                {filtered.map((item) => (
                  <RecipeCard
                    key={item.id}
                    item={item}
                    isDark={isDark}
                    onPress={() => onPressRecipe(item.id)}
                  />
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default RecipeGroupedByCategory;
