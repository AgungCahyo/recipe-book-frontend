import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomePage from 'app/(tabs)/home';
import RecipesScreen from '../(tabs)/recipes';
import IngredientsScreen from '../(tabs)/ingredients';
import { BackHandler } from 'react-native';


export default function CustomTabs() {
  const insets = useSafeAreaInsets();
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'home', title: 'Home', icon: 'home-outline' },
    { key: 'recipes', title: 'Resep', icon: 'book-outline' },
    { key: 'ingredients', title: 'Bahan', icon: 'leaf-outline' },
  ]);

  const renderScene = ({ route }: { route: any }) => {
  const sharedProps = {
    goToHome: () => setIndex(0),
    goToRecipes: () => setIndex(1),
    goToIngredients: () => setIndex(2),
    isFocused: routes[index].key === route.key, // langsung boolean
  };

  switch (route.key) {
    case 'home':
      return <HomePage {...sharedProps} />;
    case 'recipes':
      return <RecipesScreen {...sharedProps} />;
    case 'ingredients':
      return <IngredientsScreen {...sharedProps} />;
    default:
      return null;
  }
};


  useEffect(() => {
    const onBackPress = () => {
      if (index > 0) {
        setIndex(index - 1);
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [index]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={60} // bisa disesuaikan kalau ada header
    >
      <View className="flex-1">
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={() => null}
          lazy
           lazyPreloadDistance={1} 
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
    </KeyboardAvoidingView>
  );
}
