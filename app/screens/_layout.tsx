// app/(tabs)/_layout.tsx

import "../../global.css"
import { useColorScheme } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';

const MaterialTopTabs = createMaterialTopTabNavigator();
const Tabs = withLayoutContext(MaterialTopTabs.Navigator);

export default function TabsLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        swipeEnabled: true,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#111827' : '#FFFFFF',
        },
        tabBarActiveTintColor: colorScheme === 'dark' ? '#60A5FA' : '#2563EB',
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#9CA3AF' : '#6B7280',
        tabBarLabelStyle: {
          fontWeight: '600',
        },
        tabBarIndicatorStyle: {
          backgroundColor: colorScheme === 'dark' ? '#60A5FA' : '#2563EB',
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="recipes" options={{ title: 'Recipes' }} />
      <Tabs.Screen name="ingredientsSetUp" options={{ title: 'Ingredients' }} />
    </Tabs>
  );
}
