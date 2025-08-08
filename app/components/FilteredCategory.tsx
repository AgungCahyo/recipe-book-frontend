import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { recipeCategories } from 'data/categories';

type Props = {
  selected: string;
  onSelect: (category: string) => void;
};

export default function FilteredCategory({ selected, onSelect }: Props) {
  const categories = [''].concat(recipeCategories); // '' untuk "Semua Kategori"

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-row gap-2 px-4 py-2"
    >
      {categories.map((cat, index) => {
        const isSelected = selected === cat;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => onSelect(cat)}
            className={`flex-row items-center px-4 py-2 rounded-full mr-3 ${
              isSelected
                ? 'bg-primary dark:bg-accent'
                : 'bg-accent dark:bg-neutral-900'
            }`}
          >
            <Text
              className={`text-sm  ${
                isSelected ? 'text-accent dark:text-primary' : 'text-primary dark:text-accent'
              }`}
            >
              {cat === '' ? 'Semua' : cat}
            </Text>
            {isSelected && (
              <Ionicons
                name="checkmark"
                size={14}
                color={isSelected ? '#fff' : '#4B5563'}
                style={{ marginLeft: 6 }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
