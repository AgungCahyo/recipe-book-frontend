import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Animated,
  Easing,
} from 'react-native';
import { TabView } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

import HomePage from 'app/(tabs)/home';
import RecipesScreen from '../(tabs)/recipes';
import IngredientsScreen from '../(tabs)/ingredients';

export default function CustomTabs() {
  const insets = useSafeAreaInsets();
  const layout = useWindowDimensions();
  const tabWidth = layout.width / 3;
  const { colorScheme } = useColorScheme();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'home', title: 'Home', icon: 'home-outline' },
    { key: 'recipes', title: 'Resep', icon: 'book-outline' },
    { key: 'ingredients', title: 'Bahan', icon: 'leaf-outline' },
  ]);

  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: index * tabWidth,
      duration: 200,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [index]);

  const renderScene = ({ route }: { route: any }) => {
    const sharedProps = {
      goToHome: () => setIndex(0),
      goToRecipes: () => setIndex(1),
      goToIngredients: () => setIndex(2),
      isFocused: routes[index].key === route.key,
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
      keyboardVerticalOffset={60}
    >
      {/* Tambah class `dark` di root berdasarkan theme */}
      <View className={`flex-1 ${colorScheme === 'dark' ? 'dark' : ''}`}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={() => null}
          lazy
          lazyPreloadDistance={1}
          swipeEnabled={false}
        />

        {/* Custom Tab Bar */}
        <View className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-dark" style={{ height: 60 + insets.bottom, paddingBottom: insets.bottom }}>
          <View className="flex-row justify-around items-center relative h-full">
            {/* Animated Highlight Pill */}
            <Animated.View
              className="absolute top-2 left-0 h-11 mx-2 rounded-full bg-accent dark:bg-accent-dark"
              style={{
                width: tabWidth - 16,
                height: 45,
                transform: [{ translateX }],
              }}
            />

            {/* Tab Items */}
            {routes.map((route, i) => {
              const isActive = index === i;
              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={() => setIndex(i)}
                  style={{ width: tabWidth }}
                  className="items-center justify-center"
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={route.icon as any}
                    size={22}
                    className={isActive ? 'text-primary dark:text-primary-dark' : 'text-muted dark:text-muted-dark'}
                  />
                  <Text className={`text-xs mt-1 ${isActive ? 'text-primary dark:text-primary-dark' : 'text-muted dark:text-muted-dark'}`}>
                    {route.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
