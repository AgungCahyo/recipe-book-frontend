// app/(tabs)/_layout.tsx

import { Stack, Tabs } from 'expo-router';
import "../../global.css"
import { IngredientsProvider } from 'context/IngredientsContext';
import { Ionicons } from '@expo/vector-icons';
import { RecipesProvider } from 'context/RecipesContext';
import { Platform, useColorScheme } from 'react-native';


export default function TabsLayout() {
  const colorScheme = useColorScheme()
  return (

        <Tabs screenOptions={{ 
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colorScheme === 'dark' ? '#111827' : '#FFFFFF',
          },
          tabBarActiveTintColor: colorScheme === 'dark' ? '#60A5FA' : '#2563EB', 
          tabBarInactiveTintColor: colorScheme === 'dark' ? '#9CA3AF' : '#6B7280', 
        }} >
          <Tabs.Screen name="index" options={{
            title: 'Home', tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }} />
          <Tabs.Screen name="recipes" options={{
            title: 'Recipes', tabBarIcon: ({ color, size }) => (
              <Ionicons name="book-outline" size={size} color={color} />
            ),
          }} />
          <Tabs.Screen name="ingredientsSetUp" options={{
            title: 'Ingredients', tabBarIcon: ({ color, size }) => (
              <Ionicons name="leaf-outline" size={size} color={color} />
            ),
          }} />
        </Tabs>
  );
}
