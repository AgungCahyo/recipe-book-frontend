import React, { useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SceneMap, TabView } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from './screens/HomeScreen';
import RecipesScreen from './screens/RecipesScreen';
import IngredientsScreen from './screens/IngredientsScreen';

const renderScene = SceneMap({
    home: HomeScreen,
    recipes: RecipesScreen,
    ingredients: IngredientsScreen,
});

export default function CustomTabs() {
  const insets = useSafeAreaInsets();
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'home', title: 'Home', icon: 'home-outline' },
    { key: 'recipes', title: 'Recipes', icon: 'book-outline' },
    { key: 'ingredients', title: 'Ingredients', icon: 'leaf-outline' },
  ]);

  return (
    <View className="flex-1">
      {/* 🔹 Screen utama */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        swipeEnabled
        renderTabBar={() => null}
      />

      {/* 🔻 Custom Tab Bar */}
      <View
        style={{
          paddingBottom: insets.bottom,
          height: 56 + insets.bottom,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        }}
        className="flex-row justify-around items-center bg-white dark:bg-black"
      >
        {routes.map((route, i) => (
          <TouchableOpacity
            key={route.key}
            onPress={() => setIndex(i)}
            className="flex-1 items-center justify-center"
          >
            <Ionicons
              name={route.icon as any}
              size={22}
              color={index === i ? '#2563EB' : '#9CA3AF'}
            />
            <Text className={`text-xs mt-1 ${index === i ? 'text-blue-600' : 'text-gray-400'}`}>
              {route.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
