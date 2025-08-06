import React, { useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/HomeScreen';
import RecipesScreen from '../screens/RecipesScreen';
import IngredientsScreen from '../screens/IngredientsScreen';

const renderScene = ({ route }: { route: any }) => {
  switch (route.key) {
    case 'home':
      return <HomeScreen />;
    case 'recipes':
      return <RecipesScreen />;
    case 'ingredients':
      return <IngredientsScreen />;
    default:
      return null;
  }
};

export default function CustomTabs() {
  const insets = useSafeAreaInsets();
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'home', title: 'Home', icon: 'home-outline' },
    { key: 'recipes', title: 'Resep', icon: 'book-outline' },
    { key: 'ingredients', title: 'Bahan', icon: 'leaf-outline' },
  ]);

  return (
    <View className="flex-1">
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={() => null} // 👈 Supaya custom tab bar kamu yang dipakai
        lazy
      />

      {/* Custom Tab Bar */}
      <View
        style={{
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        }}
        className="flex-row justify-around items-center border-t border-gray-200 dark:border-zinc-700 bg-white dark:bg-black"
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
